import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS } from '@/types/rgpd';
import { Building2, Briefcase, Users } from 'lucide-react';
import syrelaLogo from '@/assets/syrela-trust-logo.png';

interface AuditHeaderProps {
  organisation: Organisation;
}

export function AuditHeader({ organisation }: AuditHeaderProps) {
  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={syrelaLogo} alt="Syrela Trust" className="h-12 w-auto" />
            <div>
              <div className="text-sm text-muted-foreground">Audit RGPD</div>
              <h1 className="text-2xl font-bold text-foreground">{organisation.name}</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{SECTOR_LABELS[organisation.sector]}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{SIZE_LABELS[organisation.size]}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{DPO_ROLE_LABELS[organisation.dpoRole]}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
