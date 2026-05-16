import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RightsRequest } from '@/types/documentation';
import { useToast } from '@/hooks/use-toast';

const NOTIFICATION_STATUSES = ['completed', 'rejected', 'in_progress'];

export function useRightsRequests(organisationId: string | undefined) {
  const [requests, setRequests] = useState<RightsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const fetchRequests = async () => {
    if (!organisationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('rights_requests')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes de droits',
        variant: 'destructive',
      });
    } else {
      setRequests(data.map(mapDbToRequest));
    }
    setLoading(false);
  };

  const createRequest = async (request: Omit<RightsRequest, 'id' | 'created_at' | 'updated_at'>) => {
    // Calculer automatiquement le délai de réponse (1 mois)
    const deadline = new Date(request.request_date);
    deadline.setMonth(deadline.getMonth() + 1);

    const { data, error } = await supabase
      .from('rights_requests')
      .insert({
        organisation_id: request.organisation_id,
        request_date: request.request_date.toISOString(),
        deadline: deadline.toISOString(),
        requester_name: request.requester_name,
        requester_email: request.requester_email,
        identity_verified: request.identity_verified,
        right_type: request.right_type,
        status: request.status,
        response_date: request.response_date?.toISOString(),
        response_content: request.response_content,
        notes: request.notes,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de droits',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Succès',
      description: 'Demande de droits enregistrée',
    });
    
    await fetchRequests();
    return mapDbToRequest(data);
  };

  const updateRequest = async (id: string, updates: Partial<RightsRequest>) => {
    const updateData: any = {};
    
    if (updates.request_date) updateData.request_date = updates.request_date.toISOString();
    if (updates.requester_name !== undefined) updateData.requester_name = updates.requester_name;
    if (updates.requester_email !== undefined) updateData.requester_email = updates.requester_email;
    if (updates.identity_verified !== undefined) updateData.identity_verified = updates.identity_verified;
    if (updates.right_type !== undefined) updateData.right_type = updates.right_type;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.response_date) updateData.response_date = updates.response_date.toISOString();
    if (updates.response_content !== undefined) updateData.response_content = updates.response_content;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase
      .from('rights_requests')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la demande',
        variant: 'destructive',
      });
      return false;
    }

    // Send notification email if status changed to a notification status
    if (updates.status && NOTIFICATION_STATUSES.includes(updates.status)) {
      // First check if notifications to requesters are enabled
      const { data: emailSettings } = await supabase
        .from('email_notification_settings')
        .select('notify_requester_on_status_change, enabled')
        .eq('organisation_id', organisationId)
        .maybeSingle();

      const shouldNotify = emailSettings?.enabled !== false && 
                          emailSettings?.notify_requester_on_status_change !== false;

      if (!shouldNotify) {
        toast({
          title: 'Succès',
          description: 'Demande mise à jour (notifications désactivées)',
        });
        await fetchRequests();
        return true;
      }

      // Find the current request to get requester info
      const currentRequest = requests.find(r => r.id === id);
      
      if (currentRequest?.requester_email) {
        try {
          // Get organisation name
          const { data: orgData } = await supabase
            .from('organisations')
            .select('name')
            .eq('id', organisationId)
            .maybeSingle();

          const { error: notifError } = await supabase.functions.invoke('send-rights-request-notification', {
            body: {
              requestId: id,
              requesterName: updates.requester_name || currentRequest.requester_name,
              requesterEmail: updates.requester_email || currentRequest.requester_email,
              rightType: updates.right_type || currentRequest.right_type,
              status: updates.status,
              responseContent: updates.response_content || currentRequest.response_content,
              organisationId: organisationId,
              organisationName: orgData?.name,
            },
          });

          if (notifError) {
            console.error('Error sending notification:', notifError);
            toast({
              title: 'Attention',
              description: 'Demande mise à jour, mais la notification email a échoué',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Succès',
              description: 'Demande mise à jour et notification envoyée au demandeur',
            });
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
          toast({
            title: 'Succès',
            description: 'Demande mise à jour (notification non envoyée)',
          });
        }
      } else {
        toast({
          title: 'Succès',
          description: 'Demande mise à jour (pas d\'email de contact)',
        });
      }
    } else {
      toast({
        title: 'Succès',
        description: 'Demande mise à jour',
      });
    }
    
    await fetchRequests();
    return true;
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase
      .from('rights_requests')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la demande',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Demande supprimée',
    });
    
    await fetchRequests();
    return true;
  };

  useEffect(() => {
    fetchRequests();
  }, [organisationId]);

  return { requests, loading, createRequest, updateRequest, deleteRequest, refetch: fetchRequests };
}

function mapDbToRequest(db: any): RightsRequest {
  return {
    id: db.id,
    organisation_id: db.organisation_id,
    request_date: new Date(db.request_date),
    deadline: db.deadline ? new Date(db.deadline) : undefined,
    requester_name: db.requester_name,
    requester_email: db.requester_email,
    identity_verified: db.identity_verified,
    right_type: db.right_type,
    status: db.status,
    response_date: db.response_date ? new Date(db.response_date) : undefined,
    response_content: db.response_content,
    notes: db.notes,
    created_at: new Date(db.created_at),
    updated_at: new Date(db.updated_at),
  };
}
