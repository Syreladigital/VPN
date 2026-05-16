import { QuestionnaireSection } from '@/types/conditionalQuestionnaire';

interface QuestionOption {
  value: string;
  score?: number;
}

interface QuestionWithOptions {
  id: string;
  options?: QuestionOption[];
}

interface SectionWithQuestions {
  questions?: QuestionWithOptions[];
}

/**
 * Calculate a simple percentage score based on selected answers and their scores
 * @param sections - Array of questionnaire sections containing questions with options
 * @param answers - Object mapping question IDs to selected answer values
 * @returns Percentage score (0-100)
 */
export function simpleScore(
  sections: SectionWithQuestions[],
  answers: Record<string, string | boolean | string[]>
): number {
  const questions = sections.flatMap(s => s.questions || []);

  let earned = 0;
  let possible = 0;

  for (const q of questions) {
    if (!q.options || q.options.length === 0) continue;

    const selected = answers?.[q.id];
    const max = Math.max(...q.options.map(o => Number(o.score || 0)));
    
    possible += max;

    const opt = q.options.find(o => o.value === selected);
    earned += Number(opt?.score || 0);
  }

  const percent = possible ? Math.round((earned / possible) * 100) : 0;
  return percent;
}

/**
 * Calculate detailed score breakdown by section
 * @param sections - Array of questionnaire sections
 * @param answers - Object mapping question IDs to selected answer values
 * @returns Object with overall score and section breakdown
 */
export function detailedScore(
  sections: SectionWithQuestions[],
  answers: Record<string, string | boolean | string[]>
): {
  overallPercent: number;
  earned: number;
  possible: number;
  sectionScores: Array<{
    sectionIndex: number;
    earned: number;
    possible: number;
    percent: number;
  }>;
} {
  let totalEarned = 0;
  let totalPossible = 0;
  const sectionScores: Array<{
    sectionIndex: number;
    earned: number;
    possible: number;
    percent: number;
  }> = [];

  sections.forEach((section, index) => {
    const questions = section.questions || [];
    let sectionEarned = 0;
    let sectionPossible = 0;

    for (const q of questions) {
      if (!q.options || q.options.length === 0) continue;

      const selected = answers?.[q.id];
      const max = Math.max(...q.options.map(o => Number(o.score || 0)));
      
      sectionPossible += max;

      const opt = q.options.find(o => o.value === selected);
      sectionEarned += Number(opt?.score || 0);
    }

    sectionScores.push({
      sectionIndex: index,
      earned: sectionEarned,
      possible: sectionPossible,
      percent: sectionPossible ? Math.round((sectionEarned / sectionPossible) * 100) : 0
    });

    totalEarned += sectionEarned;
    totalPossible += sectionPossible;
  });

  return {
    overallPercent: totalPossible ? Math.round((totalEarned / totalPossible) * 100) : 0,
    earned: totalEarned,
    possible: totalPossible,
    sectionScores
  };
}
