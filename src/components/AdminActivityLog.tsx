import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity, UserCog, UserMinus, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityLog, ActivityLogDetails } from '@/hooks/useActivityLogs';

interface AdminActivityLogProps {
  logs: ActivityLog[];
  loading: boolean;
  onRefresh: () => void;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'role_change':
      return <UserCog className="h-4 w-4" />;
    case 'user_delete':
      return <UserMinus className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActionBadge = (actionType: string) => {
  switch (actionType) {
    case 'role_change':
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          Rôle modifié
        </Badge>
      );
    case 'user_delete':
      return (
        <Badge variant="outline" className="text-red-600 border-red-300">
          Suppression
        </Badge>
      );
    default:
      return <Badge variant="outline">Action</Badge>;
  }
};

const formatDetails = (log: ActivityLog) => {
  if (log.action_type === 'role_change' && log.details) {
    const oldRole = log.details.old_role as string;
    const newRole = log.details.new_role as string;
    const roleLabels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      user: 'Utilisateur',
    };
    return `${roleLabels[oldRole] || oldRole} → ${roleLabels[newRole] || newRole}`;
  }
  if (log.action_type === 'user_delete' && log.details) {
    return `Email: ${log.details.deleted_email || 'N/A'}`;
  }
  return null;
};

export const AdminActivityLog = ({
  logs,
  loading,
  onRefresh,
}: AdminActivityLogProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Journal d'activité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Journal d'activité
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune activité enregistrée
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-muted">
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action_type)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'PPp', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      <span className="font-medium">{log.actor_name}</span>
                      {log.action_type === 'role_change' && (
                        <>
                          {' '}
                          a modifié le rôle de{' '}
                          <span className="font-medium">{log.target_name}</span>
                        </>
                      )}
                      {log.action_type === 'user_delete' && (
                        <>
                          {' '}
                          a supprimé l'utilisateur{' '}
                          <span className="font-medium">{log.target_name}</span>
                        </>
                      )}
                    </p>
                    {formatDetails(log) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDetails(log)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
