import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  User, 
  Search,
  RefreshCw,
  TrendingUp,
  Eye,
  UserX,
  FileEdit,
  Trash2,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { format, formatDistanceToNow, subHours, subDays, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  action_type: string;
  actor_id: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor_email?: string;
  target_email?: string;
}

interface SuspiciousPattern {
  type: 'high_frequency' | 'unusual_hour' | 'bulk_action' | 'sensitive_action';
  severity: 'low' | 'medium' | 'high';
  description: string;
  count: number;
  actor_id: string;
  actor_email?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'user_created': <UserPlus className="h-4 w-4 text-green-500" />,
  'user_deleted': <UserX className="h-4 w-4 text-red-500" />,
  'user_updated': <FileEdit className="h-4 w-4 text-blue-500" />,
  'role_changed': <Shield className="h-4 w-4 text-purple-500" />,
  'organisation_deleted': <Trash2 className="h-4 w-4 text-red-500" />,
  'login': <CheckCircle className="h-4 w-4 text-green-500" />,
  'view': <Eye className="h-4 w-4 text-gray-500" />,
};

const ACTION_LABELS: Record<string, string> = {
  'user_created': 'Création utilisateur',
  'user_deleted': 'Suppression utilisateur',
  'user_updated': 'Modification utilisateur',
  'role_changed': 'Changement de rôle',
  'organisation_deleted': 'Suppression organisation',
  'login': 'Connexion',
  'view': 'Consultation',
  'email_sent': 'Email envoyé',
};

const SENSITIVE_ACTIONS = ['user_deleted', 'role_changed', 'organisation_deleted'];

