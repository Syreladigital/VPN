import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLogDetails {
  old_role?: string;
  new_role?: string;
  deleted_email?: string;
  [key: string]: unknown;
}

export interface ActivityLog {
  id: string;
  actor_id: string;
  actor_name?: string;
  action_type: string;
  target_user_id: string | null;
  target_name?: string;
  details: ActivityLogDetails;
  created_at: string;
}

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch actor and target names
      const userIds = new Set<string>();
      (data || []).forEach((log) => {
        userIds.add(log.actor_id);
        if (log.target_user_id) userIds.add(log.target_user_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(
        (profiles || []).map((p) => [
          p.user_id,
          `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Utilisateur',
        ])
      );

      const enrichedLogs: ActivityLog[] = (data || []).map((log) => ({
        ...log,
        details: (log.details as Record<string, unknown>) || {},
        actor_name: profileMap.get(log.actor_id) || 'Inconnu',
        target_name: log.target_user_id
          ? profileMap.get(log.target_user_id) || 'Inconnu'
          : undefined,
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logActivity = useCallback(
    async (
      actionType: string,
      targetUserId?: string,
      details?: ActivityLogDetails
    ) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const insertData: {
          actor_id: string;
          action_type: string;
          target_user_id: string | null;
          details: Json;
        } = {
          actor_id: user.id,
          action_type: actionType,
          target_user_id: targetUserId || null,
          details: details ? JSON.parse(JSON.stringify(details)) : {},
        };
        
        const { error } = await supabase.from('admin_activity_logs').insert([insertData]);

        if (error) throw error;

        // Refresh logs
        fetchLogs();
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    },
    [fetchLogs]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    logActivity,
    refresh: fetchLogs,
  };
};
