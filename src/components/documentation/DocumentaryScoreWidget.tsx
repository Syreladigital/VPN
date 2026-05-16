import { useDocumentaryCompletenessScore, DocumentaryCompletenessResult, CategoryScore } from '@/hooks/useDocumentaryCompletenessScore';
import { ProcessingRecord, DataBreach, RightsRequest, Subprocessor } from '@/types/documentation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  Factory, 
  UserCheck, 
  AlertTriangle, 
  Shield, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DocumentaryScoreWidgetProps {
  processingRecords: ProcessingRecord[];
  subprocessors: Subprocessor[];
  rightsRequests: RightsRequest[];
  dataBreaches: DataBreach[];
  auditScore?: number;
  hasAudit?: boolean;
  compact?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Factory,
  UserCheck,
  AlertTriangle,
  Shield,
};

const conformityLevelConfig = {
  excellent: { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-500', badgeClass: 'bg-green-500/10 text-green-700 border-green-500/30' },
  good: { label: 'Bon', color: 'text-blue-600', bgColor: 'bg-blue-500', badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  partial: { label: 'Partiel', color: 'text-amber-600', bgColor: 'bg-amber-500', badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  insufficient: { label: 'Insuffisant', color: 'text-red-600', bgColor: 'bg-red-500', badgeClass: 'bg-red-500/10 text-red-700 border-red-500/30' },
};

function CircularGauge({ percentage, size = 120, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = (pct: number) => {
    if (pct >= 80) return 'stroke-green-500';
    if (pct >= 60) return 'stroke-blue-500';
    if (pct >= 40) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('fill-none transition-all duration-500', getColor(percentage))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{percentage}%</span>
        <span className="text-xs text-muted-foreground">Complétude</span>
      </div>
    </div>
  );
}

function CategoryProgress({ category }: { category: CategoryScore }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[category.icon] || FileText;
  
  const getProgressColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-blue-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate">{category.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{category.percentage}%</span>
                <span className="text-xs text-muted-foreground">({category.weight}%)</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn('h-full transition-all duration-300', getProgressColor(category.percentage))}
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {category.missingElements.length > 0 && (
          <div className="ml-7 pl-3 border-l-2 border-muted py-2 space-y-1">
            {category.missingElements.map((element, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                <span>{element}</span>
              </div>
            ))}
          </div>
        )}
        {category.missingElements.length === 0 && (
          <div className="ml-7 pl-3 border-l-2 border-green-500/30 py-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Documentation complète</span>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DocumentaryScoreWidget({
  processingRecords,
  subprocessors,
  rightsRequests,
  dataBreaches,
  auditScore = 0,
  hasAudit = false,
  compact = false,
}: DocumentaryScoreWidgetProps) {
  const result = useDocumentaryCompletenessScore({
    processingRecords,
    subprocessors,
    rightsRequests,
    dataBreaches,
    auditScore,
    hasAudit,
  });

  const levelConfig = conformityLevelConfig[result.conformityLevel];

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div className={cn('text-lg font-bold', levelConfig.color)}>
                {result.globalPercentage}%
              </div>
              <Badge variant="outline" className={levelConfig.badgeClass}>
                {levelConfig.label}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium mb-2">Score de complétude documentaire</p>
            <div className="space-y-1 text-xs">
              {result.categories.map(cat => (
                <div key={cat.id} className="flex justify-between">
                  <span>{cat.name}</span>
                  <span className="font-medium">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Score de Complétude Documentaire
            </CardTitle>
            <CardDescription>
              Évaluation de la qualité et exhaustivité de votre documentation RGPD
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn('text-sm', levelConfig.badgeClass)}>
            {levelConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score global avec jauge */}
        <div className="flex items-center justify-center">
          <CircularGauge percentage={result.globalPercentage} />
        </div>

        {/* Détail par catégorie */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Détail par catégorie
          </h4>
          {result.categories.map(category => (
            <CategoryProgress key={category.id} category={category} />
          ))}
        </div>

        {/* Actions prioritaires */}
        {result.priorityActions.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Actions prioritaires
            </h4>
            <ul className="space-y-2">
              {result.priorityActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
