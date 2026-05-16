import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Organisation } from '@/types/rgpd';
import { useAuth } from '@/hooks/useAuth';
import { useOrganisations } from '@/hooks/useOrganisations';
import { useProcessingRecords } from '@/hooks/useProcessingRecords';
import { useDataBreaches } from '@/hooks/useDataBreaches';
import { useRightsRequests } from '@/hooks/useRightsRequests';
import { useSubprocessors } from '@/hooks/useSubprocessors';
import { useAuditResults } from '@/hooks/useAuditResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SyncIndicator } from '@/components/SyncIndicator';
import { 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  Users, 
  Building2, 
  LayoutDashboard,
  Loader2,
  ClipboardList,
  Shield,
  UserCheck,
  Factory,
  Bell,
  Mail,
  Database,
  MessageSquare,
  TrendingUp,
  Scale
} from 'lucide-react';
import syrelaLogo from '@/assets/syrela-trust-logo.png';
import { ProcessingRecordsRegistry } from '@/components/documentation/ProcessingRecordsRegistry';
import { DataBreachRegistry } from '@/components/documentation/DataBreachRegistry';
import { RightsRequestsRegistry } from '@/components/documentation/RightsRequestsRegistry';
import { SubprocessorsRegistry } from '@/components/documentation/SubprocessorsRegistry';
import { DocumentTemplatesPanel } from '@/components/documentation/DocumentTemplatesPanel';
import { AIAssistant } from '@/components/AIAssistant';
import { NotificationBell } from '@/components/NotificationBell';
import { AlertsDashboard } from '@/components/AlertsDashboard';
import EmailNotificationSettings from '@/components/EmailNotificationSettings';
import { BackupPanel } from '@/components/documentation/BackupPanel';
import { MessagingPanel } from '@/components/MessagingPanel';
import { MessageBadge } from '@/components/MessageBadge';
import { ComplianceDashboard } from '@/components/documentation/ComplianceDashboard';
import { CNILDocumentsPanel } from '@/components/documentation/CNILDocumentsPanel';

