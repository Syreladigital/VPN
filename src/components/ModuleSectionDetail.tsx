import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  Loader2,
  AlertCircle,
  Plus,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditModule } from '@/types/rgpd';
import { AuditAttemptSection } from '@/hooks/useAuditResults';
import { useCorrectiveActions, CreateActionInput } from '@/hooks/useCorrectiveActions';

interface AuditAnswer {
  id: string;
  question_id: string;
  selected_value: string | null;
  score: number;
  max_score: number;
  risk_level: string | null;
  section_id: string;
  is_critical: boolean;
  notes: string | null;
}

interface ModuleSectionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: (AuditModule & { percent?: number; sectionData?: AuditAttemptSection }) | null;
  attemptId: string | undefined;
  organisationId?: string;
}

// Mapping des IDs de questions aux libellés (basé sur conditionalQuestions)
const questionLabels: Record<string, string> = {
  'dpo-designation': 'Avez-vous désigné un DPO (Délégué à la Protection des Données) ?',
  'dpo-type': 'Le DPO est-il interne ou externe ?',
  'dpo-declared-cnil': 'Le DPO a-t-il été déclaré à la CNIL ?',
  'dpo-plan': 'Avez-vous prévu de désigner un DPO ?',
  'registre-traitements': 'Tenez-vous un registre des activités de traitement (ROPA) ?',
  'registre-mise-a-jour': 'Le registre est-il régulièrement mis à jour ?',
  'registre-complet': 'Le registre contient-il toutes les informations requises (finalités, bases légales, destinataires, durées) ?',
  'information-personnes': 'Informez-vous les personnes concernées de la collecte de leurs données ?',
  'mentions-legales': 'Vos mentions légales et politique de confidentialité sont-elles à jour ?',
  'consentement-collecte': 'Recueillez-vous le consentement quand nécessaire ?',
  'procedure-droits': 'Avez-vous mis en place une procédure de gestion des droits des personnes ?',
  'procedure-violation': 'Avez-vous une procédure de gestion des violations de données ?',
  'sous-traitants-cartographie': 'Avez-vous cartographié vos sous-traitants ?',
  'sous-traitants-contrats': 'Vos contrats avec les sous-traitants incluent-ils les clauses RGPD ?',
  'securite-mesures': 'Avez-vous mis en place des mesures de sécurité techniques ?',
  'securite-sensibilisation': 'Le personnel est-il sensibilisé à la protection des données ?',
};

