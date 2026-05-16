import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailNotificationSettings {
  id: string;
  organisation_id: string;
  email_recipients: string[];
  notify_breaches: boolean;
  notify_rights_requests: boolean;
  notify_subprocessors: boolean;
  notify_corrective_actions: boolean;
  notify_requester_on_status_change: boolean;
  breach_reminder_hours: number;
  rights_reminder_days: number;
  subprocessor_reminder_days: number;
  enabled: boolean;
  sender_name: string;
  reply_to_email: string | null;
  // Rights request email templates
  rights_email_subject_template: string | null;
  rights_email_body_template: string | null;
  rights_email_completed_message: string | null;
  rights_email_rejected_message: string | null;
  rights_email_in_progress_message: string | null;
  // Data breach email templates
  breach_email_subject_template: string | null;
  breach_email_body_template: string | null;
  // Subprocessor email templates
  subprocessor_email_subject_template: string | null;
  subprocessor_email_body_template: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseEmailNotificationSettingsReturn {
  settings: EmailNotificationSettings | null;
  loading: boolean;
  saving: boolean;
  fetchSettings: () => Promise<void>;
  saveSettings: (settings: Partial<EmailNotificationSettings>) => Promise<void>;
  sendTestEmail: (email: string) => Promise<boolean>;
}

export const useEmailNotificationSettings = (organisationId?: string): UseEmailNotificationSettingsReturn => {
  const [settings, setSettings] = useState<EmailNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!organisationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_notification_settings')
        .select('*')
        .eq('organisation_id', organisationId)
        .maybeSingle();

      if (error) throw error;
      
      setSettings(data as EmailNotificationSettings | null);
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  const saveSettings = async (newSettings: Partial<EmailNotificationSettings>) => {
    if (!organisationId) return;

    try {
      setSaving(true);

      if (settings?.id) {
        const { error } = await supabase
          .from('email_notification_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_notification_settings')
          .insert({
            organisation_id: organisationId,
            ...newSettings,
          });

        if (error) throw error;
      }

      await fetchSettings();
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de notification par email ont été mis à jour.",
      });
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async (email: string): Promise<boolean> => {
    try {
      // Get organisation name for the email
      const { data: orgData } = await supabase
        .from('organisations')
        .select('name')
        .eq('id', organisationId)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke('send-rights-request-notification', {
        body: {
          requestId: 'notification-directe',
          requesterName: 'Client',
          requesterEmail: email,
          rightType: "droit d'accès",
          status: 'completed',
          responseContent: 'Votre demande a été traitée avec succès. Les informations demandées sont disponibles.',
          organisationId: organisationId,
          organisationName: orgData?.name || 'Notre organisation',
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Email envoyé",
          description: `Email de notification envoyé à ${email}`,
        });
        return true;
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error sending notification email:', error);
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Impossible d'envoyer l'email de notification.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    fetchSettings,
    saveSettings,
    sendTestEmail,
  };
};
