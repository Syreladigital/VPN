import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FlashAuditAnswer, FlashAuditAlert, FlashAuditCategory } from '@/data/auditFlashPharmacie';

export interface FlashAuditResult {
  id: string;
  organisation_id: string;
  audit_type: string;
  completed_at: string;
  critical_count: number;
  sensitive_count: number;
  acceptable_count: number;
  total_alerts: number;
  answers: FlashAuditAnswer[];
  alerts: FlashAuditAlert[];
  flow_map: Record<FlashAuditCategory, { issues: number; questions: any[] }>;
  created_at: string;
  updated_at: string;
}

interface SaveFlashAuditParams {
  organisationId: string;
  auditType: string;
  answers: FlashAuditAnswer[];
  alerts: FlashAuditAlert[];
  flowMap: Record<FlashAuditCategory, { issues: number; questions: any[] }>;
  summary: {
    critical: number;
    sensitive: number;
    acceptable: number;
    total: number;
  };
}

export function useFlashAuditResults(organisationId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['flash-audit-results', organisationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flash_audit_results' as any)
        .select('*')
        .eq('organisation_id', organisationId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types
      return (data || []).map((row: any) => ({
        ...row,
        answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
        alerts: typeof row.alerts === 'string' ? JSON.parse(row.alerts) : row.alerts,
        flow_map: typeof row.flow_map === 'string' ? JSON.parse(row.flow_map) : row.flow_map,
      })) as FlashAuditResult[];
    },
    enabled: !!organisationId,
  });

  const saveMutation = useMutation({
    mutationFn: async (params: SaveFlashAuditParams) => {
      // Use raw SQL insert to avoid type issues with new table
      const insertData = {
        organisation_id: params.organisationId,
        audit_type: params.auditType,
        critical_count: params.summary.critical,
        sensitive_count: params.summary.sensitive,
        acceptable_count: params.summary.acceptable,
        total_alerts: params.summary.total,
        answers: JSON.stringify(params.answers),
        alerts: JSON.stringify(params.alerts),
        flow_map: JSON.stringify(params.flowMap),
      };

      const { data, error } = await supabase
        .from('flash_audit_results' as any)
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-audit-results', organisationId] });
      toast({
        title: "Audit Flash sauvegardé",
        description: "Les résultats ont été enregistrés dans l'historique.",
      });
    },
    onError: (error) => {
      console.error('Error saving flash audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'audit flash.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flash_audit_results' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-audit-results', organisationId] });
      toast({
        title: "Audit supprimé",
        description: "L'audit flash a été supprimé de l'historique.",
      });
    },
    onError: (error) => {
      console.error('Error deleting flash audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'audit flash.",
        variant: "destructive",
      });
    },
  });

  return {
    results: results || [],
    isLoading,
    error,
    saveFlashAudit: saveMutation.mutateAsync,
    deleteFlashAudit: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