export function ModuleSectionDetail({ 
  open, 
  onOpenChange, 
  module,
  attemptId,
  organisationId
}: ModuleSectionDetailProps) {
  const [answers, setAnswers] = useState<AuditAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showActionForm, setShowActionForm] = useState<string | null>(null);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionPriority, setActionPriority] = useState('2');
  
  const { createAction } = useCorrectiveActions(organisationId);

  useEffect(() => {
    const loadAnswers = async () => {
      if (!open || !attemptId || !module?.sectionData?.sectionId) {
        setAnswers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('audit_attempt_answers')
          .select('*')
          .eq('attempt_id', attemptId)
          .eq('section_id', module.sectionData.sectionId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAnswers(data || []);
      } catch (error) {
        console.error('Error loading answers:', error);
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, [open, attemptId, module?.sectionData?.sectionId]);

  const handleCreateAction = async (answer: AuditAnswer) => {
    if (!actionTitle.trim() || !module?.sectionData?.sectionId) return;
    
    const input: CreateActionInput = {
      question_id: answer.question_id,
      section_id: module.sectionData.sectionId,
      title: actionTitle,
      description: actionDescription || undefined,
      priority: parseInt(actionPriority),
      impact_score: answer.max_score - answer.score,
      attempt_id: attemptId,
    };
    
    await createAction(input);
    setShowActionForm(null);
    setActionTitle('');
    setActionDescription('');
    setActionPriority('2');
  };

  if (!module) return null;

  const hasAuditData = module.status !== 'non_evalue' && module.percent !== undefined;
  const sectionData = module.sectionData;

  const getAnswerIcon = (answer: AuditAnswer) => {
    if (answer.selected_value === 'true' || answer.selected_value === 'Oui') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (answer.selected_value === 'false' || answer.selected_value === 'Non') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (answer.selected_value) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
  };

  const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return 'text-muted-foreground';
    const percent = (score / maxScore) * 100;
    if (percent >= 75) return 'text-green-600';
    if (percent >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRiskBadge = (riskLevel: string | null) => {
    if (!riskLevel) return null;
    const colors: Record<string, string> = {
      'faible': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'moyen': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'eleve': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    const labels: Record<string, string> = {
      'faible': 'Risque faible',
      'moyen': 'Risque moyen',
      'eleve': 'Risque élevé',
    };
    return (
      <Badge className={cn("text-xs", colors[riskLevel] || colors['moyen'])}>
        {labels[riskLevel] || riskLevel}
      </Badge>
    );
  };

  const formatAnswer = (value: string | null) => {
    if (!value) return 'Non répondu';
    if (value === 'true') return 'Oui';
    if (value === 'false') return 'Non';
    return value;
  };

  const getQuestionLabel = (questionId: string) => {
    return questionLabels[questionId] || questionId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  };

  const isNonConformAnswer = (answer: AuditAnswer) => {
    return answer.selected_value === 'false' || answer.selected_value === 'Non' || answer.score < answer.max_score * 0.5;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {module.name}
          </DialogTitle>
          <DialogDescription>
            {module.description}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Header */}
        {hasAuditData && sectionData && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de conformité</span>
              <span className={cn("text-2xl font-bold", getScoreColor(module.percent!, 100))}>
                {module.percent}%
              </span>
            </div>
            <Progress 
              value={module.percent} 
              className="h-2"
            />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-2">
                <p className="font-semibold text-green-600">{sectionData.conformeCount}</p>
                <p className="text-muted-foreground">Conformes</p>
              </div>
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-2">
                <p className="font-semibold text-amber-600">{sectionData.partielCount}</p>
                <p className="text-muted-foreground">Partiels</p>
              </div>
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-2">
                <p className="font-semibold text-red-600">{sectionData.nonConformeCount}</p>
                <p className="text-muted-foreground">Non conformes</p>
              </div>
            </div>
            {sectionData.highRiskCount > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {sectionData.highRiskCount} risque(s) élevé(s) identifié(s)
              </div>
            )}
          </div>
        )}

        {!hasAuditData && (
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Aucun audit réalisé pour ce module.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Complétez le questionnaire pour voir les résultats.
            </p>
          </div>
        )}

        {/* Questions List */}
        {hasAuditData && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Questions et réponses</h4>
              <p className="text-xs text-muted-foreground">
                {answers.length} question(s) dans cette section
              </p>
            </div>
            
            <ScrollArea className="h-[300px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : answers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune réponse enregistrée pour cette section
                </div>
              ) : (
                <div className="space-y-3">
                  {answers.map((answer) => (
                    <Card key={answer.id} className={cn(
                      "transition-colors",
                      answer.is_critical && answer.selected_value === 'false' && "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getAnswerIcon(answer)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {getQuestionLabel(answer.question_id)}
                              {answer.is_critical && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  Critique
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {formatAnswer(answer.selected_value)}
                              </Badge>
                              <span className={cn("text-xs font-medium", getScoreColor(answer.score, answer.max_score))}>
                                {answer.score}/{answer.max_score} pts
                              </span>
                              {getRiskBadge(answer.risk_level)}
                            </div>
                            {answer.notes && (
                              <p className="mt-2 text-xs text-muted-foreground italic">
                                Note : {answer.notes}
                              </p>
                            )}
                            
                            {/* Action Button for non-conform answers */}
                            {isNonConformAnswer(answer) && organisationId && (
                              <div className="mt-3">
                                {showActionForm === answer.id ? (
                                  <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                                    <Input
                                      placeholder="Titre de l'action corrective"
                                      value={actionTitle}
                                      onChange={(e) => setActionTitle(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                    <Textarea
                                      placeholder="Description (optionnel)"
                                      value={actionDescription}
                                      onChange={(e) => setActionDescription(e.target.value)}
                                      rows={2}
                                      className="text-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Select value={actionPriority} onValueChange={setActionPriority}>
                                        <SelectTrigger className="h-8 w-[120px] text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">Critique</SelectItem>
                                          <SelectItem value="2">Important</SelectItem>
                                          <SelectItem value="3">Normal</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="flex-1" />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowActionForm(null)}
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleCreateAction(answer)}
                                        disabled={!actionTitle.trim()}
                                      >
                                        Créer
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setShowActionForm(answer.id)}
                                  >
                                    <Target className="h-3 w-3 mr-1" />
                                    Créer une action corrective
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
