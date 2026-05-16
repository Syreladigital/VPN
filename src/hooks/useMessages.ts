import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRole } from './useRole';

export interface Message {
  id: string;
  organisation_id: string;
  sender_id: string;
  subject: string;
  content: string;
  is_from_consultant: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender_email?: string;
  organisation_name?: string;
}

export function useMessages(organisationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRole();

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (organisationId) {
        query = query.eq('organisation_id', organisationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, organisationId]);

  const sendMessage = async (
    targetOrganisationId: string,
    subject: string,
    content: string,
    isFromConsultant: boolean = false
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        organisation_id: targetOrganisationId,
        sender_id: user.id,
        subject,
        content,
        is_from_consultant: isFromConsultant,
      })
      .select()
      .single();

    if (error) throw error;

    // Send email notification
    try {
      await supabase.functions.invoke('send-message-notification', {
        body: {
          messageId: data.id,
          organisationId: targetOrganisationId,
          subject,
          isFromConsultant,
        },
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    await fetchMessages();
    return data;
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
    await fetchMessages();
  };

  const getUnreadCount = useCallback(() => {
    return messages.filter((m) => !m.read_at && !m.is_from_consultant).length;
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    getUnreadCount,
    refetch: fetchMessages,
  };
}
