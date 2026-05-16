import { QuestionnaireSection, ConditionalQuestion } from '@/types/conditionalQuestionnaire';

export interface QuestionResult {
  questionId: string;
  sectionId: string;
  selectedValue: string | null;
  score: number;
  maxScore: number;
  riskLevel: 'faible' | 'moyen' | 'eleve' | null;
  isCritical: boolean;
  conformStatus: 'conforme' | 'partiel' | 'non_conforme';
}

export interface SectionResult {
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
  questionsTotal: number;
  questionsAnswered: number;
}

export interface AuditResults {
  globalPercent: number;
  earned: number;
  possible: number;
  totalQuestions: number;
  answeredQuestions: number;
  perSection: Record<string, SectionResult>;
  sectionsList: SectionResult[];
  countsGlobal: {
    conforme: number;
    partiel: number;
    non_conforme: number;
  };
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  criticalTotal: number;
  criticalPassed: number;
  questionResults: QuestionResult[];
  priorityRecommendations: string[];
}

/**
 * Determine the max score for a question based on its properties
 */
function getQuestionMaxScore(question: ConditionalQuestion): number {
  let maxScore = 1;
  if (question.isCritical) maxScore += 2;
  if (question.riskIfNo === 'eleve') maxScore += 2;
  else if (question.riskIfNo === 'moyen') maxScore += 1;
  return maxScore;
}

/**
 * Determine if an answer is positive/conforming
 * @param answer - The answer value
 * @param isInverted - If true, "Non" = positive answer (inverted logic)
 */
function isPositiveAnswer(
  answer: string | boolean | string[] | undefined | null,
  isInverted: boolean = false
): boolean {
  if (answer === undefined || answer === null) return false;
  
  let baseResult = false;
  
  if (typeof answer === 'boolean') {
    baseResult = answer === true;
  } else if (typeof answer === 'string') {
    const lowerAnswer = answer.toLowerCase();
    // Boolean string
    if (lowerAnswer === 'true') baseResult = true;
    else if (lowerAnswer === 'false') baseResult = false;
    else {
      // Positive keywords
      const positiveValues = ['oui', 'yes', 'conforme', 'fait', 'complet', 'actif', 'validé', 'effectué'];
      baseResult = positiveValues.some(v => lowerAnswer.includes(v));
    }
  } else if (Array.isArray(answer)) {
    baseResult = answer.length > 0;
  }
  
  // For inverted questions, "Non" = positive, so we invert the result
  return isInverted ? !baseResult : baseResult;
}

/**
 * Determine conformity status based on percentage
 * >= 80% => conforme
 * 50-79% => partiel
 * < 50% => non_conforme
 */
function getConformStatus(percent: number): 'conforme' | 'partiel' | 'non_conforme' {
  if (percent >= 80) return 'conforme';
  if (percent >= 50) return 'partiel';
  return 'non_conforme';
}

/**
 * Compute comprehensive audit results from sections and answers
 * This is the main scoring function that calculates:
 * - Global score (earned / possible * 100)
 * - Per-section scores
 * - Risk counts
 * - Conformity status
 */
