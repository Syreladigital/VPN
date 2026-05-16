import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletenessIndicatorProps {
  percentage: number;
  missingFields: string[];
  showBadge?: boolean;
  size?: 'sm' | 'md';
}

export function CompletenessIndicator({ 
  percentage, 
  missingFields, 
  showBadge = true,
  size = 'sm' 
}: CompletenessIndicatorProps) {
  const getColor = (pct: number) => {
    if (pct >= 90) return { text: 'text-green-600', bg: 'bg-green-500', badge: 'bg-green-500/10 text-green-700 border-green-500/30' };
    if (pct >= 70) return { text: 'text-blue-600', bg: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-700 border-blue-500/30' };
    if (pct >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-700 border-amber-500/30' };
    return { text: 'text-red-600', bg: 'bg-red-500', badge: 'bg-red-500/10 text-red-700 border-red-500/30' };
  };

  const colors = getColor(percentage);
  const isComplete = percentage >= 90;

  if (!showBadge) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <div className={cn('h-2 w-8 rounded-full bg-muted overflow-hidden', size === 'md' && 'h-2.5 w-12')}>
                <div 
                  className={cn('h-full transition-all', colors.bg)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={cn('text-xs font-medium', colors.text)}>
                {percentage}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {isComplete ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Documentation complète</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">Champs manquants :</p>
                <ul className="space-y-1">
                  {missingFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-sm">
                      <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn('cursor-help gap-1', colors.badge, size === 'sm' && 'text-xs px-1.5 py-0')}
          >
            {isComplete && <CheckCircle className="h-3 w-3" />}
            {percentage}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Documentation complète</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">Champs manquants :</p>
              <ul className="space-y-1">
                {missingFields.map((field, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-sm">
                    <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
