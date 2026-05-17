import { useState, useCallback, useMemo } from 'react';
import { Organisation, AuditModule, Sector, SECTOR_LABELS, SIZE_LABELS, DisplayConformityStatus } from '@/types/rgpd';
import { ModuleCard } from './ModuleCard';
import { AuditHeader } from './AuditHeader';
import { AIDisclaimer } from './AIDisclaimer';
import { AuditModuleDetail } from './AuditModuleDetail';
import { ModuleSectionDetail } from './ModuleSectionDetail';
import { StatisticsDashboard } from './StatisticsDashboard';
import { ModuleConformityDashboard } from './ModuleConformityDashboard';
import { AuditAttemptsHistory } from './AuditAttemptsHistory';
import { AIAssistant } from './AIAssistant';
import { QuestionnaireTab } from './QuestionnaireTab';
import { SyncIndicator } from './SyncIndicator';
import { ActionPlanDashboard } from './ActionPlanDashboard';
import { PotentialScoreWidget } from './PotentialScoreWidget';
import { AuditComparisonWidget } from './AuditComparisonWidget';
import { useAuditPersistence } from '@/hooks/useAuditPersistence';
import { useAuditResults } from '@/hooks/useAuditResults';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, FileText, BarChart3, LayoutGrid, Save, History, Loader2, PieChart, ClipboardList, Target, Mail, Zap } from 'lucide-react';
import EmailLogsPanel from './EmailLogsPanel';
import { AuditFlashPharmacie } from './AuditFlashPharmacie';
import { getAuditItemsForModule } from '@/data/sectorAuditItems';
import { exportToPDF } from '@/services/exportPDF';
import { exportToWord } from '@/services/exportWord';
import { exportInsuranceDiagnosticPDF } from '@/services/exportInsuranceDiagnosticPDF';
import { useToast } from '@/hooks/use-toast';

// Base module definitions without status (status will be computed from persisted data)
const getBaseModulesForSector = (sector: Sector): Omit<AuditModule, 'status'>[] => {
  const baseModules: Omit<AuditModule, 'status'>[] = [
    {
      id: 'ropa',
      name: 'Registre des traitements (ROPA)',
      description: 'Article 30 RGPD - Documentation des activités de traitement',
      icon: 'file-text',
    },
    {
      id: 'violations',
      name: 'Registre des violations',
      description: 'Documentation des violations de données personnelles',
      icon: 'alert-triangle',
    },
    {
      id: 'droits',
      name: 'Registre des demandes de droits',
      description: 'Suivi des demandes d\'exercice des droits (DSAR)',
      icon: 'users',
    },
    {
      id: 'soustraitants',
      name: 'Registre des sous-traitants',
      description: 'Documentation des relations avec les sous-traitants',
      icon: 'building',
    },
    {
      id: 'cookies',
      name: 'Registre cookies & traceurs',
      description: 'Inventaire des cookies et technologies de suivi',
      icon: 'cookie',
    },
    {
      id: 'securite',
      name: 'Sécurité des données',
      description: 'Mesures de sécurité techniques et organisationnelles',
      icon: 'shield-alert',
    },
    {
      id: 'risques',
      name: 'Analyse de risques RGPD',
      description: 'Évaluation des risques liés aux traitements',
      icon: 'bar-chart',
    },
    {
      id: 'aipd',
      name: 'AIPD',
      description: 'Analyse d\'Impact relative à la Protection des Données',
      icon: 'file-search',
    },
  ];

  // Personnalisation selon le secteur
  if (sector.includes('sante')) {
    baseModules[0].description = 'Article 30 RGPD - Traitements de données de santé (art. 9)';
  }

  return baseModules;
};

// Mapping entre les modules et les sections d'audit (basé sur les titres de section)
const moduleSectionMapping: Record<string, string[]> = {
  'ropa': ['Documentation', 'Registre', 'ROPA', 'Traitements'],
  'violations': ['Violations', 'Incidents', 'Failles'],
  'droits': ['Droits', 'DSAR', 'Personnes concernées', 'Information'],
  'soustraitants': ['Sous-traitants', 'Partenaires', 'Tiers'],
  'cookies': ['Cookies', 'Traceurs', 'Web'],
  'securite': ['Sécurité', 'Cyber', 'Technique', 'Protection'],
  'risques': ['Risques', 'Analyse', 'Évaluation'],
  'aipd': ['AIPD', 'Impact', 'PIA'],
};

