import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addDays, addHours, differenceInHours, differenceInDays, isPast } from 'date-fns';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface Notification {
  id: string;
  organisation_id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  dismissed: boolean;
  due_date: Date | null;
  created_at: Date;
}

interface EmailNotificationSettings {
  enabled: boolean;
  email_recipients: string[];
  notify_breaches: boolean;
  notify_rights_requests: boolean;
  notify_subprocessors: boolean;
  notify_corrective_actions?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  generateDeadlineNotifications: (organisationId: string) => Promise<void>;
}

// Helper to send email notification
async function sendEmailNotification(
  notification: { title: string; message: string; severity: string; due_date?: string; type: string },
  settings: EmailNotificationSettings,
  organisationId: string,
  organisationName?: string
) {
  if (!settings.enabled || settings.email_recipients.length === 0) return;

  // Check if this notification type should trigger email
  const isBreachNotification = notification.type.includes('breach');
  const isRightsNotification = notification.type.includes('rights');
  const isSubprocessorNotification = notification.type.includes('subprocessor');
  const isCorrectiveActionNotification = notification.type.includes('corrective');

  if (isBreachNotification && !settings.notify_breaches) return;
  if (isRightsNotification && !settings.notify_rights_requests) return;
  if (isSubprocessorNotification && !settings.notify_subprocessors) return;
  if (isCorrectiveActionNotification && !settings.notify_corrective_actions) return;

  // Only send for critical and warning severity
  if (notification.severity === 'info') return;

  try {
    const alertType = isBreachNotification ? 'breach' : 
                      isRightsNotification ? 'rights_request' : 
                      isCorrectiveActionNotification ? 'corrective_action' : 'subprocessor';
    
    const formattedDeadline = notification.due_date 
      ? format(new Date(notification.due_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })
      : undefined;

    await supabase.functions.invoke('send-notification-email', {
      body: {
        recipients: settings.email_recipients,
        alertType,
        subject: `${notification.severity === 'critical' ? '🚨 URGENT' : '⚠️ Attention'} - ${notification.title}`,
        title: notification.title,
        message: notification.message,
        deadline: formattedDeadline,
        urgencyLevel: notification.severity,
        organisationName,
        organisationId,
      },
    });

    console.log('Email notification sent for:', notification.title);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

export function useNotifications(organisationId?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!organisationId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('organisation_id', organisationId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(
        (data || []).map((n: any) => ({
          ...n,
          due_date: n.due_date ? new Date(n.due_date) : null,
          created_at: new Date(n.created_at),
        }))
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  const generateDeadlineNotifications = useCallback(async (orgId: string) => {
    if (!orgId) return;

    try {
      // Fetch email settings
      const { data: emailSettings } = await supabase
        .from('email_notification_settings')
        .select('*')
        .eq('organisation_id', orgId)
        .maybeSingle();

      // Fetch organisation name for emails
      const { data: org } = await supabase
        .from('organisations')
        .select('name')
        .eq('id', orgId)
        .single();

      const settings: EmailNotificationSettings = emailSettings || {
        enabled: false,
        email_recipients: [],
        notify_breaches: true,
        notify_rights_requests: true,
        notify_subprocessors: true,
        notify_corrective_actions: true,
      };

      // Fetch data breaches
      const { data: breaches } = await supabase
        .from('data_breaches')
        .select('*')
        .eq('organisation_id', orgId)
        .eq('status', 'open');

      // Fetch rights requests
      const { data: requests } = await supabase
        .from('rights_requests')
        .select('*')
        .eq('organisation_id', orgId)
        .in('status', ['pending', 'in_progress']);

      // Fetch subprocessors
      const { data: subprocessors } = await supabase
        .from('subprocessors')
        .select('*')
        .eq('organisation_id', orgId)
        .eq('status', 'active');

      // Fetch corrective actions with deadlines
      const { data: correctiveActions } = await supabase
        .from('corrective_actions')
        .select('*')
        .eq('organisation_id', orgId)
        .in('status', ['pending', 'in_progress'])
        .not('due_date', 'is', null);

      // Fetch existing notifications to avoid duplicates
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('reference_id, type')
        .eq('organisation_id', orgId)
        .eq('dismissed', false);

      const existingRefs = new Set(
        (existingNotifications || []).map((n: any) => `${n.reference_id}_${n.type}`)
      );

      const notificationsToCreate: any[] = [];
      const now = new Date();

      // Check breach deadlines (72h from discovery)
      for (const breach of breaches || []) {
        const discoveryDate = new Date(breach.discovery_date);
        const deadline = addHours(discoveryDate, 72);
        const hoursRemaining = differenceInHours(deadline, now);

        if (!breach.cnil_notified) {
          if (isPast(deadline) && !existingRefs.has(`${breach.id}_breach_overdue`)) {
            notificationsToCreate.push({
              organisation_id: orgId,
              type: 'breach_overdue',
              title: '🚨 Délai CNIL dépassé',
              message: `La violation "${breach.nature}" a dépassé le délai de 72h pour notification à la CNIL.`,
              reference_id: breach.id,
              reference_type: 'data_breach',
              severity: 'critical',
              due_date: deadline.toISOString(),
            });
          } else if (hoursRemaining > 0 && hoursRemaining <= 24 && !existingRefs.has(`${breach.id}_breach_deadline`)) {
            notificationsToCreate.push({
              organisation_id: orgId,
              type: 'breach_deadline',
              title: '⚠️ Délai CNIL imminent',
              message: `Il reste ${hoursRemaining}h pour notifier la CNIL de la violation "${breach.nature}".`,
              reference_id: breach.id,
              reference_type: 'data_breach',
              severity: 'warning',
              due_date: deadline.toISOString(),
            });
          }
        }
      }

      // Check rights request deadlines (1 month)
      for (const request of requests || []) {
        const deadline = request.deadline ? new Date(request.deadline) : addDays(new Date(request.request_date), 30);
        const daysRemaining = differenceInDays(deadline, now);

        if (isPast(deadline) && !existingRefs.has(`${request.id}_rights_overdue`)) {
          notificationsToCreate.push({
            organisation_id: orgId,
            type: 'rights_overdue',
            title: '🚨 Délai de réponse dépassé',
            message: `La demande de ${request.requester_name} (${request.right_type}) a dépassé le délai légal d'1 mois.`,
            reference_id: request.id,
            reference_type: 'rights_request',
            severity: 'critical',
            due_date: deadline.toISOString(),
          });
        } else if (daysRemaining > 0 && daysRemaining <= 7 && !existingRefs.has(`${request.id}_rights_deadline`)) {
          notificationsToCreate.push({
            organisation_id: orgId,
            type: 'rights_deadline',
            title: '⚠️ Délai de réponse imminent',
            message: `Il reste ${daysRemaining} jour(s) pour répondre à la demande de ${request.requester_name}.`,
            reference_id: request.id,
            reference_type: 'rights_request',
            severity: 'warning',
            due_date: deadline.toISOString(),
          });
        }
      }

      // Check subprocessor review dates
      for (const sub of subprocessors || []) {
        if (sub.review_date) {
          const reviewDate = new Date(sub.review_date);
          const daysUntilReview = differenceInDays(reviewDate, now);

          if (isPast(reviewDate) && !existingRefs.has(`${sub.id}_subprocessor_overdue`)) {
            notificationsToCreate.push({
              organisation_id: orgId,
              type: 'subprocessor_overdue',
              title: '📋 Revue contrat en retard',
              message: `Le contrat avec "${sub.name}" devait être revu. Planifiez une revue.`,
              reference_id: sub.id,
              reference_type: 'subprocessor',
              severity: 'warning',
              due_date: reviewDate.toISOString(),
            });
          } else if (daysUntilReview > 0 && daysUntilReview <= 30 && !existingRefs.has(`${sub.id}_subprocessor_review`)) {
            notificationsToCreate.push({
              organisation_id: orgId,
              type: 'subprocessor_review',
              title: '📋 Revue contrat à venir',
              message: `Le contrat avec "${sub.name}" doit être revu dans ${daysUntilReview} jour(s).`,
              reference_id: sub.id,
              reference_type: 'subprocessor',
              severity: 'info',
              due_date: reviewDate.toISOString(),
            });
          }
        }
      }

      // Check corrective actions deadlines
      for (const action of correctiveActions || []) {
        if (action.due_date) {
          const deadline = new Date(action.due_date);
          const daysRemaining = differenceInDays(deadline, now);

          if (isPast(deadline) && !existingRefs.has(`${action.id}_corrective_overdue`)) {
            notificationsToCreate.push({
              organisation_id: orgId,
              type: 'corrective_overdue',
              title: '🚨 Action corrective en retard',
              message: `L'action "${action.title}" a dépassé son échéance.`,
              reference_id: action.id,
              reference_type: 'corrective_action',
              severity: 'critical',
              due_date: deadline.toISOString(),
            });
          } else if (daysRemaining > 0 && daysRemaining <= 7 && !existingRefs.has(`${action.id}_corrective_deadline`)) {
            const severity = daysRemaining <= 3 ? 'warning' : 'info';
            notificationsToCreate.push({
              organisation_id: orgId,
              type: 'corrective_deadline',
              title: daysRemaining <= 3 ? '⚠️ Échéance action imminente' : '📋 Échéance action à venir',
              message: `L'action "${action.title}" arrive à échéance dans ${daysRemaining} jour(s).`,
              reference_id: action.id,
              reference_type: 'corrective_action',
              severity,
              due_date: deadline.toISOString(),
            });
          }
        }
      }

      // Insert new notifications and send emails
      if (notificationsToCreate.length > 0) {
        const { error } = await supabase.from('notifications').insert(notificationsToCreate);
        if (error) throw error;

        // Send email for each critical/warning notification
        for (const notification of notificationsToCreate) {
          await sendEmailNotification(notification, settings, orgId, org?.name);
        }

        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!organisationId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('organisation_id', organisationId)
        .eq('read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ dismissed: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-generate notifications when org changes
  useEffect(() => {
    if (organisationId) {
      generateDeadlineNotifications(organisationId);
    }
  }, [organisationId, generateDeadlineNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refreshNotifications: fetchNotifications,
    generateDeadlineNotifications,
  };
}