export function computeAuditResults(
  sections: QuestionnaireSection[],
  answers: Record<string, string | boolean | string[]>
): AuditResults {
  let totalEarned = 0;
  let totalPossible = 0;
  let totalQuestions = 0;
  let answeredQuestions = 0;
  let globalConforme = 0;
  let globalPartiel = 0;
  let globalNonConforme = 0;
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let criticalTotal = 0;
  let criticalPassed = 0;

  const perSection: Record<string, SectionResult> = {};
  const sectionsList: SectionResult[] = [];
  const questionResults: QuestionResult[] = [];
  const priorityRecommendations: string[] = [];

  // Process each section
  sections.forEach((section, sectionIndex) => {
    const sectionId = section.id || `section-${sectionIndex}`;
    let sectionEarned = 0;
    let sectionPossible = 0;
    let sectionConforme = 0;
    let sectionPartiel = 0;
    let sectionNonConforme = 0;
    let sectionHighRisk = 0;
    let sectionQuestionsTotal = 0;
    let sectionQuestionsAnswered = 0;

    // Process questions recursively (including follow-up questions)
    const processQuestion = (question: ConditionalQuestion) => {
      const maxScore = getQuestionMaxScore(question);
      const selectedValue = answers[question.id];
      const hasAnswer = selectedValue !== undefined && selectedValue !== null;
      const isPositive = isPositiveAnswer(selectedValue, question.isInverted);
      const score = isPositive ? maxScore : 0;

      sectionPossible += maxScore;
      sectionEarned += score;
      sectionQuestionsTotal++;
      totalQuestions++;

      if (hasAnswer) {
        sectionQuestionsAnswered++;
        answeredQuestions++;
      }

      // Track critical questions
      if (question.isCritical) {
        criticalTotal++;
        if (isPositive) criticalPassed++;
      }

      // Track risks for negative answers
      if (!isPositive && hasAnswer) {
        if (question.riskIfNo === 'eleve') {
          highRiskCount++;
          sectionHighRisk++;
        } else if (question.riskIfNo === 'moyen') {
          mediumRiskCount++;
        } else {
          lowRiskCount++;
        }

        // Add recommendation if guidance exists
        if ((question.isCritical || question.riskIfNo === 'eleve') && question.guidance) {
          priorityRecommendations.push(question.guidance.title);
        }
      }

      // Determine question conformity
      let questionConformStatus: 'conforme' | 'partiel' | 'non_conforme';
      if (!hasAnswer) {
        questionConformStatus = 'non_conforme';
        sectionNonConforme++;
        globalNonConforme++;
      } else if (isPositive) {
        questionConformStatus = 'conforme';
        sectionConforme++;
        globalConforme++;
      } else {
        // Answered but negative - could be partial or non-conforme
        questionConformStatus = 'non_conforme';
        sectionNonConforme++;
        globalNonConforme++;
      }

      // Store question result
      questionResults.push({
        questionId: question.id,
        sectionId,
        selectedValue: hasAnswer ? String(selectedValue) : null,
        score,
        maxScore,
        riskLevel: question.riskIfNo || null,
        isCritical: question.isCritical || false,
        conformStatus: questionConformStatus,
      });

      // Process follow-up questions if they should be visible
      if (question.followUpQuestions) {
        question.followUpQuestions.forEach(followUp => {
          // Check if follow-up should be shown
          if (followUp.showIf) {
            const parentAnswer = answers[followUp.showIf.questionId];
            const shouldShow = parentAnswer === followUp.showIf.answer || 
                               String(parentAnswer) === String(followUp.showIf.answer);
            if (shouldShow) {
              processQuestion(followUp);
            }
          } else {
            processQuestion(followUp);
          }
        });
      }
    };

    // Process all questions in section
    section.questions.forEach(q => processQuestion(q));

    // Calculate section percentage
    const sectionPercent = sectionPossible > 0 
      ? Math.round((sectionEarned / sectionPossible) * 100) 
      : 0;

    const sectionResult: SectionResult = {
      sectionId,
      sectionTitle: section.title,
      earned: sectionEarned,
      possible: sectionPossible,
      percent: sectionPercent,
      conformStatus: getConformStatus(sectionPercent),
      conformeCount: sectionConforme,
      partielCount: sectionPartiel,
      nonConformeCount: sectionNonConforme,
      highRiskCount: sectionHighRisk,
      questionsTotal: sectionQuestionsTotal,
      questionsAnswered: sectionQuestionsAnswered,
    };

    perSection[sectionId] = sectionResult;
    sectionsList.push(sectionResult);

    totalEarned += sectionEarned;
    totalPossible += sectionPossible;
  });

  // Calculate global percentage
  const globalPercent = totalPossible > 0 
    ? Math.round((totalEarned / totalPossible) * 100) 
    : 0;

  return {
    globalPercent,
    earned: totalEarned,
    possible: totalPossible,
    totalQuestions,
    answeredQuestions,
    perSection,
    sectionsList,
    countsGlobal: {
      conforme: globalConforme,
      partiel: globalPartiel,
      non_conforme: globalNonConforme,
    },
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    criticalTotal,
    criticalPassed,
    questionResults,
    priorityRecommendations: priorityRecommendations.slice(0, 10), // Limit to 10
  };
}
