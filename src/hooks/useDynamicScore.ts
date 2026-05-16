import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DynamicScoreData {
  auditScore: number;          // Score original de l'audit (fixe)
  estimatedScore: number;      // Score + bonus des actions complétées
  potentialScore: number;      // Score estimé + impact des actions restantes
  completedImpact: number;     // Points récupérés par les actions complétées
  remainingImpact: number;     // Points récupérables par les actions restantes
  completedActions: number;
  totalActions: number;
  isLoading: boolean;
}

export function useDynamicScore(
  organisationId: string | undefined,
  baseAuditScore: number,
  maxPossibleScore: number = 100
) {
  const [data, setData] = useState<DynamicScoreData>({
    auditScore: baseAuditScore,
    estimatedScore: baseAuditScore,
    potentialScore: baseAuditScore,
    completedImpact: 0,
    remainingImpact: 0,
    completedActions: 0,
    totalActions: 0,
    isLoading: true,
  });

  const calculateScores = useCallback(async () => {
    if (!organisationId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data: actions, error } = await supabase
        .from('corrective_actions')
        .select('status, impact_score')
        .eq('organisation_id', organisationId);

      if (error) throw error;

      const completedActions = actions?.filter(a => a.status === 'completed') || [];
      const pendingActions = actions?.filter(a => a.status !== 'completed') || [];

      const completedImpact = completedActions.reduce((sum, a) => sum + (a.impact_score || 0), 0);
      const remainingImpact = pendingActions.reduce((sum, a) => sum + (a.impact_score || 0), 0);

      // Le score estimé ne peut pas dépasser le max possible
      const estimatedScore = Math.min(baseAuditScore + completedImpact, maxPossibleScore);
      const potentialScore = Math.min(estimatedScore + remainingImpact, maxPossibleScore);

      setData({
        auditScore: baseAuditScore,
        estimatedScore,
        potentialScore,
        completedImpact,
        remainingImpact,
        completedActions: completedActions.length,
        totalActions: actions?.length || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error calculating dynamic scores:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [organisationId, baseAuditScore, maxPossibleScore]);

  // Initial load
  useEffect(() => {
    calculateScores();
  }, [calculateScores]);

  // Real-time subscription to corrective_actions changes
  useEffect(() => {
    if (!organisationId) return;

    const channel = supabase
      .channel(`corrective_actions_${organisationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'corrective_actions',
          filter: `organisation_id=eq.${organisationId}`,
        },
        () => {
          // Recalculate scores on any change
          calculateScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organisationId, calculateScores]);

  return {
    ...data,
    refresh: calculateScores,
  };
}
