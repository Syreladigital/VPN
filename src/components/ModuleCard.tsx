import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { AuditModule } from '@/types/rgpd';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Building, 
  Cookie, 
  ShieldAlert, 
  BarChart3, 
  FileSearch, 
  ClipboardCheck,
  LucideIcon,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const iconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  'alert-triangle': AlertTriangle,
  'users': Users,
  'building': Building,
  'cookie': Cookie,
  'shield-alert': ShieldAlert,
  'bar-chart': BarChart3,
  'file-search': FileSearch,
  'clipboard-check': ClipboardCheck,
};

interface ModuleCardProps {
  module: AuditModule & { percent?: number };
  onClick: () => void;
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || FileText;
  const hasAuditData = module.status !== 'non_evalue' && module.percent !== undefined;

  const getStatusColor = () => {
    if (!hasAuditData) return 'bg-muted text-muted-foreground';
    if (module.percent! >= 75) return 'bg-green-500/10 text-green-700 border-green-500/30';
    if (module.percent! >= 50) return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    return 'bg-red-500/10 text-red-700 border-red-500/30';
  };

  const getProgressColor = () => {
    if (!hasAuditData) return 'bg-muted';
    if (module.percent! >= 75) return 'bg-green-500';
    if (module.percent! >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30",
        "animate-fade-in",
        hasAuditData && module.percent! < 50 && "border-l-4 border-l-red-500"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            hasAuditData ? getStatusColor() : "bg-primary/10"
          )}>
            <Icon className={cn("h-5 w-5", hasAuditData ? "" : "text-primary")} />
          </div>
          {hasAuditData ? (
            <Badge variant="outline" className={cn("gap-1", getStatusColor())}>
              {module.percent}%
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-muted/50 text-muted-foreground">
              <HelpCircle className="h-3 w-3" />
              Non évalué
            </Badge>
          )}
        </div>
        <CardTitle className="mt-3 text-base">{module.name}</CardTitle>
        <CardDescription className="text-xs">
          {module.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {hasAuditData && (
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div 
                className={cn("h-full transition-all", getProgressColor())}
                style={{ width: `${module.percent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {module.percent! >= 75 ? 'Conforme' : module.percent! >= 50 ? 'Partiellement conforme' : 'Non conforme'}
            </p>
          </div>
        )}
        {module.lastUpdated && !hasAuditData && (
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {module.lastUpdated.toLocaleDateString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
