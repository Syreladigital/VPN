import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConditionalQuestion, QuestionnaireSection, QuestionAnswer } from '@/types/conditionalQuestionnaire';
import { getQuestionnaireSectionsByFramework, getQuestionnaireLabel, TransportType } from '@/data/conditionalQuestions';
import { Sector, SECTOR_LABELS, TRANSPORT_TYPE_LABELS } from '@/types/rgpd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { simpleScore } from '@/lib/simpleScore';
import { useAuditAttempts } from '@/hooks/useAuditAttempts';
import { computeAuditResults, AuditResults } from '@/lib/computeAuditResults';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Info,
  Lightbulb,
  ExternalLink,
  Save,
  FileText,
  Shield,
  Users,
  Lock,
  Calculator,
  BarChart3,
  Loader2,
  Truck
} from 'lucide-react';

interface ConditionalQuestionnaireProps {
  sector: Sector;
  organisationId?: string;
  organisationName?: string;
  onComplete?: (answers: QuestionAnswer[], results?: AuditResults) => void;
  onSave?: (answers: QuestionAnswer[]) => void;
  onScoreCalculated?: (score: import('@/hooks/useQuestionnaireScoring').ConformityScore) => void;
  onAuditCompleted?: (results: AuditResults, attemptId: string) => void;
  initialAnswers?: QuestionAnswer[];
}

const sectionIcons: Record<string, React.ReactNode> = {
  gouvernance: <Shield className="h-4 w-4" />,
  documentation: <FileText className="h-4 w-4" />,
  droits: <Users className="h-4 w-4" />,
  securite: <Lock className="h-4 w-4" />,
  donnees: <BarChart3 className="h-4 w-4" />,
};

const sectionColors: Record<string, { bg: string; border: string; text: string; activeBg: string }> = {
  gouvernance: {
    bg: "bg-[hsl(var(--section-gouvernance)/0.1)]",
    border: "border-[hsl(var(--section-gouvernance)/0.5)]",
    text: "text-[hsl(var(--section-gouvernance))]",
    activeBg: "bg-[hsl(var(--section-gouvernance))]"
  },
  documentation: {
    bg: "bg-[hsl(var(--section-documentation)/0.1)]",
    border: "border-[hsl(var(--section-documentation)/0.5)]",
    text: "text-[hsl(var(--section-documentation))]",
    activeBg: "bg-[hsl(var(--section-documentation))]"
  },
  droits: {
    bg: "bg-[hsl(var(--section-droits)/0.1)]",
    border: "border-[hsl(var(--section-droits)/0.5)]",
    text: "text-[hsl(var(--section-droits))]",
    activeBg: "bg-[hsl(var(--section-droits))]"
  },
  securite: {
    bg: "bg-[hsl(var(--section-securite)/0.1)]",
    border: "border-[hsl(var(--section-securite)/0.5)]",
    text: "text-[hsl(var(--section-securite))]",
    activeBg: "bg-[hsl(var(--section-securite))]"
  },
  donnees: {
    bg: "bg-[hsl(var(--section-donnees)/0.1)]",
    border: "border-[hsl(var(--section-donnees)/0.5)]",
    text: "text-[hsl(var(--section-donnees))]",
    activeBg: "bg-[hsl(var(--section-donnees))]"
  },
};

const defaultSectionColor = {
  bg: "bg-[hsl(var(--section-default)/0.1)]",
  border: "border-[hsl(var(--section-default)/0.5)]",
  text: "text-[hsl(var(--section-default))]",
  activeBg: "bg-[hsl(var(--section-default))]"
};

import { useQuestionnaireScoring, ConformityScore } from '@/hooks/useQuestionnaireScoring';
import { ConformityScoreCard } from '@/components/ConformityScoreCard';
import { AuditCompletionDialog } from '@/components/AuditCompletionDialog';

