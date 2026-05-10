import { ConformityScore, SectionScore } from '@/hooks/useQuestionnaireScoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Shield,
  TrendingUp,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConformityScoreCardProps {
  score: ConformityScore;
  showDetails?: boolean;
}

const conformityLevelConfig = {
  excellent: {
    label: 'Excellent',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: CheckCircle2,
    description: 'Votre organisation démontre une excellente maîtrise du RGPD.'
  },
  bon: {
    label: 'Bon',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2,
    description: 'Bon niveau de conformité avec quelques améliorations possibles.'
  },
  moyen: {
    label: 'Moyen',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: AlertTriangle,
    description: 'Des actions correctives sont nécessaires pour améliorer la conformité.'
  },
  insuffisant: {
    label: 'Insuffisant',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: AlertCircle,
    description: 'Niveau de conformité insuffisant. Actions prioritaires requises.'
  },
  critique: {
    label: 'Critique',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    description: 'Situation critique. Mise en conformité urgente nécessaire.'
  },
  non_evalue: {
    label: 'Non évalué',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    badgeClass: 'bg-muted text-muted-foreground',
    icon: Shield,
    description: 'Questionnaire non complété.'
  }
};

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-emerald-500';
  if (percentage >= 60) return 'bg-green-500';
  if (percentage >= 40) return 'bg-amber-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

export function ConformityScoreCard({ score, showDetails = true }: ConformityScoreCardProps) {
  const config = conformityLevelConfig[score.conformityLevel];
  const Icon = config.icon;

  const criticalFailures = score.criticalQuestionsTotal - score.criticalQuestionsPassed;
  const hasCriticalFailure = criticalFailures > 0;

  return (
    <Card className="w-full">
      {/* Alerte rouge indépendante du score global : un point critique non conforme suffit */}
      {hasCriticalFailure && (
        <div className="mx-6 mt-6 flex items-start gap-3 rounded-lg border border-red-400 bg-red-50 p-4 dark:bg-red-950/30">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {criticalFailures} point{criticalFailures > 1 ? 's' : ''} critique{criticalFailures > 1 ? 's' : ''} non conforme{criticalFailures > 1 ? 's' : ''}
            </p>
            <p className="mt-0.5 text-xs text-red-600">
              Indépendamment du score global, ces points exigent une action immédiate.
              Une non-conformité sur un point critique expose l'officine à un risque réglementaire fort (CNIL, CNOP).
            </p>
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-full",
              config.bgColor + "/10"
            )}>
              <Icon className={cn("h-6 w-6", config.color)} />
            </div>
            <div>
              <CardTitle className="text-xl">Score de Conformité RGPD</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <Badge className={cn("text-lg px-4 py-1", config.badgeClass)}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Score global</span>
            <span className={cn("text-2xl font-bold", config.color)}>
              {score.overallPercentage}%
            </span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className={cn("h-full transition-all duration-500", getProgressColor(score.overallPercentage))}
              style={{ width: `${score.overallPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{score.answeredQuestions} / {score.totalQuestions} questions répondues</span>
            <span>{score.overallScore} / {score.overallMaxScore} points</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">
              {score.criticalQuestionsPassed}/{score.criticalQuestionsTotal}
            </div>
            <div className="text-xs text-muted-foreground">Questions critiques</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="text-2xl font-bold text-red-600">
              {score.highRiskCount}
            </div>
            <div className="text-xs text-muted-foreground">Risques élevés</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="text-2xl font-bold text-amber-600">
              {score.mediumRiskCount}
            </div>
            <div className="text-xs text-muted-foreground">Risques moyens</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="text-2xl font-bold text-green-600">
              {score.lowRiskCount}
            </div>
            <div className="text-xs text-muted-foreground">Risques faibles</div>
          </div>
        </div>

        {showDetails && (
          <>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="sections">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Détail par section
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {score.sectionScores.map((section) => (
                      <div key={section.sectionId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1">{section.sectionTitle}</span>
                          <div className="flex items-center gap-2">
                            {section.highRiskCount > 0 && (
                              <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                                {section.highRiskCount} risque{section.highRiskCount > 1 ? 's' : ''}
                              </Badge>
                            )}
                            <span className={cn(
                              "font-medium",
                              section.percentage >= 70 ? "text-green-600" : 
                              section.percentage >= 40 ? "text-amber-600" : "text-red-600"
                            )}>
                              {section.percentage}%
                            </span>
                          </div>
                        </div>
                        <Progress value={section.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {score.priorityRecommendations.length > 0 && (
                <AccordionItem value="recommendations">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Recommandations prioritaires ({score.priorityRecommendations.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-2">
                      {score.priorityRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </>
        )}

        <div className="text-xs text-muted-foreground text-right">
          Calculé le {score.calculatedAt.toLocaleDateString('fr-FR')} à {score.calculatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConformityScoreBadge({ score }: { score: ConformityScore }) {
  const config = conformityLevelConfig[score.conformityLevel];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        config.badgeClass
      )}>
        <Icon className="h-3 w-3" />
        <span>{score.overallPercentage}%</span>
      </div>
    </div>
  );
}
