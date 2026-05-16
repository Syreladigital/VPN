import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sector } from '@/types/rgpd';
import { QuestionAnswer, ConditionalQuestion } from '@/types/conditionalQuestionnaire';
import { getQuestionnaireSections, getAllQuestionsFlat } from '@/data/conditionalQuestions';

export interface SectionScore {
  sectionId: string;
  sectionTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAnswered: number;
  totalQuestions: number;
  criticalPassed: number;
  criticalTotal: number;
  highRiskCount: number;
}

export interface ConformityScore {
  id?: string;
  organisationId: string;
  overallScore: number;
  overallMaxScore: number;
  overallPercentage: number;
  conformityLevel: 'excellent' | 'bon' | 'moyen' | 'insuffisant' | 'critique' | 'non_evalue';
  sectionScores: SectionScore[];
  totalQuestions: number;
  answeredQuestions: number;
  criticalQuestionsTotal: number;
  criticalQuestionsPassed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  priorityRecommendations: string[];
  calculatedAt: Date;
}

// Calcul du score pour une question
function calculateQuestionScore(question: ConditionalQuestion, answer: QuestionAnswer | undefined): {
  score: number;
  maxScore: number;
  isHighRisk: boolean;
  isMediumRisk: boolean;
  isLowRisk: boolean;
  isCriticalPassed: boolean;
} {
  // Score max basé sur la criticité et le risque
  let maxScore = 1;
  if (question.isCritical) maxScore += 2;
  if (question.riskIfNo === 'eleve') maxScore += 2;
  else if (question.riskIfNo === 'moyen') maxScore += 1;

  if (!answer) {
    return { 
      score: 0, 
      maxScore, 
      isHighRisk: false, 
      isMediumRisk: false, 
      isLowRisk: false,
      isCriticalPassed: false 
    };
  }

  const answerValue = answer.answer;
  let basePositive = false;

  // Déterminer si la réponse est positive (avant inversion)
  if (typeof answerValue === 'boolean') {
    basePositive = answerValue === true;
  } else if (typeof answerValue === 'string') {
    // Pour les selects, on considère certaines valeurs comme positives
    const positiveValues = ['oui', 'yes', 'conforme', 'fait', 'complet', 'actif'];
    basePositive = positiveValues.some(v => answerValue.toLowerCase().includes(v));
  } else if (Array.isArray(answerValue)) {
    // Pour multiselect, positif si au moins une option sélectionnée
    basePositive = answerValue.length > 0;
  }

  // Pour les questions inversées, "Non" = positif
  const isPositive = question.isInverted ? !basePositive : basePositive;

  const score = isPositive ? maxScore : 0;
  
  // Évaluer le risque si réponse négative
  const isHighRisk = !isPositive && question.riskIfNo === 'eleve';
  const isMediumRisk = !isPositive && question.riskIfNo === 'moyen';
  const isLowRisk = !isPositive && question.riskIfNo === 'faible';
  const isCriticalPassed = question.isCritical === true && isPositive;

  return { score, maxScore, isHighRisk, isMediumRisk, isLowRisk, isCriticalPassed };
}

// Déterminer le niveau de conformité
function getConformityLevel(percentage: number, criticalPassed: number, criticalTotal: number): ConformityScore['conformityLevel'] {
  const criticalRatio = criticalTotal > 0 ? criticalPassed / criticalTotal : 1;
  
  // Si moins de 50% des questions critiques passées, niveau critique
  if (criticalRatio < 0.5) return 'critique';
  
  if (percentage >= 90 && criticalRatio >= 0.9) return 'excellent';
  if (percentage >= 75 && criticalRatio >= 0.75) return 'bon';
  if (percentage >= 50 && criticalRatio >= 0.6) return 'moyen';
  if (percentage >= 25) return 'insuffisant';
  return 'critique';
}

