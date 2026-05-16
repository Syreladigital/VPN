import { useEmailLogs } from '@/hooks/useEmailLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CheckCircle, XCircle, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmailLogsPanelProps {
  organisationId?: string;
}

const getAlertTypeLabel = (type: string) => {
  switch (type) {
    case 'breach': return 'Violation';
    case 'rights_request': return 'Droits';
    case 'subprocessor': return 'Sous-traitant';
    case 'audit_report': return 'Rapport audit';
    case 'client_welcome': return 'Bienvenue client';
    case 'test': return 'Test';
    default: return type;
  }
};

const getAlertTypeColor = (type: string) => {
  switch (type) {
    case 'breach': return 'destructive';
    case 'rights_request': return 'default';
    case 'subprocessor': return 'secondary';
    case 'audit_report': return 'default';
    case 'client_welcome': return 'secondary';
    case 'test': return 'outline';
    default: return 'secondary';
  }
};

const EmailLogsPanel = ({ organisationId }: EmailLogsPanelProps) => {
  const { logs, loading, refetch } = useEmailLogs(organisationId);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Historique des emails</CardTitle>
              <CardDescription>
                Derniers emails envoyés ({logs.length})
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun email envoyé pour le moment</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {log.status === 'sent' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getAlertTypeColor(log.alert_type) as any}>
                        {getAlertTypeLabel(log.alert_type)}
                      </Badge>
                      <Badge variant={log.status === 'sent' ? 'outline' : 'destructive'}>
                        {log.status === 'sent' ? 'Envoyé' : 'Échec'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{log.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      → {log.recipients.join(', ')}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-1">
                        Erreur: {log.error_message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(log.sent_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailLogsPanel;
