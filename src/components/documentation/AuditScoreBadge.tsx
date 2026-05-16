import { useAuditResults } from '@/hooks/useAuditResults';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface AuditScoreBadgeProps {
  organisationId: string;
  compact?: boolean;
}

export function AuditScoreBadge({ organisationId, compact = false }: AuditScoreBadgeProps) {
  const { results, isLoading } = useAuditResults(organisationId);

  if (isLoading || !results.attemptId) {
    return null;
  }

  const score = results.complianceScore;
  
  const getScoreColor = () => {
    if (score >= 80) return 'bg-green-500/10 text-green-700 border-green-500/30';
    if (score >= 50) return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    return 'bg-red-500/10 text-red-700 border-red-500/30';
  };

  const getIcon = () => {
    if (score >= 80) return <CheckCircle className="h-3 w-3" />;
    if (score >= 50) return <TrendingUp className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  if (compact) {
    return (
      <Badge variant="outline" className={`gap-1 ${getScoreColor()}`}>
        {getIcon()}
        {score}%
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 ${getScoreColor()}`}>
      {getIcon()}
      <span className="font-medium">Score audit: {score}%</span>
    </Badge>
  );
}
