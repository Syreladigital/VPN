import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ArrowRight, Sparkles, CheckCircle2, Target, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDynamicScore } from '@/hooks/useDynamicScore';
import { Button } from '@/components/ui/button';

interface PotentialScoreWidgetProps {
  organisationId: string | undefined;
  baseAuditScore: number;
  maxPossibleScore?: number;
  className?: string;
}

export function PotentialScoreWidget({
  organisationId,
  baseAuditScore,
  maxPossibleScore = 100,
  className,
}: PotentialScoreWidgetProps) {
  const {
    auditScore,
    estimatedScore,
    potentialScore,
    completedImpact,
    remainingImpact,
    completedActions,
    totalActions,
    isLoading,
    refresh,
  } = useDynamicScore(organisationId, baseAuditScore, maxPossibleScore);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const hasImprovement = completedImpact > 0;
  const hasPotential = remainingImpact > 0;

  return (
    <Card className={cn(
      "bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-primary/20",
      className
    )}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Score dynamique</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Trois indicateurs de score */}
        <div className="flex items-center justify-between gap-2 py-4">
          {/* Score Audit (fixe) */}
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={cn("text-2xl font-bold", getScoreColor(auditScore))}>
              {auditScore}%
            </p>
            <p className="text-xs text-muted-foreground">Audit</p>
          </div>

          {/* Flèche */}
          {(hasImprovement || hasPotential) && (
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}

          {/* Score Estimé (avec actions complétées) */}
          {hasImprovement && (
            <>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <p className={cn("text-2xl font-bold", getScoreColor(estimatedScore))}>
                  {estimatedScore}%
                </p>
                <p className="text-xs text-muted-foreground">Estimé</p>
              </div>
              
              {hasPotential && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </>
          )}

          {/* Score Potentiel */}
          {hasPotential && (
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className={cn("text-2xl font-bold", getScoreColor(potentialScore))}>
                {potentialScore}%
              </p>
              <p className="text-xs text-muted-foreground">Potentiel</p>
            </div>
          )}
        </div>

        {/* Barre de progression combinée */}
        <div className="space-y-3">
          <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
            {/* Score audit de base */}
            <div 
              className={cn("absolute h-full transition-all", getProgressColor(auditScore))}
              style={{ width: `${auditScore}%` }}
            />
            {/* Bonus des actions complétées */}
            {hasImprovement && (
              <div 
                className="absolute h-full bg-green-400 transition-all"
                style={{ 
                  left: `${auditScore}%`, 
                  width: `${completedImpact}%` 
                }}
              />
            )}
            {/* Potentiel restant */}
            {hasPotential && (
              <div 
                className="absolute h-full bg-primary/30 transition-all"
                style={{ 
                  left: `${estimatedScore}%`, 
                  width: `${remainingImpact}%` 
                }}
              />
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold text-green-600">+{completedImpact}%</p>
              <p className="text-xs text-muted-foreground">Récupérés</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold text-primary">+{remainingImpact}%</p>
              <p className="text-xs text-muted-foreground">Récupérables</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold">{completedActions}/{totalActions}</p>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
          </div>

          {/* Message contextuel */}
          {totalActions === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Ajoutez des actions correctives pour améliorer votre score
            </p>
          )}
          
          {totalActions > 0 && completedActions === totalActions && (
            <p className="text-center text-sm text-green-600 font-medium">
              🎉 Toutes les actions sont complétées !
            </p>
          )}
          
          {totalActions > 0 && completedActions < totalActions && (
            <p className="text-center text-sm text-muted-foreground">
              {totalActions - completedActions} action(s) restante(s) pour atteindre {potentialScore}%
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