// Générer les recommandations prioritaires
function generatePriorityRecommendations(
  sections: ReturnType<typeof getQuestionnaireSections>,
  answersMap: Record<string, QuestionAnswer>
): string[] {
  const recommendations: string[] = [];
  
  sections.forEach(section => {
    section.questions.forEach(question => {
      const answer = answersMap[question.id];
      
      // Ajouter une recommandation si question critique non répondue ou réponse négative
      if (question.isCritical || question.riskIfNo === 'eleve') {
        const isNegative = !answer || answer.answer === false;
        
        if (isNegative && question.guidance) {
          recommendations.push(question.guidance.title);
        }
      }
    });
  });
  
  // Limiter à 10 recommandations prioritaires
  return recommendations.slice(0, 10);
}

export function useQuestionnaireScoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Calculer le score à partir des réponses
  const calculateScore = useCallback((
    sector: Sector,
    answers: QuestionAnswer[],
    organisationId: string
  ): ConformityScore => {
    const sections = getQuestionnaireSections(sector);
    const answersMap: Record<string, QuestionAnswer> = {};
    answers.forEach(a => { answersMap[a.questionId] = a; });

    let overallScore = 0;
    let overallMaxScore = 0;
    let totalQuestions = 0;
    let answeredQuestions = 0;
    let criticalQuestionsTotal = 0;
    let criticalQuestionsPassed = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    const sectionScores: SectionScore[] = [];

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionMaxScore = 0;
      let sectionAnswered = 0;
      let sectionTotal = 0;
      let sectionCriticalPassed = 0;
      let sectionCriticalTotal = 0;
      let sectionHighRisk = 0;

      const processQuestion = (question: ConditionalQuestion) => {
        const answer = answersMap[question.id];
        const result = calculateQuestionScore(question, answer);
        
        sectionScore += result.score;
        sectionMaxScore += result.maxScore;
        overallScore += result.score;
        overallMaxScore += result.maxScore;
        
        sectionTotal++;
        totalQuestions++;
        
        if (answer) {
          sectionAnswered++;
          answeredQuestions++;
        }
        
        if (question.isCritical) {
          sectionCriticalTotal++;
          criticalQuestionsTotal++;
          if (result.isCriticalPassed) {
            sectionCriticalPassed++;
            criticalQuestionsPassed++;
          }
        }
        
        if (result.isHighRisk) {
          sectionHighRisk++;
          highRiskCount++;
        }
        if (result.isMediumRisk) mediumRiskCount++;
        if (result.isLowRisk) lowRiskCount++;

        // Traiter les questions de suivi
        if (question.followUpQuestions) {
          question.followUpQuestions.forEach(fq => {
            // Vérifier si la question de suivi est visible
            if (fq.showIf) {
              const parentAnswer = answersMap[fq.showIf.questionId];
              if (parentAnswer && parentAnswer.answer === fq.showIf.answer) {
                processQuestion(fq);
              }
            }
          });
        }
      };

      section.questions.forEach(q => processQuestion(q));

      sectionScores.push({
        sectionId: section.id,
        sectionTitle: section.title,
        score: sectionScore,
        maxScore: sectionMaxScore,
        percentage: sectionMaxScore > 0 ? Math.round((sectionScore / sectionMaxScore) * 100) : 0,
        questionsAnswered: sectionAnswered,
        totalQuestions: sectionTotal,
        criticalPassed: sectionCriticalPassed,
        criticalTotal: sectionCriticalTotal,
        highRiskCount: sectionHighRisk
      });
    });

    const overallPercentage = overallMaxScore > 0 
      ? Math.round((overallScore / overallMaxScore) * 100) 
      : 0;

    const conformityLevel = getConformityLevel(
      overallPercentage, 
      criticalQuestionsPassed, 
      criticalQuestionsTotal
    );

    const priorityRecommendations = generatePriorityRecommendations(sections, answersMap);

    return {
      organisationId,
      overallScore,
      overallMaxScore,
      overallPercentage,
      conformityLevel,
      sectionScores,
      totalQuestions,
      answeredQuestions,
      criticalQuestionsTotal,
      criticalQuestionsPassed,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      priorityRecommendations,
      calculatedAt: new Date()
    };
  }, []);

  // Sauvegarder les réponses et le score
  const saveQuestionnaireAndScore = useCallback(async (
    organisationId: string,
    sector: Sector,
    answers: QuestionAnswer[]
  ): Promise<ConformityScore | null> => {
    setIsSaving(true);
    
    try {
      // Convertir les réponses en format JSONB
      const answersJson: Record<string, any> = {};
      const notesJson: Record<string, string> = {};
      
      answers.forEach(a => {
        answersJson[a.questionId] = {
          answer: a.answer,
          timestamp: a.timestamp
        };
        if (a.notes) {
          notesJson[a.questionId] = a.notes;
        }
      });

      // Upsert des réponses
      const { error: responsesError } = await supabase
        .from('questionnaire_responses')
        .upsert({
          organisation_id: organisationId,
          sector,
          answers: answersJson,
          notes: notesJson,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organisation_id'
        });

      if (responsesError) throw responsesError;

      // Calculer le score
      const score = calculateScore(sector, answers, organisationId);

      // Upsert du score - use type assertion for the upsert
      const scoreData = {
        organisation_id: organisationId,
        overall_score: score.overallScore,
        overall_max_score: score.overallMaxScore,
        overall_percentage: score.overallPercentage,
        conformity_level: score.conformityLevel,
        section_scores: score.sectionScores as unknown as Record<string, unknown>[],
        total_questions: score.totalQuestions,
        answered_questions: score.answeredQuestions,
        critical_questions_total: score.criticalQuestionsTotal,
        critical_questions_passed: score.criticalQuestionsPassed,
        high_risk_count: score.highRiskCount,
        medium_risk_count: score.mediumRiskCount,
        low_risk_count: score.lowRiskCount,
        priority_recommendations: score.priorityRecommendations,
        calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: scoreError } = await supabase
        .from('conformity_scores')
        .upsert(scoreData as any, {
          onConflict: 'organisation_id'
        });

      if (scoreError) throw scoreError;

      toast({
        title: "Score calculé",
        description: `Niveau de conformité : ${score.conformityLevel} (${score.overallPercentage}%)`,
      });

      return score;
    } catch (error: any) {
      console.error('Error saving questionnaire and score:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le questionnaire",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [calculateScore, toast]);

  // Charger les réponses existantes
  const loadQuestionnaireResponses = useCallback(async (
    organisationId: string
  ): Promise<{ answers: QuestionAnswer[]; notes: Record<string, string> } | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('answers, notes')
        .eq('organisation_id', organisationId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Convertir les réponses du format JSONB
      const answersMap = data.answers as Record<string, any> || {};
      const notesMap = data.notes as Record<string, string> || {};
      
      const answers: QuestionAnswer[] = Object.entries(answersMap).map(([questionId, value]) => ({
        questionId,
        answer: value.answer,
        notes: notesMap[questionId],
        timestamp: new Date(value.timestamp)
      }));

      return { answers, notes: notesMap };
    } catch (error: any) {
      console.error('Error loading questionnaire responses:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger le score existant
  const loadConformityScore = useCallback(async (
    organisationId: string
  ): Promise<ConformityScore | null> => {
    try {
      const { data, error } = await supabase
        .from('conformity_scores')
        .select('*')
        .eq('organisation_id', organisationId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        organisationId: data.organisation_id,
        overallScore: data.overall_score,
        overallMaxScore: data.overall_max_score,
        overallPercentage: Number(data.overall_percentage),
        conformityLevel: data.conformity_level as ConformityScore['conformityLevel'],
        sectionScores: (data.section_scores || []) as unknown as SectionScore[],
        totalQuestions: data.total_questions,
        answeredQuestions: data.answered_questions,
        criticalQuestionsTotal: data.critical_questions_total,
        criticalQuestionsPassed: data.critical_questions_passed,
        highRiskCount: data.high_risk_count,
        mediumRiskCount: data.medium_risk_count,
        lowRiskCount: data.low_risk_count,
        priorityRecommendations: (data.priority_recommendations || []) as string[],
        calculatedAt: new Date(data.calculated_at)
      };
    } catch (error: any) {
      console.error('Error loading conformity score:', error);
      return null;
    }
  }, []);

  return {
    isLoading,
    isSaving,
    calculateScore,
    saveQuestionnaireAndScore,
    loadQuestionnaireResponses,
    loadConformityScore
  };
}