const Documentation = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { organisations, loading: orgsLoading } = useOrganisations();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  
  const selectedOrg = organisations.find(o => o.id === selectedOrgId);
  
  const { records: processingRecords, loading: recordsLoading } = useProcessingRecords(selectedOrgId);
  const { breaches, loading: breachesLoading } = useDataBreaches(selectedOrgId);
  const { requests, loading: requestsLoading } = useRightsRequests(selectedOrgId);
  const { subprocessors, loading: subprocessorsLoading } = useSubprocessors(selectedOrgId);
  
  // Audit results - single source of truth
  const { 
    results: auditResults, 
    syncStatus, 
    lastSyncedAt, 
    refresh: refreshAuditResults 
  } = useAuditResults(selectedOrgId);

  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (organisations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organisations[0].id);
    }
  }, [organisations, selectedOrgId]);

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  if (authLoading || orgsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calcul des indicateurs
  const openBreaches = breaches.filter(b => b.status === 'open').length;
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  const contractsToReview = subprocessors.filter(s => {
    if (!s.review_date) return false;
    const reviewDate = new Date(s.review_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return reviewDate <= thirtyDaysFromNow;
  }).length;

  // Calcul du score de complétude
  const calculateCompletenessScore = () => {
    let score = 0;
    let total = 4;
    
    if (processingRecords.length > 0) score++;
    if (subprocessors.length > 0) score++;
    // Vérifier si au moins une fiche a été validée par le DPO
    if (processingRecords.some(r => r.dpo_validation)) score++;
    // Vérifier si tous les sous-traitants ont un contrat signé
    if (subprocessors.length > 0 && subprocessors.every(s => s.contract_signed)) score++;
    
    return Math.round((score / total) * 100);
  };

  const completenessScore = calculateCompletenessScore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <img src={syrelaLogo} alt="Syrela Trust" className="h-10 w-auto" />
              <div className="border-l border-border pl-4">
                <h1 className="text-xl font-semibold">Centre de Documentation RGPD</h1>
                <p className="text-sm text-muted-foreground">Registres et documents obligatoires</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Audit Score Badge */}
              {auditResults?.hasCompletedAudit && (
                <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Score audit :</span>
                  <Badge 
                    variant={auditResults.complianceScore >= 80 ? 'default' : auditResults.complianceScore >= 50 ? 'secondary' : 'destructive'}
                  >
                    {auditResults.complianceScore}%
                  </Badge>
                </div>
              )}
              <SyncIndicator 
                status={syncStatus} 
                lastSyncedAt={lastSyncedAt} 
                onRefresh={refreshAuditResults}
              />
              <MessageBadge organisationId={selectedOrgId} />
              <NotificationBell organisationId={selectedOrgId} />
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="w-[250px]">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sélectionner une organisation" />
                </SelectTrigger>
                <SelectContent>
                  {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-12 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="cnil-documents" className="gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Documents CNIL</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertes</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messagerie</span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Traitements</span>
            </TabsTrigger>
            <TabsTrigger value="breaches" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Violations</span>
            </TabsTrigger>
            <TabsTrigger value="rights" className="gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Droits</span>
            </TabsTrigger>
            <TabsTrigger value="subprocessors" className="gap-2">
              <Factory className="h-4 w-4" />
              <span className="hidden sm:inline">Sous-traitants</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Modèles</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Sauvegarde</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setActiveTab('processing')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Traitements documentés</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{processingRecords.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {processingRecords.filter(r => r.dpo_validation).length} validé(s) par le DPO
                  </p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer hover:bg-accent/50 transition-colors ${openBreaches > 0 ? 'border-destructive' : ''}`} onClick={() => setActiveTab('breaches')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Violations en cours</CardTitle>
                  <AlertTriangle className={`h-4 w-4 ${openBreaches > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${openBreaches > 0 ? 'text-destructive' : ''}`}>{openBreaches}</div>
                  <p className="text-xs text-muted-foreground">
                    {breaches.filter(b => b.cnil_notified).length} notifié(s) à la CNIL
                  </p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer hover:bg-accent/50 transition-colors ${pendingRequests > 0 ? 'border-warning' : ''}`} onClick={() => setActiveTab('rights')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    {requests.filter(r => r.status === 'completed').length} demande(s) traitée(s)
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setActiveTab('subprocessors')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sous-traitants</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subprocessors.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {contractsToReview > 0 ? (
                      <span className="text-warning">{contractsToReview} contrat(s) à revoir</span>
                    ) : (
                      `${subprocessors.filter(s => s.contract_signed).length} contrat(s) signé(s)`
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Scores Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Score de conformité audit */}
              <Card className={auditResults?.hasCompletedAudit ? '' : 'opacity-60'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score de conformité RGPD
                  </CardTitle>
                  <CardDescription>
                    Résultat du dernier audit complété
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditResults?.hasCompletedAudit ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold" style={{
                          color: auditResults.complianceScore >= 80 
                            ? 'hsl(var(--status-conforme))' 
                            : auditResults.complianceScore >= 50 
                            ? 'hsl(var(--status-partiel))' 
                            : 'hsl(var(--status-non-conforme))'
                        }}>
                          {auditResults.complianceScore}%
                        </span>
                        <Badge variant={auditResults.complianceScore >= 80 ? 'default' : auditResults.complianceScore >= 50 ? 'secondary' : 'destructive'}>
                          {auditResults.complianceScore >= 80 ? 'Conforme' : auditResults.complianceScore >= 50 ? 'Partiel' : 'Non conforme'}
                        </Badge>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${auditResults.complianceScore}%`,
                            backgroundColor: auditResults.complianceScore >= 80 
                              ? 'hsl(var(--status-conforme))' 
                              : auditResults.complianceScore >= 50 
                              ? 'hsl(var(--status-partiel))' 
                              : 'hsl(var(--status-non-conforme))'
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-xs text-muted-foreground">Conforme</p>
                          <p className="font-semibold text-status-conforme">{auditResults.conformeCount}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-xs text-muted-foreground">Partiel</p>
                          <p className="font-semibold text-status-partiel">{auditResults.partielCount}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-xs text-muted-foreground">Non conforme</p>
                          <p className="font-semibold text-status-non-conforme">{auditResults.nonConformeCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          {auditResults.risksHigh} risque(s) élevé(s)
                        </span>
                        <span>
                          {auditResults.answeredQuestions}/{auditResults.totalQuestions} questions
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Shield className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Aucun audit complété</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Complétez un audit pour voir le score de conformité
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Score de complétude documentaire */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Score de complétude documentaire
                  </CardTitle>
                  <CardDescription>
                    Évaluation de la complétude de votre documentation RGPD
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{completenessScore}%</span>
                    <Badge variant={completenessScore >= 75 ? 'default' : completenessScore >= 50 ? 'secondary' : 'destructive'}>
                      {completenessScore >= 75 ? 'Bon' : completenessScore >= 50 ? 'À améliorer' : 'Insuffisant'}
                    </Badge>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div 
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${completenessScore}%` }}
                    />
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {processingRecords.length > 0 ? (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">✓</Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">○</Badge>
                      )}
                      Registre des traitements créé
                    </li>
                    <li className="flex items-center gap-2">
                      {processingRecords.some(r => r.dpo_validation) ? (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">✓</Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">○</Badge>
                      )}
                      Fiches validées par le DPO
                    </li>
                    <li className="flex items-center gap-2">
                      {subprocessors.length > 0 ? (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">✓</Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">○</Badge>
                      )}
                      Registre des sous-traitants créé
                    </li>
                    <li className="flex items-center gap-2">
                      {subprocessors.length > 0 && subprocessors.every(s => s.contract_signed) ? (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">✓</Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">○</Badge>
                      )}
                      Tous les contrats sous-traitants signés
                    </li>
                  </ul>
                </div>
              </CardContent>
              </Card>
            </div>
            {(openBreaches > 0 || pendingRequests > 0 || contractsToReview > 0) && (
              <Card className="border-warning">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    Alertes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {openBreaches > 0 && (
                    <div className="flex items-center justify-between p-2 rounded bg-destructive/10">
                      <span>{openBreaches} violation(s) de données en cours - Délai 72h CNIL</span>
                      <Button size="sm" variant="destructive" onClick={() => setActiveTab('breaches')}>
                        Voir
                      </Button>
                    </div>
                  )}
                  {pendingRequests > 0 && (
                    <div className="flex items-center justify-between p-2 rounded bg-warning/10">
                      <span>{pendingRequests} demande(s) de droits en attente - Délai 1 mois</span>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('rights')}>
                        Voir
                      </Button>
                    </div>
                  )}
                  {contractsToReview > 0 && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted">
                      <span>{contractsToReview} contrat(s) sous-traitant à revoir dans les 30 jours</span>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('subprocessors')}>
                        Voir
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Compliance Dashboard Tab */}
          <TabsContent value="dashboard">
            <ComplianceDashboard organisationId={selectedOrgId} />
          </TabsContent>

          {/* CNIL Documents Tab */}
          <TabsContent value="cnil-documents">
            <CNILDocumentsPanel organisation={selectedOrg} />
          </TabsContent>

          {/* Alerts Dashboard Tab */}
          <TabsContent value="alerts">
            <AlertsDashboard 
              organisationId={selectedOrgId} 
              organisationName={selectedOrg?.name || ''} 
            />
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messages">
            <MessagingPanel 
              organisationId={selectedOrgId} 
              organisationName={selectedOrg?.name || ''} 
            />
          </TabsContent>

          {/* Processing Records Tab */}
          <TabsContent value="processing">
            <ProcessingRecordsRegistry organisationId={selectedOrgId} />
          </TabsContent>

          {/* Data Breaches Tab */}
          <TabsContent value="breaches">
            <DataBreachRegistry organisationId={selectedOrgId} />
          </TabsContent>

          {/* Rights Requests Tab */}
          <TabsContent value="rights">
            <RightsRequestsRegistry organisationId={selectedOrgId} />
          </TabsContent>

          {/* Subprocessors Tab */}
          <TabsContent value="subprocessors">
            <SubprocessorsRegistry organisationId={selectedOrgId} />
          </TabsContent>

          {/* Document Templates Tab */}
          <TabsContent value="templates">
            <DocumentTemplatesPanel organisation={selectedOrg} />
          </TabsContent>

          {/* Email Notifications Tab */}
          <TabsContent value="emails">
            <EmailNotificationSettings organisationId={selectedOrgId} />
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup">
            <BackupPanel
              organisationId={selectedOrgId} 
              organisationName={selectedOrg?.name || ''} 
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Assistant pour la documentation RGPD */}
      <AIAssistant 
        context={{
          organisationName: selectedOrg?.name,
          sector: selectedOrg?.sector,
          size: selectedOrg?.size,
          dpoRole: selectedOrg?.dpoRole,
          currentModule: `Documentation - ${activeTab}`,
          conformityScore: completenessScore,
        }}
        mode="documentation"
      />
    </div>
  );
};

export default Documentation;
