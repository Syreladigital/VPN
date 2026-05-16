import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditAttempt, AuditAttemptSection, AuditAttemptAnswer, useAuditAttempts } from './useAuditAttempts';

export interface DashboardData {
  attempt: AuditAttempt | null;
  sections: AuditAttemptSection[];
  answers: AuditAttemptAnswer[];
  countsGlobal: {
    conforme: number;
    partiel: number;
    non_conforme: number;
  };
  highRiskCount: number;
  answeredQuestions: number;
  totalQuestions: number;
  hasCompletedAudit: boolean;
}

export function useAuditDashboard(organisationId: string | undefined, auditType?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    attempt: null,
    sections: [],
    answers: [],
    countsGlobal: { conforme: 0, partiel: 0, non_conforme: 0 },
    highRiskCount: 0,
    answeredQuestions: 0,
    totalQuestions: 0,
    hasCompletedAudit: false,
  });
  const [history, setHistory] = useState<AuditAttempt[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const { 
    getLatestCompletedAttempt, 
    getAttemptHistory, 
    getAttemptSections,
    getAttemptAnswers,
    deleteAttempt: deleteAttemptFromHook 
  } = useAuditAttempts();

  // Load dashboard data for a specific attempt or the latest one
  const loadDashboardData = useCallback(async (attemptId?: string) => {
    if (!organisationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let attempt: AuditAttempt | null = null;

      if (attemptId) {
        // Load specific attempt
        const { data, error } = await supabase
          .from('audit_attempts')
          .select('*')
          .eq('id', attemptId)
          .maybeSingle();

        if (!error && data) {
          attempt = {
            id: data.id,
            organisationId: data.organisation_id,
            auditType: data.audit_type,
            createdAt: new Date(data.created_at),
            completedAt: data.completed_at ? new Date(data.completed_at) : null,
            status: data.status as 'in_progress' | 'completed',
            scorePercent: data.score_percent,
            earned: Number(data.earned),
            possible: Number(data.possible),
            totalQuestions: data.total_questions,
            answeredQuestions: data.answered_questions,
          };
        }
      } else {
        // Load latest completed attempt
        attempt = await getLatestCompletedAttempt(organisationId, auditType);
      }

      if (attempt) {
        // Load sections and answers for this attempt in parallel
        const [sections, answers] = await Promise.all([
          getAttemptSections(attempt.id),
          getAttemptAnswers(attempt.id),
        ]);

        // Calculate global counts from sections
        let conforme = 0;
        let partiel = 0;
        let non_conforme = 0;
        let highRiskCount = 0;

        sections.forEach(section => {
          conforme += section.conformeCount;
          partiel += section.partielCount;
          non_conforme += section.nonConformeCount;
          highRiskCount += section.highRiskCount;
        });

        setDashboardData({
          attempt,
          sections,
          answers,
          countsGlobal: { conforme, partiel, non_conforme },
          highRiskCount,
          answeredQuestions: attempt.answeredQuestions,
          totalQuestions: attempt.totalQuestions,
          hasCompletedAudit: true,
        });
        setSelectedAttemptId(attempt.id);
      } else {
        setDashboardData({
          attempt: null,
          sections: [],
          answers: [],
          countsGlobal: { conforme: 0, partiel: 0, non_conforme: 0 },
          highRiskCount: 0,
          answeredQuestions: 0,
          totalQuestions: 0,
          hasCompletedAudit: false,
        });
        setSelectedAttemptId(null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organisationId, auditType, getLatestCompletedAttempt, getAttemptSections]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!organisationId) return;

    try {
      const attempts = await getAttemptHistory(organisationId, auditType);
      setHistory(attempts);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [organisationId, auditType, getAttemptHistory]);

  // Select a specific attempt from history
  const selectAttempt = useCallback((attemptId: string) => {
    loadDashboardData(attemptId);
  }, [loadDashboardData]);

  // Delete an attempt
  const deleteAttempt = useCallback(async (attemptId: string) => {
    const success = await deleteAttemptFromHook(attemptId);
    if (success) {
      // Reload history and dashboard
      await loadHistory();
      // If deleted the selected one, reload latest
      if (attemptId === selectedAttemptId) {
        await loadDashboardData();
      }
    }
    return success;
  }, [deleteAttemptFromHook, loadHistory, loadDashboardData, selectedAttemptId]);

  // Refresh data
  const refresh = useCallback(() => {
    loadDashboardData();
    loadHistory();
  }, [loadDashboardData, loadHistory]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
    loadHistory();
  }, [loadDashboardData, loadHistory]);

  return {
    isLoading,
    dashboardData,
    history,
    selectedAttemptId,
    selectAttempt,
    deleteAttempt,
    refresh,
  };
}
