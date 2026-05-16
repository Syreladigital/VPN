import { useState, useEffect } from 'react';
import { Organisation, SECTOR_LABELS, SIZE_LABELS, DPO_ROLE_LABELS } from '@/types/rgpd';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Building2,
  Plus,
  Trash2,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Shield,
  FileText,
  BarChart3,
  History,
  Calendar,
} from 'lucide-react';
import { AuditResultsData } from '@/hooks/useAuditResults';
import { useToast } from '@/hooks/use-toast';

interface AuditSummary {
  id: string;
  organisation_id: string;
  conformity_score: number;
  status: string;
  total_actions: number;
  completed_actions: number;
  high_risk_count: number;
  created_at: string;
  updated_at: string;
}

interface AuditResultSummary {
  id: string;
  organisation_id: string;
  compliance_score: number;
  risks_high: number;
  risks_medium: number;
  risks_low: number;
  actions_total: number;
  actions_completed: number;
  completed_at: string;
  is_latest: boolean;
}

interface AuditHistoryEntry {
  id: string;
  audit_id: string;
  conformity_score: number;
  total_actions: number;
  completed_actions: number;
  high_risk_count: number;
  snapshot_date: string;
  notes: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
}

interface CollaboratorTabsProps {
  organisations: Organisation[];
  loading: boolean;
  profile: Profile | null;
  onSelect: (org: Organisation) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

export function CollaboratorTabs({
  organisations,
  loading,
  profile,
  onSelect,
  onCreateNew,
  onDelete
}: CollaboratorTabsProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [audits, setAudits] = useState<Record<string, AuditSummary>>({});
  const [auditResults, setAuditResults] = useState<Record<string, AuditResultSummary>>({});
  const [auditHistory, setAuditHistory] = useState<Record<string, AuditHistoryEntry[]>>({});
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAudits = async () => {
      if (organisations.length === 0) {
        setLoadingAudits(false);
        return;
      }

      try {
        const orgIds = organisations
          .filter(o => o.id != null && o.id !== '')
          .map(o => o.id as string);

        if (orgIds.length === 0) {
          setLoadingAudits(false);
          return;
        }

        const { data: auditsData, error: auditsError } = await supabase
          .from('audits')
          .select('*')
          .in('organisation_id', orgIds);

        if (auditsError) throw auditsError;

        const auditsMap: Record<string, AuditSummary> = {};
        (auditsData || []).forEach(audit => {
          auditsMap[audit.organisation_id] = audit;
        });
        setAudits(auditsMap);

        const { data: resultsData, error: resultsError } = await supabase
          .from('audit_results')
          .select('*')
          .in('organisation_id', orgIds)
          .eq('is_latest', true);

        if (resultsError) throw resultsError;

        const resultsMap: Record<string, AuditResultSummary> = {};
        (resultsData || []).forEach(result => {
          resultsMap[result.organisation_id] = result;
        });
        setAuditResults(resultsMap);

        const auditIds = (auditsData || []).map(a => a.id);
        if (auditIds.length > 0) {
          const { data: historyData, error: historyError } = await supabase
            .from('audit_history')
            .select('*')
            .in('audit_id', auditIds)
            .order('snapshot_date', { ascending: false })
            .limit(50);

          if (historyError) throw historyError;

          const historyMap: Record<string, AuditHistoryEntry[]> = {};
          (historyData || []).forEach(entry => {
            const orgId = (auditsData || []).find(a => a.id === entry.audit_id)?.organisation_id;
            if (orgId) {
              if (!historyMap[orgId]) historyMap[orgId] = [];
              historyMap[orgId].push(entry);
            }
          });
          setAuditHistory(historyMap);
        }
      } catch (error) {
        console.error('Error fetching audits:', error);
      } finally {
        setLoadingAudits(false);
      }
    };

    fetchAudits();
  }, [organisations]);

  useEffect(() => {
    if (organisations.length > 0 && !activeTab) {
      const firstOrg = organisations[0];
      if (firstOrg?.id) {
        setActiveTab(firstOrg.id);
      }
    }
  }, [organisations, activeTab]);

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-status-conforme';
    if (score >= 50) return 'text-status-partiel';
    return 'text-status-non-conforme';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-status-conforme';
    if (score >= 50) return 'bg-status-partiel';
    return 'bg-status-non-conforme';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Espace Collaborateur</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (organisations.length === 0) {
    return (
      <Card className="w-full max-w-5xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Bienvenue sur votre espace collaborateur</CardTitle>
          <CardDescription>
            Créez votre premier organisme pour commencer vos audits RGPD
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <Button onClick={onCreateNew} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Créer mon premier organisme
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-5xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'Espace Collaborateur'
                  }
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {profile?.job_title && (
                    <>
                      <Shield className="h-3 w-3" />
                      {profile.job_title}
                    </>
                  )}
                  <span>•</span>
                  {organisations.length} organisme{organisations.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
            <Button onClick={onCreateNew} variant="default" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel organisme
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab || undefined} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-4">
              <ScrollArea className="w-full">
                <TabsList className="h-14 bg-transparent p-0">
                  {organisations.filter(org => org.id != null).map((org) => {
                    const orgId = org.id as string;
                    const audit = audits[orgId];
                    const result = auditResults[orgId];
                    const displayScore = result?.compliance_score ?? audit?.conformity_score;
                    const hasScore = displayScore !== undefined;

                    return (
                      <TabsTrigger
                        key={orgId}
                        value={orgId}
                        className="relative h-12 rounded-none border-b-2 border-transparent px-6 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{org.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {SECTOR_LABELS[org.sector]?.split(' – ')[0] ?? org.sector}
                            </span>
                          </div>
                          {hasScore && (
                            <span className={`ml-2 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusColor(displayScore)}`}>
                              {displayScore}%
                            </span>
                          )}
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {organisations.filter(org => org.id != null).map((org) => {
              const orgId = org.id as string;
              const audit = audits[orgId];
              const result = auditResults[orgId];
              const history = auditHistory[orgId] || [];
              const hasAudit = !!audit || !!result;

              const displayScore = result?.compliance_score ?? audit?.conformity_score ?? 0;
              const highRiskCount = result?.risks_high ?? audit?.high_risk_count ?? 0;
              const actionsTotal = result?.actions_total ?? audit?.total_actions ?? 0;
              const actionsCompleted = result?.actions_completed ?? audit?.completed_actions ?? 0;
              const lastUpdated = result?.completed_at ?? audit?.updated_at;

              return (
                <TabsContent key={orgId} value={orgId} className="m-0 p-6">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{org.name}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="gap-1">
                            <Building2 className="h-3 w-3" />
                            {SECTOR_LABELS[org.sector]}
                          </Badge>
                          <Badge variant="secondary">
                            {SIZE_LABELS[org.size]}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {DPO_ROLE_LABELS[org.dpoRole]}
                          </Badge>
                        </div>
                        <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Créé le {format(org.createdAt, 'PPP', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => org.id && setDeleteId(org.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          onClick={() => onSelect(org)}
                          size="lg"
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {hasAudit ? 'Continuer l\'audit' : 'Lancer un nouvel audit'}
                        </Button>
                      </div>
                    </div>

                    {hasAudit && (
                      <div className="grid gap-4 md:grid-cols-4">
                        <Card className="bg-gradient-to-br from-background to-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Score de conformité</p>
                                <p className={`text-3xl font-bold ${getStatusColor(displayScore)}`}>
                                  {displayScore}%
                                </p>
                              </div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <TrendingUp className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <Progress value={displayScore} className="mt-3 h-2" />
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-background to-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Actions réalisées</p>
                                <p className="text-3xl font-bold text-foreground">
                                  {actionsCompleted}/{actionsTotal}
                                </p>
                              </div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-conforme/10">
                                <CheckCircle2 className="h-6 w-6 text-status-conforme" />
                              </div>
                            </div>
                            <Progress
                              value={actionsTotal > 0 ? (actionsCompleted / actionsTotal) * 100 : 0}
                              className="mt-3 h-2"
                            />
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-background to-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Risques élevés</p>
                                <p className={`text-3xl font-bold ${highRiskCount > 0 ? 'text-status-non-conforme' : 'text-status-conforme'}`}>
                                  {highRiskCount}
                                </p>
                              </div>
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${highRiskCount > 0 ? 'bg-status-non-conforme/10' : 'bg-status-conforme/10'}`}>
                                <AlertCircle className={`h-6 w-6 ${highRiskCount > 0 ? 'text-status-non-conforme' : 'text-status-conforme'}`} />
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                              {highRiskCount > 0 ? 'À traiter en priorité' : 'Aucun risque élevé'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-background to-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                                <p className="text-sm font-medium text-foreground">
                                  {lastUpdated ? formatDistanceToNow(new Date(lastUpdated), {
                                    addSuffix: true,
                                    locale: fr
                                  }) : 'N/A'}
                                </p>
                              </div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Clock className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                              {lastUpdated ? format(new Date(lastUpdated), 'PPp', { locale: fr }) : ''}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    <div className="rounded-lg border bg-card">
                      <div className="flex items-center gap-2 border-b p-4">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Historique des audits</h3>
                      </div>
                      <div className="p-4">
                        {loadingAudits ? (
                          <div className="space-y-3">
                            {[1, 2].map((i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        ) : history.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              {hasAudit
                                ? 'Aucun historique enregistré. Sauvegardez votre progression pour créer des points de contrôle.'
                                : 'Lancez votre premier audit pour commencer le suivi de conformité.'
                              }
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-3">
                              {history.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getProgressColor(entry.conformity_score)}/10`}>
                                      <BarChart3 className={`h-5 w-5 ${getStatusColor(entry.conformity_score)}`} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">
                                        Score: <span className={getStatusColor(entry.conformity_score)}>{entry.conformity_score}%</span>
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(entry.snapshot_date), 'PPp', { locale: fr })}
                                      </p>
                                      {entry.notes && (
                                        <p className="mt-1 text-xs text-muted-foreground italic">
                                          "{entry.notes}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="text-right">
                                      <p className="text-muted-foreground">Actions</p>
                                      <p className="font-medium">{entry.completed_actions}/{entry.total_actions}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-muted-foreground">Risques</p>
                                      <p className={`font-medium ${entry.high_risk_count > 0 ? 'text-status-non-conforme' : 'text-status-conforme'}`}>
                                        {entry.high_risk_count}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => onSelect(org)}
                        className="gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Voir les statistiques
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onSelect(org)}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Exporter le rapport
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet organisme ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les audits et l'historique associés seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                  if (activeTab === deleteId) {
                    const remaining = organisations.filter(o => o.id !== deleteId);
                    setActiveTab(remaining.length > 0 ? remaining[0].id! : null);
                  }
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
