import { useMemo } from 'react';
import { Organisation } from '@/types/rgpd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Shield, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { AuditResultsData } from '@/hooks/useAuditResults';

interface StatisticsDashboardProps {
  organisation: Organisation;
  auditResults?: AuditResultsData;
  isLoading?: boolean;
  onStartAudit?: () => void;
  onRestartAudit?: () => void;
}

const COLORS = {
  conforme: 'hsl(var(--status-conforme))',
  partiel: 'hsl(var(--status-partiel))',
  nonConforme: 'hsl(var(--status-non-conforme))',
};

export function StatisticsDashboard({ 
  organisation, 
  auditResults,
  isLoading = false,
  onStartAudit,
  onRestartAudit
}: StatisticsDashboardProps) {
  
  const hasData = auditResults?.hasCompletedAudit ?? false;
  const sections = auditResults?.sections || [];

  // Read stats directly from persisted audit results - NO RECALCULATION
  const stats = useMemo(() => {
    if (!hasData || !auditResults) {
      return {
        conformityScore: 0,
        totalQuestions: 0,
        answeredQuestions: 0,
        highRiskCount: 0,
        priorityActions: 0,
        conformeCount: 0,
        partielCount: 0,
        nonConformeCount: 0,
        sectionStats: [],
      };
    }

    // Priority actions = sections with score < 50%
    const priorityActions = sections.filter(s => s.percent < 50).length;

    return {
      conformityScore: auditResults.complianceScore,
      totalQuestions: auditResults.totalQuestions,
      answeredQuestions: auditResults.answeredQuestions,
      highRiskCount: auditResults.risksHigh,
      priorityActions,
      conformeCount: auditResults.conformeCount,
      partielCount: auditResults.partielCount,
      nonConformeCount: auditResults.nonConformeCount,
      sectionStats: sections.map(s => ({
        id: s.sectionId,
        name: s.sectionTitle.substring(0, 20),
        fullName: s.sectionTitle,
        conformityScore: s.percent,
        conforme: s.conformeCount,
        partiel: s.partielCount,
        nonConforme: s.nonConformeCount,
        highRisk: s.highRiskCount,
      })),
    };
  }, [hasData, auditResults, sections]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement des statistiques...</span>
      </div>
    );
  }

  // No audit completed state
  if (!hasData) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            Complétez le questionnaire de conformité pour voir les statistiques détaillées
          </p>
          {onStartAudit && (
            <Button onClick={onStartAudit}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Démarrer le questionnaire
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Conforme', value: stats.conformeCount, color: COLORS.conforme },
    { name: 'Partiel', value: stats.partielCount, color: COLORS.partiel },
    { name: 'Non conforme', value: stats.nonConformeCount, color: COLORS.nonConforme },
  ].filter(d => d.value > 0);

  const barData = stats.sectionStats.map(m => ({
    name: m.name,
    Conformité: m.conformityScore,
  }));

  const radarData = stats.sectionStats.slice(0, 8).map(m => ({
    module: m.name.substring(0, 12),
    score: m.conformityScore,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header with restart button */}
      {hasData && onRestartAudit && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onRestartAudit}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refaire l'audit
          </Button>
        </div>
      )}

      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Score de conformité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.conformityScore}%</span>
              {stats.conformityScore >= 70 ? (
                <TrendingUp className="h-5 w-5 text-status-conforme" />
              ) : (
                <TrendingDown className="h-5 w-5 text-status-non-conforme" />
              )}
            </div>
            <Progress value={stats.conformityScore} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Objectif recommandé : 80%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-conforme">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Questions répondues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.answeredQuestions}</span>
              <span className="text-lg text-muted-foreground">/ {stats.totalQuestions}</span>
            </div>
            <Progress 
              value={stats.totalQuestions > 0 ? (stats.answeredQuestions / stats.totalQuestions) * 100 : 0} 
              className="mt-3 h-2" 
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.totalQuestions > 0 ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100) : 0}% complétées
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-non-conforme">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risques élevés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-status-non-conforme">{stats.highRiskCount}</span>
              <span className="text-sm text-muted-foreground">éléments</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              À traiter en priorité
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-partiel">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sections prioritaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-status-partiel">{stats.priorityActions}</span>
              <span className="text-sm text-muted-foreground">à améliorer</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sections avec score {"<"} 50%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Répartition de la conformité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition de la conformité</CardTitle>
            <CardDescription>
              Statut des {sections.length} sections d'audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucune donnée à afficher
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Radar de maturité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Radar de maturité RGPD</CardTitle>
            <CardDescription>
              Score par section d'audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="module" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucune donnée à afficher
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression par section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression par section</CardTitle>
          <CardDescription>
            Conformité par domaine d'audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Conformité" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Aucune donnée à afficher
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Détail par section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail par section</CardTitle>
          <CardDescription>
            Analyse détaillée de chaque section d'audit
            {auditResults?.completedAt && (
              <span className="ml-2">
                — Évalué le {new Date(auditResults.completedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.sectionStats.map((section) => (
              <div key={section.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{section.fullName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {section.conforme + section.partiel + section.nonConforme} éléments
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{section.conformityScore}%</span>
                    <p className="text-xs text-muted-foreground">conformité</p>
                  </div>
                </div>
                <Progress value={section.conformityScore} className="h-2 mb-3" />
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-status-conforme" />
                    <span>{section.conforme} conformes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-status-partiel" />
                    <span>{section.partiel} partiels</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-status-non-conforme" />
                    <span>{section.nonConforme} non conformes</span>
                  </div>
                  {section.highRisk > 0 && (
                    <div className="flex items-center gap-1 text-status-non-conforme">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{section.highRisk} risques élevés</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
