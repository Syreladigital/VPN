import { useState } from 'react';
import { useCorrectiveActions, CorrectiveAction } from '@/hooks/useCorrectiveActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Loader2,
  Play,
  Target,
  TrendingUp,
  Trash2,
  Calendar,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportActionPlanPDF } from '@/services/exportActionPlanPDF';
import { Organisation } from '@/types/rgpd';

interface ActionPlanDashboardProps {
  organisationId: string;
  organisation?: Organisation;
  currentScore?: number;
  maxPossibleScore?: number;
}

export function ActionPlanDashboard({ 
  organisationId,
  organisation,
  currentScore = 0,
  maxPossibleScore = 100 
}: ActionPlanDashboardProps) {
  const { actions, isLoading, stats, updateAction, deleteAction } = useCorrectiveActions(organisationId);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    return action.status === filter;
  });

  const potentialScore = Math.min(currentScore + stats.potentialImpact, maxPossibleScore);
  const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const getPriorityBadge = (priority: number) => {
    const configs: Record<number, { label: string; className: string }> = {
      1: { label: 'Critique', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      2: { label: 'Important', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      3: { label: 'Normal', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    };
    const config = configs[priority] || configs[2];
    return <Badge className={cn("text-xs", config.className)}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Play className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleStatusChange = (action: CorrectiveAction, newStatus: string) => {
    updateAction(action.id, { status: newStatus as CorrectiveAction['status'] });
  };

  const handleExportPDF = () => {
    if (!organisation) return;
    exportActionPlanPDF(organisation, actions, stats, currentScore);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Actions totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-500/10 p-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending + stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">En attente / En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Complétées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentScore}% → {potentialScore}%</p>
                <p className="text-xs text-muted-foreground">Score potentiel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Progression du plan d'amélioration</CardTitle>
              <CardDescription>
                {stats.completed} action(s) complétée(s) sur {stats.total}
              </CardDescription>
            </div>
            {organisation && actions.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{Math.round(progressPercent)}% complété</span>
            <span>+{stats.potentialImpact} pts récupérables</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Actions correctives</CardTitle>
              <CardDescription>Liste des actions à mener pour améliorer la conformité</CardDescription>
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes ({stats.total})</SelectItem>
                <SelectItem value="pending">En attente ({stats.pending})</SelectItem>
                <SelectItem value="in_progress">En cours ({stats.inProgress})</SelectItem>
                <SelectItem value="completed">Complétées ({stats.completed})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "Aucune action corrective créée. Consultez les détails des modules pour ajouter des actions."
                  : "Aucune action avec ce statut."
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {filteredActions.map((action) => (
                  <div key={action.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(action.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn(
                            "font-medium text-sm",
                            action.status === 'completed' && "line-through text-muted-foreground"
                          )}>
                            {action.title}
                          </p>
                          {getPriorityBadge(action.priority)}
                          {action.impact_score > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{action.impact_score} pts
                            </Badge>
                          )}
                        </div>
                        {action.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {action.description}
                          </p>
                        )}
                        {action.due_date && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Échéance : {format(new Date(action.due_date), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={action.status} 
                          onValueChange={(v) => handleStatusChange(action, v)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="completed">Complétée</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteAction(action.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
