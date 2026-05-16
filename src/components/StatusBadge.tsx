import { cn } from '@/lib/utils';
import { DisplayConformityStatus, RiskLevel, DISPLAY_STATUS_LABELS, RISK_LABELS } from '@/types/rgpd';
import { CheckCircle2, AlertCircle, XCircle, Shield, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DisplayConformityStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const icons = {
    conforme: CheckCircle2,
    partiellement_conforme: AlertCircle,
    non_conforme: XCircle,
    non_evalue: HelpCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={cn(
        'status-badge',
        status === 'conforme' && 'status-conforme',
        status === 'partiellement_conforme' && 'status-partiel',
        status === 'non_conforme' && 'status-non-conforme',
        status === 'non_evalue' && 'status-non-evalue',
        className
      )}
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {DISPLAY_STATUS_LABELS[status]}
    </span>
  );
}

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'status-badge',
        level === 'faible' && 'status-conforme',
        level === 'moyen' && 'status-partiel',
        level === 'eleve' && 'status-non-conforme',
        className
      )}
    >
      <Shield className="mr-1.5 h-3.5 w-3.5" />
      Risque {RISK_LABELS[level]}
    </span>
  );
}
