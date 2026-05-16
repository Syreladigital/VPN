import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Download, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInHours, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Notification, useNotifications } from '@/hooks/useNotifications';
import { useDataBreaches } from '@/hooks/useDataBreaches';
import { useRightsRequests } from '@/hooks/useRightsRequests';
import { useSubprocessors } from '@/hooks/useSubprocessors';
import { exportAlertsPDF } from '@/services/exportAlertsPDF';
import { useToast } from '@/hooks/use-toast';

interface AlertsDashboardProps {
  organisationId: string;
  organisationName: string;
}

export function AlertsDashboard({ organisationId, organisationName }: AlertsDashboardProps) {
  const { notifications, loading, refreshNotifications, generateDeadlineNotifications, markAsRead, dismissNotification } = useNotifications(organisationId);
  const { breaches } = useDataBreaches(organisationId);
  const { requests } = useRightsRequests(organisationId);
  const { subprocessors } = useSubprocessors(organisationId);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const criticalAlerts = notifications.filter(n => n.severity === 'critical');
  const warningAlerts = notifications.filter(n => n.severity === 'warning');
  const infoAlerts = notifications.filter(n => n.severity === 'info');

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateDeadlineNotifications(organisationId);
    await refreshNotifications();
    setRefreshing(false);
    toast({ title: 'Alertes actualisées' });
  };

  const handleExportPDF = async () => {
    try {
      await exportAlertsPDF({
        organisationName,
        notifications,
        breaches,
        requests,
        subprocessors,
      });
      toast({ title: 'PDF exporté avec succès' });
    } catch (error) {
      toast({ title: 'Erreur lors de l\'export', variant: 'destructive' });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critique</Badge>;
      case 'warning': return <Badge className="bg-warning text-warning-foreground">Urgent</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const renderDeadlineStatus = (dueDate: Date | null) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const isOverdue = isPast(dueDate);
    const hoursRemaining = differenceInHours(dueDate, now);
    const daysRemaining = differenceInDays(dueDate, now);

    if (isOverdue) {
      return <Badge variant="destructive">Dépassé</Badge>;
    } else if (hoursRemaining <= 24) {
      return <Badge className="bg-destructive/80">{hoursRemaining}h restantes</Badge>;
    } else if (daysRemaining <= 7) {
      return <Badge className="bg-warning text-warning-foreground">{daysRemaining}j restants</Badge>;
    } else {
      return <Badge variant="outline">{daysRemaining}j restants</Badge>;
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`mb-3 ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {getSeverityIcon(notification.severity)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{notification.title}</span>
                {getSeverityBadge(notification.severity)}
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(notification.created_at, 'dd/MM/yyyy HH:mm', { locale: fr })}
                </span>
                {notification.due_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Échéance: {format(notification.due_date, 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {renderDeadlineStatus(notification.due_date)}
            <div className="flex gap-1">
              {!notification.read && (
                <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => dismissNotification(notification.id)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord des alertes</h2>
          <p className="text-muted-foreground">Suivi des échéances RGPD et alertes actives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/profile#email-settings')}>
            <Mail className="h-4 w-4 mr-2" />
            Configurer les emails
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Alertes critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Délais dépassés ou imminents</p>
          </CardContent>
        </Card>

        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{warningAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Actions à prévoir</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{infoAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Rappels et suivis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Total actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">{notifications.filter(n => !n.read).length} non lues</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-destructive">
            Critiques ({criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="warning">
            Urgentes ({warningAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="info">
            Info ({infoAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ScrollArea className="h-[500px]">
            {notifications.length === 0 ? (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Aucune alerte active</h3>
                  <p className="text-muted-foreground">Tous les délais RGPD sont respectés.</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          <ScrollArea className="h-[500px]">
            {criticalAlerts.length === 0 ? (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Aucune alerte critique</h3>
                  <p className="text-muted-foreground">Aucun délai n'est dépassé.</p>
                </CardContent>
              </Card>
            ) : (
              criticalAlerts.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="warning" className="mt-4">
          <ScrollArea className="h-[500px]">
            {warningAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Aucun avertissement</h3>
                  <p className="text-muted-foreground">Pas d'échéance urgente à venir.</p>
                </CardContent>
              </Card>
            ) : (
              warningAlerts.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <ScrollArea className="h-[500px]">
            {infoAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Aucune information</h3>
                  <p className="text-muted-foreground">Pas de rappel ou suivi en cours.</p>
                </CardContent>
              </Card>
            ) : (
              infoAlerts.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
