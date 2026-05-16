/**
 * useAuditResults - Hook pour lire les résultats d'audit persistés
 * 
 * RÈGLE CRITIQUE: Ce hook ne fait que LIRE les données de la table audit_results.
 * Il ne recalcule JAMAIS les scores ou compteurs.
 * La source unique de vérité est la table audit_results.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditAttemptSection } from './useAuditAttempts';
import type { SyncStatus } from '@/components/SyncIndicator';

// Re-export for convenience
export type { AuditAttemptSection };

export interface AuditResultsData {
  id: string;
  organisationId: string;
  attemptId: string;
  auditType: string;
  
  // Scores persistés
  complianceScore: number;
  earned: number;
  possible: number;
  
  // Compteurs de conformité persistés
  conformeCount: number;
  partielCount: number;
  nonConformeCount: number;
  
  // Compteurs de risques persistés
  risksHigh: number;
  risksMedium: number;
  risksLow: number;
  
  // Compteurs d'actions persistés
  actionsTotal: number;
  actionsCompleted: number;
  
  // Questions
  totalQuestions: number;
  answeredQuestions: number;
  
  // Métadonnées
  isLatest: boolean;
  completedAt: Date;
  createdAt: Date;
  
  // Sections détaillées (chargées séparément)
  sections: AuditAttemptSection[];
  
  // Flag pour savoir si on a des données
  hasCompletedAudit: boolean;
}

const EMPTY_RESULTS: AuditResultsData = {
  id: '',
  organisationId: '',
  attemptId: '',
  auditType: '',
  complianceScore: 0,
  earned: 0,
  possible: 0,
  conformeCount: 0,
  partielCount: 0,
  nonConformeCount: 0,
  risksHigh: 0,
  risksMedium: 0,
  risksLow: 0,
  actionsTotal: 0,
  actionsCompleted: 0,
  totalQuestions: 0,
  answeredQuestions: 0,
  isLatest: false,
  completedAt: new Date(),
  createdAt: new Date(),
  sections: [],
  hasCompletedAudit: false,
};

export function useAuditResults(organisationId: string | undefined, auditType?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<AuditResultsData>(EMPTY_RESULTS);
  const [history, setHistory] = useState<AuditResultsData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | undefined>();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /**
   * Charge le dernier résultat d'audit pour l'organisation
   * LECTURE SEULE - pas de recalcul
   */
  const loadLatestResults = useCallback(async (silent = false) => {
    if (!organisationId) {
      setResults(EMPTY_RESULTS);
      setIsLoading(false);
      setSyncStatus('synced');
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    setSyncStatus('syncing');
    
    try {
      // Requête pour le dernier résultat (is_latest = true)
      let query = supabase
        .from('audit_results')
        .select('*')
        .eq('organisation_id', organisationId)
        .eq('is_latest', true);

      if (auditType) {
        query = query.eq('audit_type', auditType);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error loading audit results:', error);
        setResults(EMPTY_RESULTS);
        setSyncStatus('error');
        return;
      }

      if (!data) {
        // Aucun audit complété - essayer de charger depuis audit_attempts comme fallback
        await loadFromLegacyAttempts();
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
        return;
      }

      // Charger les sections pour ce résultat
      const sections = await loadSections(data.attempt_id);

      setResults({
        id: data.id,
        organisationId: data.organisation_id,
        attemptId: data.attempt_id,
        auditType: data.audit_type,
        complianceScore: data.compliance_score,
        earned: Number(data.earned),
        possible: Number(data.possible),
        conformeCount: data.conforme_count,
        partielCount: data.partiel_count,
        nonConformeCount: data.non_conforme_count,
        risksHigh: data.risks_high,
        risksMedium: data.risks_medium,
        risksLow: data.risks_low,
        actionsTotal: data.actions_total,
        actionsCompleted: data.actions_completed,
        totalQuestions: data.total_questions,
        answeredQuestions: data.answered_questions,
        isLatest: data.is_latest,
        completedAt: new Date(data.completed_at),
        createdAt: new Date(data.created_at),
        sections,
        hasCompletedAudit: true,
      });
      
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error('Error in loadLatestResults:', error);
      setResults(EMPTY_RESULTS);
      setSyncStatus('error');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [organisationId, auditType]);

  /**
   * Fallback: charger depuis les anciennes tables audit_attempts si audit_results est vide
   * Ceci permet la rétrocompatibilité avec les audits existants
   */
  const loadFromLegacyAttempts = useCallback(async () => {
    if (!organisationId) return;

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

      const { data: attempt, error } = await query.maybeSingle();

      if (error || !attempt) {
        setResults(EMPTY_RESULTS);
        return;
      }

      // Charger les sections depuis audit_attempt_sections
      const sections = await loadSections(attempt.id);

      // Calculer les compteurs depuis les sections
      let conformeCount = 0;
      let partielCount = 0;
      let nonConformeCount = 0;
      let risksHigh = 0;

      sections.forEach(section => {
        conformeCount += section.conformeCount;
        partielCount += section.partielCount;
        nonConformeCount += section.nonConformeCount;
        risksHigh += section.highRiskCount;
      });

      setResults({
        id: attempt.id,
        organisationId: attempt.organisation_id,
        attemptId: attempt.id,
        auditType: attempt.audit_type,
        complianceScore: attempt.score_percent,
        earned: Number(attempt.earned),
        possible: Number(attempt.possible),
        conformeCount,
        partielCount,
        nonConformeCount,
        risksHigh,
        risksMedium: 0,
        risksLow: 0,
        actionsTotal: 0,
        actionsCompleted: 0,
        totalQuestions: attempt.total_questions,
        answeredQuestions: attempt.answered_questions,
        isLatest: true,
        completedAt: attempt.completed_at ? new Date(attempt.completed_at) : new Date(),
        createdAt: new Date(attempt.created_at),
        sections,
        hasCompletedAudit: true,
      });
    } catch (error) {
      console.error('Error loading from legacy attempts:', error);
      setResults(EMPTY_RESULTS);
    }
  }, [organisationId, auditType]);

  /**
   * Charger les sections pour un attempt_id donné
   */
  const loadSections = async (attemptId: string): Promise<AuditAttemptSection[]> => {
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
      console.error('Error loading sections:', error);
      return [];
    }
  };

  /**
   * Charger l'historique complet des résultats
   */
  const loadHistory = useCallback(async () => {
    if (!organisationId) return;

    try {
      let query = supabase
        .from('audit_results')
        .select('*')
        .eq('organisation_id', organisationId)
        .order('completed_at', { ascending: false });

      if (auditType) {
        query = query.eq('audit_type', auditType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading history:', error);
        return;
      }

      // Si pas de résultats dans audit_results, charger depuis audit_attempts
      if (!data || data.length === 0) {
        await loadLegacyHistory();
        return;
      }

      const historyData = await Promise.all(
        (data || []).map(async (d) => {
          const sections = await loadSections(d.attempt_id);
          return {
            id: d.id,
            organisationId: d.organisation_id,
            attemptId: d.attempt_id,
            auditType: d.audit_type,
            complianceScore: d.compliance_score,
            earned: Number(d.earned),
            possible: Number(d.possible),
            conformeCount: d.conforme_count,
            partielCount: d.partiel_count,
            nonConformeCount: d.non_conforme_count,
            risksHigh: d.risks_high,
            risksMedium: d.risks_medium,
            risksLow: d.risks_low,
            actionsTotal: d.actions_total,
            actionsCompleted: d.actions_completed,
            totalQuestions: d.total_questions,
            answeredQuestions: d.answered_questions,
            isLatest: d.is_latest,
            completedAt: new Date(d.completed_at),
            createdAt: new Date(d.created_at),
            sections,
            hasCompletedAudit: true,
          };
        })
      );

      setHistory(historyData);
    } catch (error) {
      console.error('Error in loadHistory:', error);
    }
  }, [organisationId, auditType]);

  /**
   * Fallback: charger l'historique depuis audit_attempts
   */
  const loadLegacyHistory = useCallback(async () => {
    if (!organisationId) return;

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

      const historyData = await Promise.all(
        (data || []).map(async (attempt) => {
          const sections = await loadSections(attempt.id);
          
          let conformeCount = 0;
          let partielCount = 0;
          let nonConformeCount = 0;
          let risksHigh = 0;

          sections.forEach(section => {
            conformeCount += section.conformeCount;
            partielCount += section.partielCount;
            nonConformeCount += section.nonConformeCount;
            risksHigh += section.highRiskCount;
          });

          return {
            id: attempt.id,
            organisationId: attempt.organisation_id,
            attemptId: attempt.id,
            auditType: attempt.audit_type,
            complianceScore: attempt.score_percent,
            earned: Number(attempt.earned),
            possible: Number(attempt.possible),
            conformeCount,
            partielCount,
            nonConformeCount,
            risksHigh,
            risksMedium: 0,
            risksLow: 0,
            actionsTotal: 0,
            actionsCompleted: 0,
            totalQuestions: attempt.total_questions,
            answeredQuestions: attempt.answered_questions,
            isLatest: false,
            completedAt: attempt.completed_at ? new Date(attempt.completed_at) : new Date(),
            createdAt: new Date(attempt.created_at),
            sections,
            hasCompletedAudit: true,
          };
        })
      );

      setHistory(historyData);
    } catch (error) {
      console.error('Error loading legacy history:', error);
    }
  }, [organisationId, auditType]);

  /**
   * Sélectionner un résultat spécifique de l'historique
   */
  const selectResult = useCallback(async (resultId: string) => {
    const selected = history.find(h => h.id === resultId);
    if (selected) {
      setResults(selected);
    }
  }, [history]);

  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(() => {
    loadLatestResults();
    loadHistory();
  }, [loadLatestResults, loadHistory]);

  // Chargement initial et subscription realtime
  useEffect(() => {
    loadLatestResults();
    loadHistory();

    // S'abonner aux changements en temps réel sur audit_results
    if (organisationId) {
      channelRef.current = supabase
        .channel(`audit-results-${organisationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'audit_results',
            filter: `organisation_id=eq.${organisationId}`,
          },
          (payload) => {
            console.log('Audit results updated:', payload);
            // Recharger les données silencieusement (sans spinner)
            loadLatestResults(true);
            loadHistory();
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [organisationId, loadLatestResults, loadHistory]);

  return {
    isLoading,
    results,
    history,
    selectResult,
    refresh,
    syncStatus,
    lastSyncedAt,
  };
}
