import { useAuditResults } from '@/hooks/useAuditResults';
import { useProcessingRecords } from '@/hooks/useProcessingRecords';
import { useDataBreaches } from '@/hooks/useDataBreaches';
import { useRightsRequests } from '@/hooks/useRightsRequests';
import { useSubprocessors } from '@/hooks/useSubprocessors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  Factory, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DocumentaryScoreWidget } from './DocumentaryScoreWidget';

interface ComplianceDashboardProps {
  organisationId: string;
}

export function ComplianceDashboard({ organisationId }: ComplianceDashboardProps) {
  const { results: auditResults, isLoading: auditLoading } = useAuditResults(organisationId);
  const { records: processingRecords, loading: recordsLoading } = useProcessingRecords(organisationId);
  const { breaches, loading: breachesLoading } = useDataBreaches(organisationId);
  const { requests: rightsRequests, loading: requestsLoading } = useRightsRequests(organisationId);
  const { subprocessors, loading: subprocessorsLoading } = useSubprocessors(organisationId);

  const isLoading = auditLoading || recordsLoading || breachesLoading || requestsLoading || subprocessorsLoading;

  // Calculs des statistiques
  const auditScore = auditResults?.complianceScore || 0;
  const hasAudit = !!auditResults?.attemptId;

  // Processing records stats
  const validatedRecords = processingRecords?.filter(r => r.dpo_validation).length || 0;
  const totalRecords = processingRecords?.length || 0;
  const recordsValidationRate = totalRecords > 0 ? Math.round((validatedRecords / totalRecords) * 100) : 0;

  // Breaches stats
  const openBreaches = breaches?.filter(b => b.status === 'open').length || 0;
  const resolvedBreaches = breaches?.filter(b => b.status === 'closed').length || 0;
  const notifiedBreaches = breaches?.filter(b => b.cnil_notified).length || 0;
  const totalBreaches = breaches?.length || 0;
  const urgentBreaches = breaches?.filter(b => {
    if (b.status !== 'open' || !b.notification_deadline) return false;
    return isBefore(new Date(b.notification_deadline), addDays(new Date(), 1));
  }).length || 0;

  // Rights requests stats
  const pendingRequests = rightsRequests?.filter(r => r.status === 'pending').length || 0;
  const inProgressRequests = rightsRequests?.filter(r => r.status === 'in_progress').length || 0;
  const completedRequests = rightsRequests?.filter(r => r.status === 'completed').length || 0;
  const totalRequests = rightsRequests?.length || 0;
  const overdueRequests = rightsRequests?.filter(r => {
    if (r.status === 'completed' || r.status === 'rejected') return false;
    if (!r.deadline) return false;
    return isBefore(new Date(r.deadline), new Date());
  }).length || 0;

  // Subprocessors stats
  const activeSubprocessors = subprocessors?.filter(s => s.status === 'active').length || 0;
  const contractedSubprocessors = subprocessors?.filter(s => s.contract_signed).length || 0;
  const totalSubprocessors = subprocessors?.length || 0;
  const contractRate = totalSubprocessors > 0 ? Math.round((contractedSubprocessors / totalSubprocessors) * 100) : 0;
  const reviewsDue = subprocessors?.filter(s => {
    if (!s.review_date) return false;
    return isBefore(new Date(s.review_date), addDays(new Date(), 30));
  }).length || 0;

  // Calcul du score global de conformité documentaire
  const documentaryScore = Math.round(
    (recordsValidationRate * 0.3) + 
    (contractRate * 0.3) + 
    (totalRequests > 0 ? ((completedRequests / totalRequests) * 100 * 0.2) : 100 * 0.2) +
    (totalBreaches > 0 ? ((resolvedBreaches / totalBreaches) * 100 * 0.2) : 100 * 0.2)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 80) return { label: 'Conforme', variant: 'default' as const, className: 'bg-green-500/10 text-green-700 border-green-500/30' };
    if (score >= 50) return { label: 'Partiel', variant: 'outline' as const, className: 'bg-amber-500/10 text-amber-700 border-amber-500/30' };
    return { label: 'Non conforme', variant: 'destructive' as const, className: 'bg-red-500/10 text-red-700 border-red-500/30' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec scores principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Score d'audit global */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Score Audit RGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAudit ? (
              <>
                <div className={`text-3xl font-bold ${getScoreColor(auditScore)}`}>
                  {auditScore}%
                </div>
                <Progress value={auditScore} className="mt-2" />
                <Badge variant="outline" className={`mt-2 ${getStatusBadge(auditScore).className}`}>
                  {getStatusBadge(auditScore).label}
                </Badge>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">
                Aucun audit réalisé
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score documentaire - version compacte */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Conformité Documentaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentaryScoreWidget
              processingRecords={processingRecords || []}
              subprocessors={subprocessors || []}
              rightsRequests={rightsRequests || []}
              dataBreaches={breaches || []}
              auditScore={auditScore}
              hasAudit={hasAudit}
              compact
            />
            <Progress value={documentaryScore} className="mt-2" />
          </CardContent>
        </Card>

        {/* Alertes urgentes */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Alertes Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {urgentBreaches + overdueRequests + reviewsDue}
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {urgentBreaches > 0 && <p>• {urgentBreaches} violation(s) à notifier</p>}
              {overdueRequests > 0 && <p>• {overdueRequests} demande(s) en retard</p>}
              {reviewsDue > 0 && <p>• {reviewsDue} révision(s) sous-traitant</p>}
              {urgentBreaches + overdueRequests + reviewsDue === 0 && <p>Aucune alerte</p>}
            </div>
          </CardContent>
        </Card>

        {/* Actions en cours */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Actions en Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {openBreaches + pendingRequests + inProgressRequests}
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {openBreaches > 0 && <p>• {openBreaches} violation(s) ouverte(s)</p>}
              {pendingRequests > 0 && <p>• {pendingRequests} demande(s) en attente</p>}
              {inProgressRequests > 0 && <p>• {inProgressRequests} en traitement</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails par registre */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Registre des traitements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-blue-600" />
              Registre des Traitements
            </CardTitle>
            <CardDescription>Article 30 RGPD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total traitements</span>
              <span className="font-medium">{totalRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Validés DPO</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{validatedRecords}</span>
                <Badge variant="outline" className={getStatusBadge(recordsValidationRate).className}>
                  {recordsValidationRate}%
                </Badge>
              </div>
            </div>
            <Progress value={recordsValidationRate} className="h-2" />
          </CardContent>
        </Card>

        {/* Registre des violations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Violations de Données
            </CardTitle>
            <CardDescription>Article 33 RGPD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-lg font-bold text-red-600">{openBreaches}</div>
                <div className="text-xs text-muted-foreground">Ouvertes</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <div className="text-lg font-bold text-amber-600">{notifiedBreaches}</div>
                <div className="text-xs text-muted-foreground">Notifiées</div>
              </div>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-lg font-bold text-green-600">{resolvedBreaches}</div>
                <div className="text-xs text-muted-foreground">Résolues</div>
              </div>
            </div>
            {urgentBreaches > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {urgentBreaches} notification(s) urgente(s) requise(s)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demandes de droits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Demandes de Droits
            </CardTitle>
            <CardDescription>DSAR - Délai 1 mois</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <div className="text-lg font-bold text-amber-600">{pendingRequests}</div>
                <div className="text-xs text-muted-foreground">En attente</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div className="text-lg font-bold text-blue-600">{inProgressRequests}</div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-lg font-bold text-green-600">{completedRequests}</div>
                <div className="text-xs text-muted-foreground">Terminées</div>
              </div>
            </div>
            {overdueRequests > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <Clock className="h-4 w-4" />
                {overdueRequests} demande(s) en dépassement de délai
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sous-traitants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Factory className="h-5 w-5 text-teal-600" />
              Sous-traitants
            </CardTitle>
            <CardDescription>Article 28 RGPD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sous-traitants actifs</span>
              <span className="font-medium">{activeSubprocessors} / {totalSubprocessors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Contrats signés</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{contractedSubprocessors}</span>
                <Badge variant="outline" className={getStatusBadge(contractRate).className}>
                  {contractRate}%
                </Badge>
              </div>
            </div>
            <Progress value={contractRate} className="h-2" />
            {reviewsDue > 0 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Calendar className="h-4 w-4" />
                {reviewsDue} révision(s) à effectuer sous 30 jours
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Widget Score Documentaire Détaillé */}
      <DocumentaryScoreWidget
        processingRecords={processingRecords || []}
        subprocessors={subprocessors || []}
        rightsRequests={rightsRequests || []}
        dataBreaches={breaches || []}
        auditScore={auditScore}
        hasAudit={hasAudit}
      />

      {/* Indicateurs de risque de l'audit */}
      {hasAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Indicateurs de Risque (Audit)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{auditResults?.answeredQuestions || 0}</div>
                <div className="text-sm text-muted-foreground">Questions répondues</div>
                <div className="text-xs text-muted-foreground">/ {auditResults?.totalQuestions || 0}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-2xl font-bold text-green-600">{auditResults?.conformeCount || 0}</div>
                <div className="text-sm text-muted-foreground">Conformes</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <div className="text-2xl font-bold text-amber-600">{auditResults?.partielCount || 0}</div>
                <div className="text-sm text-muted-foreground">Partiels</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-2xl font-bold text-red-600">{auditResults?.risksHigh || 0}</div>
                <div className="text-sm text-muted-foreground">Risques élevés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