export const AdminSecurityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');

  // Fetch activity logs
  const { data: activityLogs, isLoading, refetch } = useQuery({
    queryKey: ['admin-activity-logs', timeFilter],
    queryFn: async () => {
      let query = supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
  });

  // Fetch user emails for display
  const { data: usersWithEmails } = useQuery({
    queryKey: ['users-with-emails'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users_with_emails');
      if (error) throw error;
      return data as { user_id: string; email: string }[];
    },
  });

  // Create email lookup map
  const emailMap = useMemo(() => {
    const map = new Map<string, string>();
    usersWithEmails?.forEach(u => map.set(u.user_id, u.email));
    return map;
  }, [usersWithEmails]);

  // Enrich logs with emails
  const enrichedLogs = useMemo(() => {
    if (!activityLogs) return [];
    return activityLogs.map(log => ({
      ...log,
      actor_email: emailMap.get(log.actor_id) || 'Inconnu',
      target_email: log.target_user_id ? emailMap.get(log.target_user_id) : undefined,
    }));
  }, [activityLogs, emailMap]);

  // Filter logs based on time
  const timeFilteredLogs = useMemo(() => {
    if (!enrichedLogs) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeFilter) {
      case '1h':
        startDate = subHours(now, 1);
        break;
      case '24h':
        startDate = subHours(now, 24);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = subHours(now, 24);
    }
    
    return enrichedLogs.filter(log => 
      isWithinInterval(new Date(log.created_at), { start: startDate, end: now })
    );
  }, [enrichedLogs, timeFilter]);

  // Detect suspicious patterns
  const suspiciousPatterns = useMemo((): SuspiciousPattern[] => {
    if (!timeFilteredLogs.length) return [];
    
    const patterns: SuspiciousPattern[] = [];
    const actorActions = new Map<string, ActivityLog[]>();
    
    // Group by actor
    timeFilteredLogs.forEach(log => {
      const existing = actorActions.get(log.actor_id) || [];
      existing.push(log);
      actorActions.set(log.actor_id, existing);
    });
    
    actorActions.forEach((logs, actorId) => {
      const actorEmail = emailMap.get(actorId) || 'Inconnu';
      
      // High frequency detection (more than 20 actions in the time period)
      if (logs.length > 20) {
        patterns.push({
          type: 'high_frequency',
          severity: logs.length > 50 ? 'high' : 'medium',
          description: `${logs.length} actions en ${timeFilter}`,
          count: logs.length,
          actor_id: actorId,
          actor_email: actorEmail,
        });
      }
      
      // Unusual hours detection (actions between 00:00 and 06:00)
      const unusualHourActions = logs.filter(log => {
        const hour = new Date(log.created_at).getHours();
        return hour >= 0 && hour < 6;
      });
      
      if (unusualHourActions.length > 3) {
        patterns.push({
          type: 'unusual_hour',
          severity: unusualHourActions.length > 10 ? 'high' : 'medium',
          description: `${unusualHourActions.length} actions entre 00h et 06h`,
          count: unusualHourActions.length,
          actor_id: actorId,
          actor_email: actorEmail,
        });
      }
      
      // Bulk sensitive actions
      const sensitiveActions = logs.filter(log => 
        SENSITIVE_ACTIONS.includes(log.action_type)
      );
      
      if (sensitiveActions.length > 5) {
        patterns.push({
          type: 'sensitive_action',
          severity: 'high',
          description: `${sensitiveActions.length} actions sensibles`,
          count: sensitiveActions.length,
          actor_id: actorId,
          actor_email: actorEmail,
        });
      }
      
      // Bulk deletions
      const deletions = logs.filter(log => 
        log.action_type.includes('deleted')
      );
      
      if (deletions.length > 3) {
        patterns.push({
          type: 'bulk_action',
          severity: deletions.length > 10 ? 'high' : 'medium',
          description: `${deletions.length} suppressions`,
          count: deletions.length,
          actor_id: actorId,
          actor_email: actorEmail,
        });
      }
    });
    
    return patterns.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [timeFilteredLogs, emailMap, timeFilter]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return timeFilteredLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.actor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
      
      return matchesSearch && matchesAction;
    });
  }, [timeFilteredLogs, searchTerm, actionFilter]);

  // Get unique action types
  const actionTypes = useMemo(() => {
    const types = new Set<string>();
    enrichedLogs?.forEach(log => types.add(log.action_type));
    return Array.from(types);
  }, [enrichedLogs]);

  // Statistics
  const stats = useMemo(() => {
    const total = timeFilteredLogs.length;
    const sensitiveCount = timeFilteredLogs.filter(l => 
      SENSITIVE_ACTIONS.includes(l.action_type)
    ).length;
    const uniqueActors = new Set(timeFilteredLogs.map(l => l.actor_id)).size;
    const highSeverityPatterns = suspiciousPatterns.filter(p => p.severity === 'high').length;
    
    return { total, sensitiveCount, uniqueActors, highSeverityPatterns };
  }, [timeFilteredLogs, suspiciousPatterns]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'high_frequency': return <TrendingUp className="h-4 w-4" />;
      case 'unusual_hour': return <Clock className="h-4 w-4" />;
      case 'bulk_action': return <Trash2 className="h-4 w-4" />;
      case 'sensitive_action': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Monitoring Sécurité Admin
          </h2>
          <p className="text-muted-foreground">
            Surveillance des activités administrateurs et détection des comportements suspects
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              dans les dernières {timeFilter}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions sensibles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sensitiveCount}</div>
            <p className="text-xs text-muted-foreground">
              suppressions, changements de rôle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs actifs</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueActors}</div>
            <p className="text-xs text-muted-foreground">
              dans la période
            </p>
          </CardContent>
        </Card>

        <Card className={stats.highSeverityPatterns > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes critiques</CardTitle>
            <Shield className={`h-4 w-4 ${stats.highSeverityPatterns > 0 ? 'text-destructive' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.highSeverityPatterns > 0 ? 'text-destructive' : 'text-green-500'}`}>
              {stats.highSeverityPatterns}
            </div>
            <p className="text-xs text-muted-foreground">
              comportements suspects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Patterns Alert */}
      {suspiciousPatterns.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Comportements suspects détectés ({suspiciousPatterns.length})
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-400">
              Ces patterns peuvent indiquer une activité anormale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousPatterns.map((pattern, idx) => (
                <Alert key={idx} variant={pattern.severity === 'high' ? 'destructive' : 'default'}>
                  <div className="flex items-center gap-2">
                    {getPatternIcon(pattern.type)}
                    <AlertTitle className="mb-0">
                      {pattern.actor_email}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="flex items-center justify-between mt-2">
                    <span>{pattern.description}</span>
                    <Badge variant={getSeverityColor(pattern.severity)}>
                      {pattern.severity === 'high' ? 'Critique' : pattern.severity === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Journal des activités</CardTitle>
          <CardDescription>Historique complet des actions administrateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email ou action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {ACTION_LABELS[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Acteur</TableHead>
                    <TableHead>Cible</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 100).map((log) => (
                    <TableRow 
                      key={log.id}
                      className={SENSITIVE_ACTIONS.includes(log.action_type) ? 'bg-orange-50 dark:bg-orange-950/20' : ''}
                    >
                      <TableCell>
                        {ACTION_ICONS[log.action_type] || <Activity className="h-4 w-4" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {ACTION_LABELS[log.action_type] || log.action_type}
                          </span>
                          {SENSITIVE_ACTIONS.includes(log.action_type) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Sensible
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.actor_email}</span>
                      </TableCell>
                      <TableCell>
                        {log.target_email ? (
                          <span className="text-sm">{log.target_email}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(log.details).substring(0, 50)}
                            {JSON.stringify(log.details).length > 50 ? '...' : ''}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredLogs.length > 100 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Affichage des 100 premiers résultats sur {filteredLogs.length}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurityMonitoring;
