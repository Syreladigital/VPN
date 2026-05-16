import { useState } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, Clock, FileText, Users, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  organisationId?: string;
}

export function NotificationBell({ organisationId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications(organisationId);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getReferenceIcon = (type: string | null) => {
    switch (type) {
      case 'data_breach':
        return <AlertTriangle className="h-3 w-3" />;
      case 'rights_request':
        return <Users className="h-3 w-3" />;
      case 'subprocessor':
        return <Factory className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to appropriate tab
    if (notification.reference_type === 'data_breach') {
      navigate('/documentation?tab=breaches');
    } else if (notification.reference_type === 'rights_request') {
      navigate('/documentation?tab=rights');
    } else if (notification.reference_type === 'subprocessor') {
      navigate('/documentation?tab=subprocessors');
    }
    setIsOpen(false);
  };

  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`${unreadCount} notifications non lues`}
        >
          <Bell className={cn("h-5 w-5", criticalCount > 0 && "text-destructive")} />
          {unreadCount > 0 && (
            <Badge 
              variant={criticalCount > 0 ? "destructive" : "default"}
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout lire
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
              <p className="text-xs mt-1">Les alertes RGPD apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                      notification.severity === 'critical' && "bg-destructive/10",
                      notification.severity === 'warning' && "bg-warning/10",
                      notification.severity === 'info' && "bg-muted"
                    )}>
                      {getSeverityIcon(notification.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.read && "text-foreground",
                          notification.read && "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {notification.reference_type && (
                          <Badge variant="outline" className="text-xs h-5 gap-1">
                            {getReferenceIcon(notification.reference_type)}
                            {notification.reference_type === 'data_breach' && 'Violation'}
                            {notification.reference_type === 'rights_request' && 'Demande de droits'}
                            {notification.reference_type === 'subprocessor' && 'Sous-traitant'}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.created_at, { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs h-8"
                onClick={() => {
                  navigate('/documentation');
                  setIsOpen(false);
                }}
              >
                Voir le centre de documentation
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}