// Fonction pour trouver le module correspondant à une section
const findModuleForSection = (sectionTitle: string): string | null => {
  const normalizedTitle = sectionTitle.toLowerCase();
  for (const [moduleId, keywords] of Object.entries(moduleSectionMapping)) {
    if (keywords.some(keyword => normalizedTitle.includes(keyword.toLowerCase()))) {
      return moduleId;
    }
  }
  return null;
};

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
}

interface AuditDashboardProps {
  organisation: Organisation;
  onBack: () => void;
  profile?: Profile | null;
}

export function AuditDashboard({ organisation, onBack, profile }: AuditDashboardProps) {
  const [selectedModule, setSelectedModule] = useState<AuditModule | null>(null);
  const [detailModule, setDetailModule] = useState<(AuditModule & { percent?: number; sectionData?: any }) | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [saveNotes, setSaveNotes] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'word' | 'insurance' | null>(null);
  const [activeTab, setActiveTab] = useState('questionnaire');
  const [restartTrigger, setRestartTrigger] = useState(0);
  
  const baseModules = getBaseModulesForSector(organisation.sector);
  const { history, saving, saveSnapshot, loading, saveAuditItem, loadModuleItems } = useAuditPersistence(organisation);
  
  // CRITICAL: Use useAuditResults - single source of truth from database
  // This hook ONLY READS persisted data, never recalculates
  const { 
    isLoading: resultsLoading, 
    results: auditResults, 
    refresh: refreshResults,
    syncStatus,
    lastSyncedAt
  } = useAuditResults(organisation.id, `rgpd_${organisation.sector}`);
  const { stats: actionStats } = useCorrectiveActions(organisation.id);
  const { toast } = useToast();

  // Compute modules with status from persisted audit sections
  // Maps audit sections to modules and aggregates their conformity data
  const modules: (AuditModule & { percent?: number; sectionData?: any })[] = useMemo(() => {
    const sections = auditResults?.sections || [];
    
    return baseModules.map(mod => {
      // Find matching sections for this module
      const matchingSections = sections.filter(section => {
        const moduleId = findModuleForSection(section.sectionTitle);
        return moduleId === mod.id;
      });
      
      if (matchingSections.length === 0 || !auditResults?.hasCompletedAudit) {
        return {
          ...mod,
          status: 'non_evalue' as DisplayConformityStatus,
        };
      }
      
      // Aggregate section data for this module
      const totalEarned = matchingSections.reduce((sum, s) => sum + (s.earned || 0), 0);
      const totalPossible = matchingSections.reduce((sum, s) => sum + (s.possible || 0), 0);
      const percent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      
      // Determine status based on percentage
      let status: DisplayConformityStatus = 'non_conforme';
      if (percent >= 75) status = 'conforme';
      else if (percent >= 50) status = 'partiellement_conforme';
      
      return {
        ...mod,
        status,
        percent,
        sectionData: matchingSections[0], // Primary section data for details
      };
    });
  }, [baseModules, auditResults]);

  // Get counters from PERSISTED audit_results (single source of truth)
  // These values are calculated ONCE at audit completion and stored in DB
  // They are NEVER recalculated on page render
  const { conformeCount, partielCount, nonConformeCount } = useMemo(() => {
    if (resultsLoading || !auditResults?.hasCompletedAudit) {
      return { conformeCount: 0, partielCount: 0, nonConformeCount: 0 };
    }
    // Read directly from persisted data - no recalculation
    return {
      conformeCount: auditResults.conformeCount,
      partielCount: auditResults.partielCount,
      nonConformeCount: auditResults.nonConformeCount,
    };
  }, [resultsLoading, auditResults]);

  // Stats for AI context - read from PERSISTED data only
  const stats = useMemo(() => {
    if (auditResults?.hasCompletedAudit) {
      return { 
        conformityScore: auditResults.complianceScore,
        totalActions: auditResults.actionsTotal,
        completedActions: auditResults.actionsCompleted,
        highRiskCount: auditResults.risksHigh
      };
    }
    return { conformityScore: 0, totalActions: 0, completedActions: 0, highRiskCount: 0 };
  }, [auditResults]);
  
  const aiContext = {
    organisationName: organisation.name,
    sector: organisation.sector,
    size: organisation.size,
    dpoRole: organisation.dpoRole,
    currentModule: selectedModule?.name,
    conformityScore: stats.conformityScore,
  };

  // Handle starting the questionnaire
  const handleStartAudit = useCallback(() => {
    setActiveTab('questionnaire');
  }, []);

  // Handle restarting the audit with a fresh attempt
  const handleRestartAudit = useCallback(() => {
    setRestartTrigger(prev => prev + 1);
    setActiveTab('questionnaire');
  }, []);

  // Calculate stats for snapshot saving
  function calculateStatsForSnapshot() {
    let totalActions = 0;
    let completedActions = 0;
    let highRiskCount = 0;
    let conformeItems = 0;
    let partielItems = 0;
    let totalItems = 0;

    baseModules.forEach(module => {
      const items = getAuditItemsForModule(module.id, organisation.sector);
      items.forEach(item => {
        totalItems++;
        if (item.status === 'conforme') conformeItems++;
        if (item.status === 'partiellement_conforme') partielItems++;
        if (item.riskLevel === 'eleve') highRiskCount++;
        item.actions.forEach(action => {
          totalActions++;
          if (action.completed) completedActions++;
        });
      });
    });

    const conformityScore = totalItems > 0 
      ? Math.round(((conformeItems * 100) + (partielItems * 50)) / totalItems) 
      : 0;

    return { conformityScore, totalActions, completedActions, highRiskCount };
  }


  const handleSaveSnapshot = async () => {
    const snapshotStats = calculateStatsForSnapshot();
    await saveSnapshot(
      snapshotStats.conformityScore,
      snapshotStats.totalActions,
      snapshotStats.completedActions,
      snapshotStats.highRiskCount,
      saveNotes || undefined
    );
    setSaveNotes('');
    setSaveDialogOpen(false);
  };

  const handleExportPDF = async () => {
    if (!auditResults?.hasCompletedAudit) {
      toast({
        title: 'Aucun audit complété',
        description: 'Veuillez compléter un audit avant d\'exporter le rapport',
        variant: 'destructive',
      });
      return;
    }
    setExporting('pdf');
    try {
      await exportToPDF(organisation, auditResults);
      toast({
        title: 'Export réussi',
        description: 'Le rapport PDF a été téléchargé',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter le PDF",
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportWord = async () => {
    if (!auditResults?.hasCompletedAudit) {
      toast({
        title: 'Aucun audit complété',
        description: 'Veuillez compléter un audit avant d\'exporter le rapport',
        variant: 'destructive',
      });
      return;
    }
    setExporting('word');
    try {
      await exportToWord(organisation, auditResults);
      toast({
        title: 'Export réussi',
        description: 'Le rapport Word a été téléchargé',
      });
    } catch (error) {
      console.error('Word export error:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter le document Word",
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportInsuranceDiagnostic = async () => {
    if (!auditResults?.hasCompletedAudit) {
      toast({
        title: 'Aucun audit complété',
        description: 'Veuillez compléter un audit avant d\'exporter le rapport',
        variant: 'destructive',
      });
      return;
    }
    setExporting('insurance');
    try {
      await exportInsuranceDiagnosticPDF(organisation, auditResults);
      toast({
        title: 'Export réussi',
        description: 'Le diagnostic global assurance a été téléchargé',
      });
    } catch (error) {
      console.error('Insurance diagnostic PDF export error:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter le diagnostic",
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const isInsuranceSector = organisation.sector === 'assurance_vie' || organisation.sector === 'assurance_non_vie';


  if (selectedModule) {
    return (
      <AuditModuleDetail
        module={selectedModule}
        organisation={organisation}
        onBack={() => setSelectedModule(null)}
        onSaveItem={saveAuditItem}
        loadModuleItems={loadModuleItems}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AuditHeader organisation={organisation} />

      <main className="flex-1 container mx-auto px-4 py-3 overflow-auto">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="w-fit h-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer d'organisme
            </Button>
            <SyncIndicator 
              status={syncStatus} 
              lastSyncedAt={lastSyncedAt} 
              onRefresh={refreshResults}
            />
          </div>

          <div className="flex gap-2">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8">
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sauvegarder l'audit</DialogTitle>
                  <DialogDescription>
                    Créez un point de contrôle pour suivre l'évolution de la conformité
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      value={saveNotes}
                      onChange={(e) => setSaveNotes(e.target.value)}
                      placeholder="Ajoutez des notes sur cette sauvegarde..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveSnapshot} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={handleExportPDF}
              disabled={exporting !== null}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8"
              onClick={handleExportWord}
              disabled={exporting !== null}
            >
              {exporting === 'word' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Word
            </Button>
            {isInsuranceSector && (
              <Button 
                variant="default" 
                size="sm"
                className="h-8"
                onClick={handleExportInsuranceDiagnostic}
                disabled={exporting !== null}
              >
                {exporting === 'insurance' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Diagnostic Assurance
              </Button>
            )}
          </div>
        </div>

        <AIDisclaimer />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3 flex flex-col h-[calc(100%-120px)]">
          <TabsList className="mb-3 flex-shrink-0">
            <TabsTrigger value="questionnaire" className="gap-2 text-xs px-3">
              <ClipboardList className="h-3.5 w-3.5" />
              Questionnaire
            </TabsTrigger>
            <TabsTrigger value="conformity" className="gap-2 text-xs px-3">
              <PieChart className="h-3.5 w-3.5" />
              Conformité
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2 text-xs px-3">
              <BarChart3 className="h-3.5 w-3.5" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2 text-xs px-3">
              <LayoutGrid className="h-3.5 w-3.5" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs px-3">
              <History className="h-3.5 w-3.5" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2 text-xs px-3">
              <Target className="h-3.5 w-3.5" />
              Plan d'action
              {actionStats.pending + actionStats.inProgress > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5">
                  {actionStats.pending + actionStats.inProgress}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2 text-xs px-3">
              <Mail className="h-3.5 w-3.5" />
              Emails
            </TabsTrigger>
            {organisation.sector === 'sante_reglementee_pharmacien' && (
              <TabsTrigger value="flash" className="gap-2 text-xs px-3">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Audit Flash
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="questionnaire" className="mt-0 h-full">
              <QuestionnaireTab 
                organisation={organisation} 
                onAuditCompleted={refreshResults}
                restartTrigger={restartTrigger}
              />
            </TabsContent>

            <TabsContent value="conformity" className="mt-0 h-full">
              <ModuleConformityDashboard 
                organisation={organisation} 
                modules={modules} 
                onModuleClick={setSelectedModule}
                auditResults={auditResults}
                isLoading={resultsLoading}
                onStartAudit={handleStartAudit}
                onRestartAudit={handleRestartAudit}
                onSendToClient={undefined}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-0 h-full">
              <StatisticsDashboard 
                organisation={organisation} 
                auditResults={auditResults}
                isLoading={resultsLoading}
                onStartAudit={handleStartAudit}
                onRestartAudit={handleRestartAudit}
              />
            </TabsContent>

            <TabsContent value="modules" className="mt-0 h-full">
              {/* Statistiques rapides */}
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-status-conforme" />
                    <div>
                      {resultsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <p className="text-xl font-bold text-foreground">{conformeCount}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Conformes</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-status-partiel" />
                    <div>
                      {resultsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <p className="text-xl font-bold text-foreground">{partielCount}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Partiellement conformes</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-status-non-conforme" />
                    <div>
                      {resultsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <p className="text-xl font-bold text-foreground">{nonConformeCount}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Non conformes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille des modules */}
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Modules d'audit</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {modules.map((module, index) => (
                    <div key={module.id} style={{ animationDelay: `${index * 50}ms` }}>
                      <ModuleCard
                        module={module}
                        onClick={() => {
                          setDetailModule(module);
                          setDetailDialogOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 h-full">
              <AuditAttemptsHistory 
                organisationId={organisation.id}
                auditType={`rgpd_${organisation.sector}`}
              />
            </TabsContent>

            <TabsContent value="emails" className="mt-0 h-full overflow-auto">
              <EmailLogsPanel organisationId={organisation.id} />
            </TabsContent>

            {organisation.sector === 'sante_reglementee_pharmacien' && (
              <TabsContent value="flash" className="mt-0 h-full overflow-auto">
                <AuditFlashPharmacie 
                  organisationId={organisation.id}
                  organisationName={organisation.name}
                />
              </TabsContent>
            )}

            <TabsContent value="actions" className="mt-0 h-full overflow-auto">
              <div className="space-y-6">
                {/* Widgets en haut */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <PotentialScoreWidget
                    organisationId={organisation.id}
                    baseAuditScore={auditResults?.complianceScore || 0}
                    maxPossibleScore={100}
                  />
                  <AuditComparisonWidget
                    organisationId={organisation.id}
                    auditType={`rgpd_${organisation.sector}`}
                    currentAttemptId={auditResults?.attemptId}
                  />
                </div>
                
                {/* Tableau de bord des actions */}
                <ActionPlanDashboard
                  organisationId={organisation.id}
                  organisation={organisation}
                  currentScore={auditResults?.complianceScore || 0}
                  maxPossibleScore={100}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer légal compact */}
        <footer className="mt-3 py-2 text-center border-t">
          <p className="text-xs text-muted-foreground">
            Audit RGPD — <strong>{organisation.name}</strong> — Validation finale par le DPO
          </p>
        </footer>
      </main>

      {/* AI Assistant */}
      <AIAssistant context={aiContext} />

      {/* Module Section Detail Dialog */}
      <ModuleSectionDetail
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        module={detailModule}
        attemptId={auditResults?.attemptId}
        organisationId={organisation.id}
      />

    </div>
  );
}
