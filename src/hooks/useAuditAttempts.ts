import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sector } from '@/types/rgpd';
import { QuestionnaireSection } from '@/types/conditionalQuestionnaire';
import { computeAuditResults, AuditResults } from '@/lib/computeAuditResults';

export interface AuditAttempt {
  id: string;
  organisationId: string;
  auditType: string;
  createdAt: Date;
  completedAt: Date | null;
  status: 'in_progress' | 'completed';
  scorePercent: number;
  earned: number;
  possible: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export interface AuditAttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedValue: string | null;
  score: number;
  maxScore: number;
  riskLevel: string | null;
  sectionId: string;
  isCritical: boolean;
  notes: string | null;
}

export interface AuditAttemptSection {
  id: string;
  attemptId: string;
  sectionId: string;
  sectionTitle: string;
  earned: number;
  possible: number;
  percent: number;
  conformStatus: 'conforme' | 'partiel' | 'non_conforme';
  conformeCount: number;
  partielCount: number;
  nonConformeCount: number;
  highRiskCount: number;
}

export function useAuditAttempts() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  /**
   * Get the latest completed attempt for an organisation
   */
  const getLatestCompletedAttempt = useCallback(async (
    organisationId: string,
    auditType?: string
  ): Promise<AuditAttempt | null> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_attempts')
        .select('*')
        .eq('organisation_id', organisationId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (auditType) {
        query = query.eq('audit_type', auditType);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) return null;

      return {
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
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all completed attempts for an organisation (for history)
   */
  const getAttemptHistory = useCallback(async (
    organisationId: string,
    auditType?: string
  ): Promise<AuditAttempt[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_attempts')
        .select('*')
        .eq('organisation_id', organisationId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (auditType) {
        query = query.eq('audit_type', auditType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        organisationId: d.organisation_id,
        auditType: d.audit_type,
        createdAt: new Date(d.created_at),
        completedAt: d.completed_at ? new Date(d.completed_at) : null,
        status: d.status as 'in_progress' | 'completed',
        scorePercent: d.score_percent,
        earned: Number(d.earned),
        possible: Number(d.possible),
        totalQuestions: d.total_questions,
        answeredQuestions: d.answered_questions,
      }));
    } catch (error) {
      console.error('Error fetching attempt history:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get section scores for a specific attempt
   */
  const getAttemptSections = useCallback(async (
    attemptId: string
  ): Promise<AuditAttemptSection[]> => {
    try {
      const { data, error } = await supabase
        .from('audit_attempt_sections')
        .select('*')
        .eq('attempt_id', attemptId);

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        attemptId: d.attempt_id,
        sectionId: d.section_id,
        sectionTitle: d.section_title,
        earned: Number(d.earned),
        possible: Number(d.possible),
        percent: d.percent,
        conformStatus: d.conform_status as 'conforme' | 'partiel' | 'non_conforme',
        conformeCount: d.conforme_count,
        partielCount: d.partiel_count,
        nonConformeCount: d.non_conforme_count,
        highRiskCount: d.high_risk_count,
      }));
    } catch (error) {
      console.error('Error fetching attempt sections:', error);
      return [];
    }
  }, []);

  /**
   * Get answers for a specific attempt
   */
  const getAttemptAnswers = useCallback(async (
    attemptId: string
  ): Promise<AuditAttemptAnswer[]> => {
    try {
      const { data, error } = await supabase
        .from('audit_attempt_answers')
        .select('*')
        .eq('attempt_id', attemptId);

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        attemptId: d.attempt_id,
        questionId: d.question_id,
        selectedValue: d.selected_value,
        score: Number(d.score),
        maxScore: Number(d.max_score),
        riskLevel: d.risk_level,
        sectionId: d.section_id,
        isCritical: d.is_critical || false,
        notes: d.notes,
      }));
    } catch (error) {
      console.error('Error fetching attempt answers:', error);
      return [];
    }
  }, []);

  /**
   * Get or create an in-progress attempt
   */
  const getOrCreateAttempt = useCallback(async (
    organisationId: string,
    auditType: string
  ): Promise<string | null> => {
    try {
      // Check for existing in-progress attempt
      const { data: existing, error: fetchError } = await supabase
        .from('audit_attempts')
        .select('id')
        .eq('organisation_id', organisationId)
        .eq('audit_type', auditType)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!fetchError && existing) {
        return existing.id;
      }

      // Create new attempt
      const { data: newAttempt, error: createError } = await supabase
        .from('audit_attempts')
        .insert({
          organisation_id: organisationId,
          audit_type: auditType,
          status: 'in_progress',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      return newAttempt?.id || null;
    } catch (error) {
      console.error('Error getting/creating attempt:', error);
      return null;
    }
  }, []);

  /**
   * Complete an audit attempt - save all answers, scores AND persist to audit_results
   * CRITICAL: This is the ONLY place where audit results are calculated and saved
   */
  const completeAuditAttempt = useCallback(async (
    organisationId: string,
    sector: Sector,
    sections: QuestionnaireSection[],
    answers: Record<string, string | boolean | string[]>,
    notes: Record<string, string>
  ): Promise<{ success: boolean; attemptId: string | null; results: AuditResults | null }> => {
    setIsSaving(true);
    try {
      const auditType = `rgpd_${sector}`;
      
      // Compute results ONCE - this is the only calculation
      const results = computeAuditResults(sections, answers);
      const completedAt = new Date().toISOString();

      // Create new attempt (always create new for completed audits)
      const { data: attemptData, error: attemptError } = await supabase
        .from('audit_attempts')
        .insert({
          organisation_id: organisationId,
          audit_type: auditType,
          status: 'completed',
          completed_at: completedAt,
          score_percent: results.globalPercent,
          earned: results.earned,
          possible: results.possible,
          total_questions: results.totalQuestions,
          answered_questions: results.answeredQuestions,
        })
        .select('id')
        .single();

      if (attemptError) throw attemptError;
      const attemptId = attemptData.id;

      // Save answers
      const answersToInsert = results.questionResults.map(qr => ({
        attempt_id: attemptId,
        question_id: qr.questionId,
        selected_value: qr.selectedValue,
        score: qr.score,
        max_score: qr.maxScore,
        risk_level: qr.riskLevel,
        section_id: qr.sectionId,
        is_critical: qr.isCritical,
        notes: notes[qr.questionId] || null,
      }));

      if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase
          .from('audit_attempt_answers')
          .insert(answersToInsert);

        if (answersError) throw answersError;
      }

      // Save section scores
      const sectionsToInsert = results.sectionsList.map(sr => ({
        attempt_id: attemptId,
        section_id: sr.sectionId,
        section_title: sr.sectionTitle,
        earned: sr.earned,
        possible: sr.possible,
        percent: sr.percent,
        conform_status: sr.conformStatus,
        conforme_count: sr.conformeCount,
        partiel_count: sr.partielCount,
        non_conforme_count: sr.nonConformeCount,
        high_risk_count: sr.highRiskCount,
      }));

      if (sectionsToInsert.length > 0) {
        const { error: sectionsError } = await supabase
          .from('audit_attempt_sections')
          .insert(sectionsToInsert);

        if (sectionsError) throw sectionsError;
      }

      // CRITICAL: Save to audit_results - single source of truth
      // This is persisted ONCE and read everywhere
      const { error: resultsError } = await supabase
        .from('audit_results')
        .insert({
          organisation_id: organisationId,
          attempt_id: attemptId,
          audit_type: auditType,
          compliance_score: results.globalPercent,
          earned: results.earned,
          possible: results.possible,
          conforme_count: results.countsGlobal.conforme,
          partiel_count: results.countsGlobal.partiel,
          non_conforme_count: results.countsGlobal.non_conforme,
          risks_high: results.highRiskCount,
          risks_medium: results.mediumRiskCount,
          risks_low: results.lowRiskCount,
          actions_total: 0, // Actions are tracked separately
          actions_completed: 0,
          total_questions: results.totalQuestions,
          answered_questions: results.answeredQuestions,
          is_latest: true, // Trigger will handle setting previous to false
          completed_at: completedAt,
        });

      if (resultsError) {
        console.error('Error saving to audit_results:', resultsError);
        // Don't throw - audit was still saved to attempts/sections
      }

      toast({
        title: "Audit terminé",
        description: `Score de conformité: ${results.globalPercent}%`,
      });

      return { success: true, attemptId, results };
    } catch (error) {
      console.error('Error completing audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'audit",
        variant: "destructive",
      });
      return { success: false, attemptId: null, results: null };
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  /**
   * Delete an attempt (for history management)
   */
  const deleteAttempt = useCallback(async (attemptId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_attempts')
        .delete()
        .eq('id', attemptId);

      if (error) throw error;

      toast({
        title: "Supprimé",
        description: "L'historique a été supprimé",
      });
      return true;
    } catch (error) {
      console.error('Error deleting attempt:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'historique",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    isLoading,
    isSaving,
    getLatestCompletedAttempt,
    getAttemptHistory,
    getAttemptSections,
    getAttemptAnswers,
    getOrCreateAttempt,
    completeAuditAttempt,
    deleteAttempt,
  };
}
