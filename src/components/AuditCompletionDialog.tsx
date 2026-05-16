import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AuditResults } from '@/lib/computeAuditResults';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PartyPopper,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisationId: string;
  organisationName: string;
  auditResults: AuditResults;
  attemptId: string;
}

export function AuditCompletionDialog({
  open,
  onOpenChange,
  organisationName,
  auditResults,
}: AuditCompletionDialogProps) {
  const navigate = useNavigate();

  const handleComplete = () => {
    onOpenChange(false);
    navigate('/?tab=conformite');
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 75) return 'text-green-600 dark:text-green-400';
    if (percent >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (percent: number) => {
    if (percent >= 75) return 'Satisfaisant';
    if (percent >= 50) return 'À améliorer';
    return 'Critique';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PartyPopper className="h-6 w-6 text-primary" />
            Audit terminé !
          </DialogTitle>
          <DialogDescription>
            L'audit de conformité de <strong>{organisationName}</strong> a été finalisé avec succès.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-full border-4",
                  auditResults.globalPercent >= 75 ? "border-green-500 bg-green-50 dark:bg-green-900/20" :
                  auditResults.globalPercent >= 50 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" :
                  "border-red-500 bg-red-50 dark:bg-red-900/20"
                )}>
                  <span className={cn("text-2xl font-bold", getScoreColor(auditResults.globalPercent))}>
                    {auditResults.globalPercent}%
                  </span>
                </div>
                <div>
                  <p className={cn("text-lg font-semibold", getScoreColor(auditResults.globalPercent))}>
                    {getScoreLabel(auditResults.globalPercent)}
                  </p>
                  <p className="text-sm text-muted-foreground">Score de conformité</p>
                </div>
              </div>
              <TrendingUp className={cn("h-8 w-8", getScoreColor(auditResults.globalPercent))} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{auditResults.countsGlobal.conforme}</p>
              <p className="text-xs text-green-700 dark:text-green-300">Conformes</p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{auditResults.countsGlobal.partiel}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Partiels</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{auditResults.countsGlobal.non_conforme}</p>
              <p className="text-xs text-red-700 dark:text-red-300">Non conformes</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleComplete}>
            Terminer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
