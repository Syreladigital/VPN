import { useState } from 'react';
import { MessageSquare, X, User, UserCheck, RefreshCw } from 'lucide-react';
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
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface MessageBadgeProps {
  organisationId?: string;
}

export function MessageBadge({ organisationId }: MessageBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { messages, loading, markAsRead, getUnreadCount } = useMessages(organisationId);

  const unreadCount = getUnreadCount();
  const recentMessages = messages.slice(0, 5);

  const handleMessageClick = async (messageId: string) => {
    await markAsRead(messageId);
    navigate('/documentation?tab=messages');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`${unreadCount} messages non lus`}
        >
          <MessageSquare className={cn("h-5 w-5", unreadCount > 0 && "text-primary")} />
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h4 className="font-semibold">Messages</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <RefreshCw className="h-5 w-5 mx-auto animate-spin" />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun message</p>
              <p className="text-xs mt-1">Vos échanges apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                    !message.read_at && "bg-primary/5"
                  )}
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                      message.is_from_consultant ? "bg-primary/10" : "bg-muted"
                    )}>
                      {message.is_from_consultant ? (
                        <UserCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !message.read_at && "text-foreground",
                          message.read_at && "text-muted-foreground"
                        )}>
                          {message.subject}
                        </p>
                        {!message.read_at && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={message.is_from_consultant ? 'default' : 'secondary'}
                          className="text-[10px] h-4 px-1"
                        >
                          {message.is_from_consultant ? 'Consultant' : 'Client'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-xs h-8"
            onClick={() => {
              navigate('/documentation?tab=messages');
              setIsOpen(false);
            }}
          >
            Voir tous les messages
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
