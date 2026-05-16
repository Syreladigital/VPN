import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonthlyData {
  month: string;
  count: number;
  avg_score?: number;
}

interface SectorConformity {
  sector: string;
  audit_count: number;
  avg_score: number;
  min_score: number;
  max_score: number;
}

interface SectorBreachRate {
  sector: string;
  org_count: number;
  breach_count: number;
  breach_rate: number;
}

interface SectorSubprocessorUsage {
  sector: string;
  org_count: number;
  subprocessor_count: number;
  avg_subprocessors: number;
}

export interface AnonymizedStats {
  // Stats de base
  total_organisations: number;
  organisations_by_sector: Record<string, number> | null;
  organisations_by_size: Record<string, number> | null;
  total_audits: number;
  average_conformity_score: number;
  total_processing_records: number;
  total_data_breaches: number;
  data_breaches_by_status: Record<string, number> | null;
  total_rights_requests: number;
  rights_requests_by_status: Record<string, number> | null;
  total_subprocessors: number;
  total_users: number;
  users_by_role: Record<string, number> | null;
  
  // Tendances mensuelles
  monthly_organisations: MonthlyData[];
  monthly_audits: MonthlyData[];
  monthly_breaches: MonthlyData[];
  monthly_rights_requests: MonthlyData[];
  
  // Comparaisons sectorielles
  sector_conformity_scores: SectorConformity[];
  sector_breach_rates: SectorBreachRate[];
  sector_subprocessor_usage: SectorSubprocessorUsage[];
}

export function useAnonymizedStats() {
  const [stats, setStats] = useState<AnonymizedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_anonymized_statistics');

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques anonymisées",
          variant: "destructive"
        });
        return;
      }

      setStats(data as unknown as AnonymizedStats);
    } catch (err) {
      console.error('Erreur inattendue:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}
