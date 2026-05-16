import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, Mail, MailOpen, Plus, RefreshCw, User, UserCheck } from 'lucide-react';
import { useMessages, Message } from '@/hooks/useMessages';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessagingPanelProps {
  organisationId?: string;
  organisationName?: string;
}

export function MessagingPanel({ organisationId, organisationName }: MessagingPanelProps) {
  const { messages, loading, sendMessage, markAsRead, refetch } = useMessages(organisationId);
  const { isAdmin, isSuperAdmin } = useRole();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [sending, setSending] = useState(false);

  const isConsultant = isAdmin || isSuperAdmin;

  const handleSendMessage = async () => {
    if (!organisationId || !newSubject.trim() || !newContent.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      await sendMessage(organisationId, newSubject, newContent, isConsultant);
      toast({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé avec succès',
      });
      setNewSubject('');
      setNewContent('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read_at) {
      await markAsRead(message.id);
    }
  };

  const handleReply = () => {
    if (selectedMessage) {
      setNewSubject(`Re: ${selectedMessage.subject}`);
      setSelectedMessage(null);
      setIsDialogOpen(true);
    }
  };

  if (!organisationId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Sélectionnez une organisation pour accéder à la messagerie
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messagerie
            </CardTitle>
            <CardDescription>
              {isConsultant
                ? `Échangez avec le client ${organisationName || ''}`
                : 'Échangez avec votre consultant RGPD'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nouveau message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Input
                      placeholder="Objet du message"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Votre message..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newSubject.trim() || !newContent.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Envoi en cours...' : 'Envoyer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun message pour le moment</p>
              <p className="text-sm">Envoyez votre premier message pour démarrer la conversation</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                      !message.read_at ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {message.read_at ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <span className="font-medium truncate">{message.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={message.is_from_consultant ? 'default' : 'secondary'}>
                          {message.is_from_consultant ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Consultant
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              Client
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(message.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Message detail dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedMessage.subject}
                  <Badge variant={selectedMessage.is_from_consultant ? 'default' : 'secondary'}>
                    {selectedMessage.is_from_consultant ? 'Consultant' : 'Client'}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedMessage.created_at), "d MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </p>
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
                <Button onClick={handleReply} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Répondre
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
