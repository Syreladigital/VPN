import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Database, TrendingUp, Users } from 'lucide-react';
import type { AuditLog } from '@/hooks/useAuditLogs';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditActivityDashboardProps {
  logs: AuditLog[];
}

const TABLE_LABELS: Record<string, string> = {
  organisations: 'Organisations',
  processing_records: 'Traitements',
  data_breaches: 'Violations',
  rights_requests: 'Droits',
  subprocessors: 'Sous-traitants',
  audit_results: 'Résultats audit',
  corrective_actions: 'Actions correctives',
  profiles: 'Profils',
  user_roles: 'Rôles',
  client_access: 'Accès clients',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'hsl(142, 76%, 36%)',
  UPDATE: 'hsl(217, 91%, 60%)',
  DELETE: 'hsl(0, 84%, 60%)',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
};

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 65%, 60%)',
  'hsl(180, 65%, 45%)',
  'hsl(330, 65%, 55%)',
  'hsl(60, 70%, 45%)',
  'hsl(200, 65%, 50%)',
  'hsl(100, 50%, 45%)',
];

export function AuditActivityDashboard({ logs }: AuditActivityDashboardProps) {
  // KPIs
  const kpis = useMemo(() => {
    const today = startOfDay(new Date());
    const lastWeek = subDays(today, 7);
    const lastMonth = subDays(today, 30);

    const todayLogs = logs.filter(
      (log) => startOfDay(new Date(log.timestamp)) >= today
    );
    const weekLogs = logs.filter((log) => new Date(log.timestamp) >= lastWeek);
    const monthLogs = logs.filter(
      (log) => new Date(log.timestamp) >= lastMonth
    );

    const uniqueTables = new Set(logs.map((log) => log.table_name)).size;
    const uniqueUsers = new Set(logs.map((log) => log.user_id).filter(Boolean))
      .size;

    return {
      today: todayLogs.length,
      week: weekLogs.length,
      month: monthLogs.length,
      total: logs.length,
      tables: uniqueTables,
      users: uniqueUsers,
    };
  }, [logs]);

  // Données pour le graphique de tendance quotidienne (30 derniers jours)
  const dailyTrendData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);

    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= dayStart && logDate < dayEnd;
      });

      return {
        date: format(day, 'dd/MM', { locale: fr }),
        fullDate: format(day, 'dd MMM', { locale: fr }),
        total: dayLogs.length,
        CREATE: dayLogs.filter((l) => l.action === 'CREATE').length,
        UPDATE: dayLogs.filter((l) => l.action === 'UPDATE').length,
        DELETE: dayLogs.filter((l) => l.action === 'DELETE').length,
      };
    });
  }, [logs]);

  // Données par table
  const tableData = useMemo(() => {
    const tableCounts: Record<string, number> = {};

    logs.forEach((log) => {
      tableCounts[log.table_name] = (tableCounts[log.table_name] || 0) + 1;
    });

    return Object.entries(tableCounts)
      .map(([table, count]) => ({
        table,
        label: TABLE_LABELS[table] || table,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Données par action
  const actionData = useMemo(() => {
    const actionCounts: Record<string, number> = {};

    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return Object.entries(actionCounts).map(([action, count]) => ({
      action,
      label: ACTION_LABELS[action] || action,
      count,
      color: ACTION_COLORS[action] || 'hsl(var(--muted))',
    }));
  }, [logs]);

  // Données par table et action (stacked bar)
  const tableActionData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};

    logs.forEach((log) => {
      if (!data[log.table_name]) {
        data[log.table_name] = { CREATE: 0, UPDATE: 0, DELETE: 0 };
      }
      data[log.table_name][log.action]++;
    });

    return Object.entries(data)
      .map(([table, actions]) => ({
        table,
        label: TABLE_LABELS[table] || table,
        CREATE: actions.CREATE || 0,
        UPDATE: actions.UPDATE || 0,
        DELETE: actions.DELETE || 0,
      }))
      .sort(
        (a, b) =>
          (b.CREATE + b.UPDATE + b.DELETE) - (a.CREATE + a.UPDATE + a.DELETE)
      );
  }, [logs]);

  // Top utilisateurs actifs
  const topUsers = useMemo(() => {
    const userCounts: Record<
      string,
      { count: number; name: string; id: string }
    > = {};

    logs.forEach((log) => {
      if (log.user_id) {
        if (!userCounts[log.user_id]) {
          userCounts[log.user_id] = {
            count: 0,
            name: log.user_name || 'Utilisateur inconnu',
            id: log.user_id,
          };
        }
        userCounts[log.user_id].count++;
      }
    });

    return Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Aucune donnée d'activité disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">7 derniers jours</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.week}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">30 derniers jours</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.month}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Tables</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.tables}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-500" />
              <span className="text-sm text-muted-foreground">Utilisateurs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.users}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendance quotidienne */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Activité quotidienne (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullDate || ''
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="CREATE"
                    name="Créations"
                    stroke={ACTION_COLORS.CREATE}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="UPDATE"
                    name="Modifications"
                    stroke={ACTION_COLORS.UPDATE}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="DELETE"
                    name="Suppressions"
                    stroke={ACTION_COLORS.DELETE}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par action */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition par type d'action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ label, percent }) =>
                      `${label} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={true}
                  >
                    {actionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activité par table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité par table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" name="Actions" radius={[0, 4, 4, 0]}>
                    {tableData.slice(0, 8).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique détaillé par table et action + Top utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Détail par table et type d'action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableActionData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="CREATE"
                    name="Créations"
                    stackId="a"
                    fill={ACTION_COLORS.CREATE}
                  />
                  <Bar
                    dataKey="UPDATE"
                    name="Modifications"
                    stackId="a"
                    fill={ACTION_COLORS.UPDATE}
                  />
                  <Bar
                    dataKey="DELETE"
                    name="Suppressions"
                    stackId="a"
                    fill={ACTION_COLORS.DELETE}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs les plus actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun utilisateur identifié
                </p>
              ) : (
                topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={index === 0 ? 'default' : 'secondary'}
                        className="w-6 h-6 rounded-full flex items-center justify-center p-0"
                      >
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {user.count} actions
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
