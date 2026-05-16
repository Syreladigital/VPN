import { RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'stale';

interface SyncIndicatorProps {
  status: SyncStatus;
  lastSyncedAt?: Date;
  onRefresh?: () => void;
  className?: string;
}

export function SyncIndicator({ status, lastSyncedAt, onRefresh, className }: SyncIndicatorProps) {
  const statusConfig = {
    synced: {
      icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Synchronisé',
    },
    syncing: {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: 'Synchronisation...',
    },
    error: {
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      label: 'Erreur de synchronisation',
    },
    stale: {
      icon: RefreshCw,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      label: 'Données obsolètes',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onRefresh}
            disabled={status === 'syncing'}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all',
              config.bgColor,
              config.color,
              onRefresh && status !== 'syncing' && 'hover:opacity-80 cursor-pointer',
              className
            )}
          >
            <Icon className={cn('h-3 w-3', status === 'syncing' && 'animate-spin')} />
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{config.label}</p>
            {lastSyncedAt && (
              <p className="text-muted-foreground text-xs mt-1">
                Dernière mise à jour : {format(lastSyncedAt, 'dd MMM yyyy à HH:mm', { locale: fr })}
              </p>
            )}
            {onRefresh && status !== 'syncing' && (
              <p className="text-xs mt-1 text-primary">Cliquer pour rafraîchir</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
