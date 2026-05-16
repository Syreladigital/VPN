import { useAnonymizedStats } from '@/hooks/useAnonymizedStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  RefreshCw,
  Lock,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line,
  Legend,
  CartesianGrid,
  ComposedChart,
  Area
} from 'recharts';

const SECTOR_LABELS: Record<string, string> = {
  'sante_reglementee_pharmacien': 'Pharmacien',
  'sante_reglementee_medecin': 'Médecin',
  'sante_non_reglementee_bien_etre': 'Bien-être',
  'assurance_vie': 'Assurance Vie',
  'assurance_non_vie': 'Assurance',
  'transport_logistique': 'Transport'
};

const SIZE_LABELS: Record<string, string> = {
  'independant': 'Indépendant',
  'tpe': 'TPE',
  'pme': 'PME',
  'groupe': 'Groupe'
};

const ROLE_LABELS: Record<string, string> = {
  'user': 'Utilisateur',
  'admin': 'Administrateur',
  'super_admin': 'Super Admin'
};

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10b981', '#f59e0b'];

const formatMonth = (month: string) => {
  const [year, m] = month.split('-');
  return `${MONTH_LABELS[m] || m} ${year.slice(2)}`;
};

export function AdminAnonymizedDashboard() {
  const { stats, loading, refresh } = useAnonymizedStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Impossible de charger les statistiques
        </CardContent>
      </Card>
    );
  }

  // Préparer les données pour les graphiques de base
  const sectorData = stats.organisations_by_sector 
    ? Object.entries(stats.organisations_by_sector).map(([key, value]) => ({
        name: SECTOR_LABELS[key] || key,
        value: value
      }))
    : [];

  const sizeData = stats.organisations_by_size
    ? Object.entries(stats.organisations_by_size).map(([key, value]) => ({
        name: SIZE_LABELS[key] || key,
        value: value
      }))
    : [];

  const roleData = stats.users_by_role
    ? Object.entries(stats.users_by_role).map(([key, value]) => ({
        name: ROLE_LABELS[key] || key,
        value: value
      }))
    : [];

  // Données mensuelles formatées
  const monthlyOrgData = (stats.monthly_organisations || []).map(d => ({
    ...d,
    month: formatMonth(d.month)
  }));

  const monthlyAuditData = (stats.monthly_audits || []).map(d => ({
    ...d,
    month: formatMonth(d.month)
  }));

  const monthlyBreachData = (stats.monthly_breaches || []).map(d => ({
    ...d,
    month: formatMonth(d.month)
  }));

  // Données sectorielles formatées
  const sectorConformityData = (stats.sector_conformity_scores || []).map(d => ({
    ...d,
    sector: SECTOR_LABELS[d.sector] || d.sector
  }));

  const sectorBreachData = (stats.sector_breach_rates || []).map(d => ({
    ...d,
    sector: SECTOR_LABELS[d.sector] || d.sector
  }));

  const sectorSubprocessorData = (stats.sector_subprocessor_usage || []).map(d => ({
    ...d,
    sector: SECTOR_LABELS[d.sector] || d.sector
  }));

  return (
    <div className="space-y-6">
      {/* En-tête RGPD */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Dashboard Administrateur - Données Anonymisées</CardTitle>
          </div>
          <CardDescription>
            Conformément au RGPD (Art. 5 & 25), ce tableau de bord présente uniquement des statistiques 
            agrégées et anonymisées. Aucune donnée personnelle identifiable n'est accessible.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                Minimisation des données
              </Badge>
              <Badge variant="outline" className="text-xs">
                Privacy by Design
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organisations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_organisations}</div>
            <p className="text-xs text-muted-foreground">
              Total des organisations enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">
              Comptes utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score Conformité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_conformity_score}%</div>
            <p className="text-xs text-muted-foreground">
              Moyenne globale des audits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Audits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_audits}</div>
            <p className="text-xs text-muted-foreground">
              Audits RGPD réalisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tendances mensuelles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Tendances mensuelles (6 derniers mois)</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des inscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nouvelles organisations</CardTitle>
              <CardDescription>Inscriptions mensuelles sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyOrgData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyOrgData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="Organisations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée sur cette période</p>
              )}
            </CardContent>
          </Card>

          {/* Évolution des audits avec score moyen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audits et scores</CardTitle>
              <CardDescription>Nombre d'audits et score moyen mensuel</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyAuditData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={monthlyAuditData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Audits"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="avg_score" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--destructive))' }}
                      name="Score moyen (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée sur cette période</p>
              )}
            </CardContent>
          </Card>

          {/* Violations de données mensuelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Violations de données</CardTitle>
              <CardDescription>Incidents signalés par mois</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyBreachData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyBreachData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--destructive))" 
                      radius={[4, 4, 0, 0]}
                      name="Violations"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucun incident sur cette période</p>
              )}
            </CardContent>
          </Card>

          {/* Stats détaillées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activité documentaire</CardTitle>
              <CardDescription>Registres et demandes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.total_processing_records}</div>
                  <p className="text-xs text-muted-foreground mt-1">Traitements</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.total_rights_requests}</div>
                  <p className="text-xs text-muted-foreground mt-1">Demandes de droits</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{stats.total_data_breaches}</div>
                  <p className="text-xs text-muted-foreground mt-1">Violations</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.total_subprocessors}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sous-traitants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Comparaisons sectorielles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Comparaisons sectorielles</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scores de conformité par secteur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scores de conformité par secteur</CardTitle>
              <CardDescription>Moyenne, minimum et maximum par secteur d'activité</CardDescription>
            </CardHeader>
            <CardContent>
              {sectorConformityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sectorConformityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="sector" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}%`, 
                        name === 'avg_score' ? 'Moyenne' : name === 'min_score' ? 'Min' : 'Max'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="avg_score" fill="hsl(var(--primary))" name="Moyenne" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Taux de violations par secteur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Taux de violations par secteur</CardTitle>
              <CardDescription>Nombre moyen de violations par organisation</CardDescription>
            </CardHeader>
            <CardContent>
              {sectorBreachData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sectorBreachData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="sector" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'breach_rate' ? value : value,
                        name === 'breach_rate' ? 'Taux' : 'Violations'
                      ]}
                    />
                    <Bar dataKey="breach_count" fill="hsl(var(--destructive))" name="Violations" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Utilisation des sous-traitants par secteur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sous-traitants par secteur</CardTitle>
              <CardDescription>Nombre moyen de sous-traitants déclarés</CardDescription>
            </CardHeader>
            <CardContent>
              {sectorSubprocessorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sectorSubprocessorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="sector" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        value,
                        name === 'avg_subprocessors' ? 'Moyenne' : 'Total'
                      ]}
                    />
                    <Bar dataKey="avg_subprocessors" fill="hsl(var(--secondary))" name="Moyenne" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Répartition par secteur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Répartition par secteur</CardTitle>
              <CardDescription>Distribution des organisations</CardDescription>
            </CardHeader>
            <CardContent>
              {sectorData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sectorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {sectorData.map((entry, index) => (
                      <Badge key={entry.name} variant="outline" className="text-xs">
                        <span 
                          className="w-2 h-2 rounded-full mr-1 inline-block" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {entry.name}: {entry.value}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graphiques de base */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par taille */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par taille</CardTitle>
            <CardDescription>Distribution des organisations par taille</CardDescription>
          </CardHeader>
          <CardContent>
            {sizeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sizeData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Répartition des rôles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des rôles</CardTitle>
            <CardDescription>Distribution des utilisateurs par rôle</CardDescription>
          </CardHeader>
          <CardContent>
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={roleData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note de conformité */}
      <Card className="border-muted">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Note de conformité :</strong> Ce tableau de bord respecte les principes du RGPD 
            (Art. 5 - Minimisation des données, Art. 25 - Protection des données dès la conception). 
            Les statistiques sont calculées de manière agrégée sans possibilité d'identification individuelle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
