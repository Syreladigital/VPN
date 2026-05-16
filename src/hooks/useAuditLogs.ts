import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string;
  organisation_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  user_name?: string;
  organisation_name?: string;
}

interface UseAuditLogsFilters {
  tableName?: string;
  action?: string;
  organisationId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export const useAuditLogs = (initialFilters?: UseAuditLogsFilters) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (filters?: UseAuditLogsFilters) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.tableName) {
        query = query.eq("table_name", filters.tableName);
      }
      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.organisationId) {
        query = query.eq("organisation_id", filters.organisationId);
      }
      if (filters?.startDate) {
        query = query.gte("timestamp", filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte("timestamp", filters.endDate.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Enrich with user names and org names
      const enrichedLogs: AuditLog[] = [];
      const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean))];
      const orgIds = [...new Set((data || []).map(l => l.organisation_id).filter(Boolean))];

      // Fetch user profiles
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);
        
        userMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Utilisateur";
          return acc;
        }, {} as Record<string, string>);
      }

      // Fetch organisation names
      let orgMap: Record<string, string> = {};
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organisations")
          .select("id, name")
          .in("id", orgIds);
        
        orgMap = (orgs || []).reduce((acc, o) => {
          acc[o.id] = o.name;
          return acc;
        }, {} as Record<string, string>);
      }

      for (const log of data || []) {
        enrichedLogs.push({
          ...log,
          action: log.action as "CREATE" | "UPDATE" | "DELETE",
          old_data: log.old_data as Record<string, unknown> | null,
          new_data: log.new_data as Record<string, unknown> | null,
          user_name: log.user_id ? userMap[log.user_id] : undefined,
          organisation_name: log.organisation_id ? orgMap[log.organisation_id] : undefined,
        });
      }

      setLogs(enrichedLogs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Erreur lors du chargement des logs d'audit");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(initialFilters);
  }, []);

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  };
};
