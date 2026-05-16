import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus, History, Calendar } from 'lucide-react';

interface HistoryEntry {
  id: string;
  audit_id: string;
  conformity_score: number;
  total_actions: number;
  completed_actions: number;
  high_risk_count: number;
  snapshot_date: string;
  notes: string | null;
}

interface AuditHistoryPanelProps {
  history: HistoryEntry[];
  loading?: boolean;
}

export function AuditHistoryPanel({ history, loading }: AuditHistoryPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique des audits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique des audits
          </CardTitle>
          <CardDescription>
            Suivi de l'évolution de la conformité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-3 opacity-50" />
            <p>Aucun historique disponible</p>
            <p className="text-sm">Sauvegardez l'audit pour créer un point de contrôle</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrend = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Historique des audits
        </CardTitle>
        <CardDescription>
          {history.length} point{history.length > 1 ? 's' : ''} de contrôle enregistré{history.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => {
              const previousEntry = history[index + 1];
              const scoreTrend = getTrend(entry.conformity_score, previousEntry?.conformity_score);
              const actionsTrend = getTrend(entry.completed_actions, previousEntry?.completed_actions);

              return (
                <div
                  key={entry.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(entry.snapshot_date), 'PPP à HH:mm', { locale: fr })}
                      </p>
                      {index === 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Dernier enregistrement
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold">{entry.conformity_score}%</span>
                        {scoreTrend === 'up' && <TrendingUp className="h-4 w-4 text-status-conforme" />}
                        {scoreTrend === 'down' && <TrendingDown className="h-4 w-4 text-status-non-conforme" />}
                        {scoreTrend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground">conformité</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-status-conforme" />
                      <span className="text-muted-foreground">
                        {entry.completed_actions}/{entry.total_actions} actions
                        {actionsTrend === 'up' && <TrendingUp className="inline h-3 w-3 ml-1 text-status-conforme" />}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-status-non-conforme" />
                      <span className="text-muted-foreground">
                        {entry.high_risk_count} risques élevés
                      </span>
                    </div>
                    <div className="text-right text-muted-foreground">
                      {entry.total_actions > 0 
                        ? Math.round((entry.completed_actions / entry.total_actions) * 100) 
                        : 0}% complété
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="mt-3 text-sm text-muted-foreground italic border-t pt-2">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
