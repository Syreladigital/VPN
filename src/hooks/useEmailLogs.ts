import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailLog {
  id: string;
  organisation_id: string;
  notification_id: string | null;
  recipients: string[];
  subject: string;
  alert_type: string;
  status: string;
  error_message: string | null;
  sent_at: string;
}

export function useEmailLogs(organisationId?: string) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!organisationId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('organisation_id', organisationId)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
