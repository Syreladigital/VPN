import { ConformityStatus, RiskLevel, Priority, Sector } from './rgpd';

export type QuestionType = 'boolean' | 'select' | 'text' | 'multiselect';

export interface ConditionalQuestion {
  id: string;
  question: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  category: string;
  tags?: string[];
  isCritical?: boolean;
  // Conditional logic
  showIf?: {
    questionId: string;
    answer: string | boolean;
  };
  // Follow-up questions that appear based on the answer
  followUpQuestions?: ConditionalQuestion[];
  // Guidance shown when answer is 'Non' or negative
  guidance?: {
    title: string;
    description: string;
    actions: string[];
    resources?: { label: string; url?: string }[];
  };
  // Risk assessment
  riskIfNo?: RiskLevel;
  // If true, "Non" = positive/compliant answer (inverted logic)
  isInverted?: boolean;
  // Default suggested conformity status based on answer
  suggestedStatus?: {
    ifYes: ConformityStatus;
    ifNo: ConformityStatus;
  };
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  icon?: string;
  questions: ConditionalQuestion[];
}

export interface SectorQuestionnaire {
  sector: Sector;
  sections: QuestionnaireSection[];
}

export interface QuestionAnswer {
  questionId: string;
  answer: string | boolean | string[];
  notes?: string;
  timestamp: Date;
}

export interface QuestionnaireProgress {
  organisationId: string;
  moduleId: string;
  answers: QuestionAnswer[];
  completedSections: string[];
  startedAt: Date;
  lastUpdatedAt: Date;
}