export function ConditionalQuestionnaire({
  sector,
  organisationId,
  organisationName = '',
  onComplete,
  onSave,
  onScoreCalculated,
  onAuditCompleted,
  initialAnswers = []
}: ConditionalQuestionnaireProps) {
  const navigate = useNavigate();
  
  // État pour le type de transport (uniquement pour le secteur transport_logistique)
  const [transportType, setTransportType] = useState<TransportType>('general');
  
  const sections = useMemo(() =>
    getQuestionnaireSectionsByFramework(sector, sector === 'transport_logistique' ? transportType : undefined),
    [sector, transportType]
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>(() => {
    const initial: Record<string, QuestionAnswer> = {};
    initialAnswers.forEach(a => {
      initial[a.questionId] = a;
    });
    return initial;
  });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedGuidance, setExpandedGuidance] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<ConformityScore | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // État pour le dialogue de complétion
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completedResults, setCompletedResults] = useState<AuditResults | null>(null);
  const [completedAttemptId, setCompletedAttemptId] = useState<string | null>(null);
  
  const { calculateScore, saveQuestionnaireAndScore, loadQuestionnaireResponses, loadConformityScore, isSaving, isLoading } = useQuestionnaireScoring();
  const { completeAuditAttempt, isSaving: isAttemptSaving } = useAuditAttempts();

  // Charger les réponses existantes
  useEffect(() => {
    const loadExisting = async () => {
      if (!organisationId) return;
      
      const responses = await loadQuestionnaireResponses(organisationId);
      if (responses) {
        const answersMap: Record<string, QuestionAnswer> = {};
        responses.answers.forEach(a => {
          answersMap[a.questionId] = a;
        });
        setAnswers(answersMap);
        setNotes(responses.notes);
      }
      
      const score = await loadConformityScore(organisationId);
      if (score) {
        setCurrentScore(score);
      }
    };
    
    loadExisting();
  }, [organisationId, loadQuestionnaireResponses, loadConformityScore]);

  const currentSection = sections[currentSectionIndex];

  // Calculate progress — only count visible questions (follow-ups only when their condition is met)
  const totalQuestions = useMemo(() => {
    let count = 0;
    sections.forEach(section => {
      section.questions.forEach(q => {
        count++;
        if (q.followUpQuestions) {
          q.followUpQuestions.forEach(fq => {
            // A follow-up without showIf is always visible
            if (!fq.showIf) {
              count++;
            } else {
              const parentAnswer = answers[fq.showIf.questionId];
              if (parentAnswer && parentAnswer.answer === fq.showIf.answer) {
                count++;
              }
            }
          });
        }
      });
    });
    return count;
  }, [sections, answers]);

  const answeredQuestions = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Calculate real-time score using simpleScore
  const liveScore = useMemo(() => {
    // Convert answers to the format expected by simpleScore
    const answersForScore: Record<string, string | boolean | string[]> = {};
    Object.entries(answers).forEach(([questionId, answerObj]) => {
      answersForScore[questionId] = answerObj.answer;
    });
    
    // Convert sections to the format expected by simpleScore
    // Map boolean answers to scored options for calculation
    const sectionsWithScores = sections.map(section => ({
      ...section,
      questions: section.questions.map(q => ({
        ...q,
        options: q.type === 'boolean' 
          ? [
              { value: 'true', score: q.isCritical ? 3 : (q.riskIfNo === 'eleve' ? 2 : 1) },
              { value: 'false', score: 0 }
            ]
          : q.options?.map((opt, idx) => ({ 
              value: opt, 
              score: idx === 0 ? (q.isCritical ? 3 : 1) : 0 
            })) || []
      }))
    }));

    // Convert boolean answers to string format for simpleScore
    const normalizedAnswers: Record<string, string | boolean | string[]> = {};
    Object.entries(answersForScore).forEach(([id, val]) => {
      if (typeof val === 'boolean') {
        normalizedAnswers[id] = val.toString();
      } else {
        normalizedAnswers[id] = val;
      }
    });

    return simpleScore(sectionsWithScores, normalizedAnswers);
  }, [answers, sections]);

  // Check if a question should be visible based on conditional logic
  const isQuestionVisible = (question: ConditionalQuestion): boolean => {
    if (!question.showIf) return true;
    
    const parentAnswer = answers[question.showIf.questionId];
    if (!parentAnswer) return false;
    
    return parentAnswer.answer === question.showIf.answer;
  };

  // Get all visible questions for current section
  const getVisibleQuestions = (questions: ConditionalQuestion[]): ConditionalQuestion[] => {
    const visible: ConditionalQuestion[] = [];
    
    questions.forEach(q => {
      visible.push(q);
      if (q.followUpQuestions) {
        q.followUpQuestions.forEach(fq => {
          if (isQuestionVisible(fq)) {
            visible.push(fq);
          }
        });
      }
    });
    
    return visible;
  };

  const visibleQuestions = useMemo(() => 
    getVisibleQuestions(currentSection?.questions || []),
    [currentSection, answers]
  );

  // Handle answer change
  const handleAnswer = (questionId: string, answer: string | boolean | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        notes: notes[questionId],
        timestamp: new Date()
      }
    }));
  };

  // Handle notes change
  const handleNotesChange = (questionId: string, noteText: string) => {
    setNotes(prev => ({ ...prev, [questionId]: noteText }));
    if (answers[questionId]) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], notes: noteText }
      }));
    }
  };

  // Complete audit and persist to database
  const handleCompleteAudit = useCallback(async () => {
    if (!organisationId) {
      onComplete?.(Object.values(answers));
      return;
    }

    setIsCompleting(true);
    try {
      // Convert answers to the format needed for computeAuditResults
      const answersForCompute: Record<string, string | boolean | string[]> = {};
      Object.entries(answers).forEach(([questionId, answerObj]) => {
        answersForCompute[questionId] = answerObj.answer;
      });

      // Complete the audit and persist to database
      const { success, attemptId, results } = await completeAuditAttempt(
        organisationId,
        sector,
        sections,
        answersForCompute,
        notes
      );

      if (success && results && attemptId) {
        onAuditCompleted?.(results, attemptId);
        onComplete?.(Object.values(answers), results);
        
        // Store results and show dialog instead of navigating
        setCompletedResults(results);
        setCompletedAttemptId(attemptId);
        setShowCompletionDialog(true);
      }
    } finally {
      setIsCompleting(false);
    }
  }, [organisationId, answers, notes, sections, sector, completeAuditAttempt, onComplete, onAuditCompleted]);

  // Navigation
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setExpandedGuidance(null);
    } else {
      // Last section - complete the audit
      handleCompleteAudit();
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setExpandedGuidance(null);
    }
  };

  // Get risk badge color
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'eleve': return 'text-status-non-conforme bg-status-non-conforme/10';
      case 'moyen': return 'text-status-partiel bg-status-partiel/10';
      case 'faible': return 'text-status-conforme bg-status-conforme/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  // Render a single question
  const renderQuestion = (question: ConditionalQuestion, isFollowUp = false) => {
    const answer = answers[question.id];
    const showGuidance = question.guidance && answer?.answer === false;
    const isAnswered = answer !== undefined;
    
    const adaptedQuestion = question;

    return (
      <div
        key={question.id}
        className={cn(
          "rounded-lg border p-4 transition-all",
          isFollowUp && "ml-6 border-l-4 border-l-primary/30",
          isAnswered && "bg-muted/30",
          question.isCritical && !isAnswered && "border-amber-500/50"
        )}
      >
        {/* Question header */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {question.isCritical && (
                <Badge variant="outline" className="text-amber-600 border-amber-500 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Critique
                </Badge>
              )}
              {question.riskIfNo && (
                <Badge className={cn("text-xs", getRiskColor(question.riskIfNo))}>
                  Risque si Non: {question.riskIfNo === 'eleve' ? 'Élevé' : question.riskIfNo === 'moyen' ? 'Moyen' : 'Faible'}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {adaptedQuestion.category}
              </Badge>
            </div>
            <Label className="text-base font-medium leading-relaxed">
              {adaptedQuestion.question}
            </Label>
            {adaptedQuestion.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {adaptedQuestion.description}
              </p>
            )}
          </div>
          {isAnswered && (
            <CheckCircle2 className="h-5 w-5 text-status-conforme shrink-0" />
          )}
        </div>

        {/* Answer input */}
        <div className="mt-4">
          {question.type === 'boolean' && (
            <RadioGroup
              value={answer?.answer === true ? 'oui' : answer?.answer === false ? 'non' : undefined}
              onValueChange={(v) => handleAnswer(question.id, v === 'oui')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id={`${question.id}-oui`} />
                <Label htmlFor={`${question.id}-oui`} className="font-normal cursor-pointer">
                  Oui
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id={`${question.id}-non`} />
                <Label htmlFor={`${question.id}-non`} className="font-normal cursor-pointer">
                  Non
                </Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'select' && question.options && (
            <Select
              value={answer?.answer as string}
              onValueChange={(v) => handleAnswer(question.id, v)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Sélectionnez une option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {question.type === 'text' && (
            <Input
              value={answer?.answer as string || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Votre réponse..."
              className="max-w-md"
            />
          )}

          {question.type === 'multiselect' && question.options && (
            <div className="flex flex-wrap gap-3">
              {question.options.map((option) => {
                const selected = Array.isArray(answer?.answer) && answer.answer.includes(option);
                return (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-${option}`}
                      checked={selected}
                      onCheckedChange={(checked) => {
                        const current = Array.isArray(answer?.answer) ? answer.answer : [];
                        if (checked) {
                          handleAnswer(question.id, [...current, option]);
                        } else {
                          handleAnswer(question.id, current.filter(v => v !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`${question.id}-${option}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes field */}
        <div className="mt-3">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="notes" className="border-none">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                <span className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Ajouter une note
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Textarea
                  value={notes[question.id] || ''}
                  onChange={(e) => handleNotesChange(question.id, e.target.value)}
                  placeholder="Notes complémentaires..."
                  rows={2}
                  className="text-sm"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Guidance panel (shown when answer is Non) */}
        {showGuidance && adaptedQuestion.guidance && (
          <Alert className="mt-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">
              {adaptedQuestion.guidance.title}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                {adaptedQuestion.guidance.description}
              </p>
              
              {adaptedQuestion.guidance.actions && adaptedQuestion.guidance.actions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                    Actions recommandées :
                  </p>
                  <ul className="space-y-1">
                    {adaptedQuestion.guidance.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {adaptedQuestion.guidance.resources && adaptedQuestion.guidance.resources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-500/30">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-2">
                    Ressources utiles :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {adaptedQuestion.guidance.resources.map((resource, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-amber-500/50 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        onClick={() => resource.url && window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {resource.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Render follow-up questions */}
        {question.followUpQuestions && question.followUpQuestions.length > 0 && (
          <div className="mt-4 space-y-3">
            {question.followUpQuestions
              .filter(fq => isQuestionVisible(fq))
              .map(fq => renderQuestion(fq, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Progress header - compact */}
      <Card className="shrink-0">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base">
                {getQuestionnaireLabel(sector)}
              </CardTitle>
              <CardDescription className="text-sm">
                {SECTOR_LABELS[sector]} • RGPD
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sélecteur de type de transport */}
              {sector === 'transport_logistique' && (
                <Select value={transportType} onValueChange={(v) => {
                  setTransportType(v as TransportType);
                  setCurrentSectionIndex(0);
                  // Réinitialiser les réponses si on change de type
                  if (Object.keys(answers).length > 0) {
                    setAnswers({});
                    setNotes({});
                  }
                }}>
                  <SelectTrigger className="w-[200px] h-8 text-xs bg-background">
                    <Truck className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue placeholder="Type de transport" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="general">
                      <span className="flex items-center gap-1.5">Transport Général</span>
                    </SelectItem>
                    <SelectItem value="sous_douane">
                      <span className="flex items-center gap-1.5">Sous-Douane</span>
                    </SelectItem>
                    <SelectItem value="multimodal">
                      <span className="flex items-center gap-1.5">Multimodal</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {answeredQuestions > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-semibold transition-colors",
                    liveScore >= 75 ? "bg-status-conforme/20 text-status-conforme" :
                    liveScore >= 50 ? "bg-status-partiel/20 text-status-partiel" :
                    "bg-status-non-conforme/20 text-status-non-conforme"
                  )}
                >
                  Score: {liveScore}%
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {progressPercent}% complété
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3 px-4">
          <Progress value={progressPercent} className="h-1.5" />
          <div className="mt-2 flex flex-wrap gap-2 pb-1">
            {sections.map((section, idx) => {
              const sectionAnswered = section.questions.filter(q => answers[q.id]).length;
              const sectionTotal = section.questions.length;
              const isComplete = sectionAnswered === sectionTotal && sectionTotal > 0;
              const isCurrent = idx === currentSectionIndex;
              const colors = sectionColors[section.id] || defaultSectionColor;
              
              return (
                <Button
                  key={section.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 h-9 px-3 text-xs font-medium transition-all duration-200 border-2",
                    isCurrent 
                      ? `${colors.activeBg} text-white border-transparent shadow-md` 
                      : `${colors.bg} ${colors.border} ${colors.text} hover:${colors.activeBg} hover:text-white hover:border-transparent`,
                    isComplete && !isCurrent && "ring-2 ring-[hsl(var(--status-conforme))] ring-offset-1"
                  )}
                  onClick={() => setCurrentSectionIndex(idx)}
                >
                  {sectionIcons[section.id] || <FileText className="h-4 w-4" />}
                  <span>{section.title}</span>
                  {isComplete && <CheckCircle2 className="h-3.5 w-3.5" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current section - flexible height with animation */}
      {currentSection && (
        <Card 
          key={currentSection.id}
          className="flex-1 min-h-0 mt-3 flex flex-col overflow-hidden animate-fade-in"
        >
          <CardHeader className="py-3 px-4 shrink-0">
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300",
                  sectionColors[currentSection.id]?.activeBg || defaultSectionColor.activeBg,
                  "text-white"
                )}
              >
                {sectionIcons[currentSection.id] || <FileText className="h-4 w-4" />}
              </div>
              <div>
                <CardTitle className="text-base">{currentSection.title}</CardTitle>
                <CardDescription className="text-xs">{currentSection.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-hidden px-4 pb-3">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-3">
                {currentSection.questions.map(q => renderQuestion(q))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Score Card - collapsible */}
      {currentScore && showScore && (
        <div className="shrink-0 mt-3">
          <ConformityScoreCard score={currentScore} showDetails={true} />
        </div>
      )}

      {/* Navigation - always visible at bottom */}
      <div className="shrink-0 mt-3 flex items-center justify-between gap-2 flex-wrap bg-background pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevSection}
          disabled={currentSectionIndex === 0}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Précédent</span>
        </Button>
        
        <div className="flex gap-1.5 flex-wrap justify-end">
          {/* Bouton calculer le score */}
          {organisationId && (
            <Button 
              variant="outline"
              size="sm"
              className="h-9"
              onClick={async () => {
                const score = await saveQuestionnaireAndScore(organisationId, sector, Object.values(answers));
                if (score) {
                  setCurrentScore(score);
                  setShowScore(true);
                  onScoreCalculated?.(score);
                }
              }}
              disabled={isSaving || Object.keys(answers).length === 0}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-1" />
              )}
              <span className="hidden sm:inline">Score</span>
            </Button>
          )}
          
          {/* Bouton afficher/masquer le score */}
          {currentScore && (
            <Button 
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowScore(!showScore)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{showScore ? 'Masquer' : 'Voir'}</span>
            </Button>
          )}
          
          {onSave && (
            <Button variant="outline" size="sm" className="h-9" onClick={() => onSave(Object.values(answers))}>
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sauvegarder</span>
            </Button>
          )}
          
          <Button 
            size="sm" 
            className="h-9" 
            onClick={goToNextSection}
            disabled={isCompleting || isAttemptSaving}
          >
            {currentSectionIndex === sections.length - 1 ? (
              <>
                {isCompleting || isAttemptSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Terminer</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Suivant</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Audit Completion Dialog */}
      {organisationId && completedResults && completedAttemptId && (
        <AuditCompletionDialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
          organisationId={organisationId}
          organisationName={organisationName}
          auditResults={completedResults}
          attemptId={completedAttemptId}
        />
      )}
    </div>
  );
}