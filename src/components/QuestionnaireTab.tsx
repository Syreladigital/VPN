import { useState, useEffect } from 'react';
import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS, LEGAL_FRAMEWORK_LABELS } from '@/types/rgpd';
import { QuestionAnswer } from '@/types/conditionalQuestionnaire';
import { ConditionalQuestionnaire } from './ConditionalQuestionnaire';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  FileText,
  Download
} from 'lucide-react';

interface QuestionnaireTabProps {
  organisation: Organisation;
  onAuditCompleted?: () => void;
  restartTrigger?: number;
}

export function QuestionnaireTab({ organisation, onAuditCompleted, restartTrigger }: QuestionnaireTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<QuestionAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  // Reset state when restartTrigger changes
  useEffect(() => {
    if (restartTrigger && restartTrigger > 0) {
      setSavedAnswers([]);
      setIsCompleted(false);
      setIsOpen(true);
    }
  }, [restartTrigger]);

  const handleSave = (answers: QuestionAnswer[]) => {
    setSavedAnswers(answers);
    toast({
      title: 'Progression sauvegardée',
      description: `${answers.length} réponses enregistrées`,
    });
  };

  const handleComplete = (answers: QuestionAnswer[]) => {
    setSavedAnswers(answers);
    setIsCompleted(true);
    setIsOpen(false);
    toast({
      title: 'Questionnaire terminé',
      description: 'Vos réponses ont été enregistrées. Le dashboard a été mis à jour.',
    });
    onAuditCompleted?.();
  };

  // Calculate stats from answers
  const criticalIssues = savedAnswers.filter(a => a.answer === false).length;
  const answeredCount = savedAnswers.length;
  const progressPercent = isCompleted ? 100 : Math.min(Math.round((answeredCount / 20) * 100), 99);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Questionnaire de conformité RGPD</CardTitle>
                <CardDescription>
                  Évaluez votre conformité avec des questions adaptées à votre secteur
                </CardDescription>
              </div>
            </div>
            {isCompleted ? (
              <Badge className="bg-status-conforme text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complété
              </Badge>
            ) : savedAnswers.length > 0 ? (
              <Badge variant="outline" className="text-primary">
                En cours ({progressPercent}%)
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2 text-sm">
                <p>
                  Ce questionnaire interactif vous guide à travers les points de conformité RGPD 
                  adaptés à votre secteur : <strong>{SECTOR_LABELS[organisation.sector]}</strong>
                </p>
                <p className="text-muted-foreground">
                  Les questions conditionnelles apparaissent en fonction de vos réponses, 
                  avec des recommandations personnalisées en cas de non-conformité.
                </p>
              </div>
            </div>
          </div>

          {/* Progress display */}
          {savedAnswers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{answeredCount}</p>
                  <p className="text-xs text-muted-foreground">Questions répondues</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className={`text-2xl font-bold ${criticalIssues > 0 ? 'text-status-non-conforme' : 'text-status-conforme'}`}>
                    {criticalIssues}
                  </p>
                  <p className="text-xs text-muted-foreground">Points à améliorer</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {answeredCount - criticalIssues}
                  </p>
                  <p className="text-xs text-muted-foreground">Points conformes</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  {savedAnswers.length > 0 ? 'Continuer le questionnaire' : 'Démarrer le questionnaire'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Questionnaire RGPD - {organisation.name}</DialogTitle>
                  <DialogDescription>
                    Répondez aux questions pour évaluer votre conformité. Les questions conditionnelles 
                    apparaîtront en fonction de vos réponses.
                  </DialogDescription>
                </DialogHeader>
                <ConditionalQuestionnaire
                  sector={organisation.sector}
                  legalFramework={organisation.legalFramework}
                  organisationId={organisation.id}
                  initialAnswers={savedAnswers}
                  onSave={handleSave}
                  onComplete={handleComplete}
                />
              </DialogContent>
            </Dialog>

            {isCompleted && (
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exporter les résultats
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical issues summary */}
      {criticalIssues > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base text-amber-700 dark:text-amber-400">
                Points d'attention identifiés
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {criticalIssues} point{criticalIssues > 1 ? 's' : ''} nécessite{criticalIssues > 1 ? 'nt' : ''} votre attention. 
              Consultez les recommandations dans le questionnaire pour chaque point.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-amber-500/50 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50"
              onClick={() => setIsOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Voir les recommandations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Features description */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Questions adaptées</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Questions spécifiques à votre secteur d'activité et vos obligations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium">Logique conditionnelle</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Questions de suivi qui apparaissent selon vos réponses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Recommandations</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Actions et ressources pour chaque point de non-conformité
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}