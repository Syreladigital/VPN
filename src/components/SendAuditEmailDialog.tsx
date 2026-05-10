import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useOrganisationClients } from '@/hooks/useOrganisationClients';
import { supabase } from '@/integrations/supabase/client';
import { AuditResultsData } from '@/hooks/useAuditResults';
import { Mail, Loader2, Users, Send, UserPlus, ArrowLeft } from 'lucide-react';

interface SendAuditEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisationId: string;
  organisationName: string;
  auditResults: AuditResultsData;
}

export function SendAuditEmailDialog({
  open,
  onOpenChange,
  organisationId,
  organisationName,
  auditResults,
}: SendAuditEmailDialogProps) {
  const { toast } = useToast();
  const { clients, isLoading: isLoadingClients, refetch } = useOrganisationClients(organisationId);

  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');

  useEffect(() => {
    if (clients.length > 0 && open) {
      setSelectedClients(clients.map(c => c.userId));
    }
  }, [clients, open]);

  useEffect(() => {
    if (!open) {
      setShowCreateForm(false);
      setNewClientEmail('');
      setNewClientFirstName('');
      setNewClientLastName('');
    }
  }, [open]);

  const handleClientToggle = (userId: string) => {
    setSelectedClients(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.userId));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateClient = async () => {
    if (!newClientEmail || !newClientFirstName || !newClientLastName) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const password = generatePassword();

      const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
        body: { email: newClientEmail, password, firstName: newClientFirstName, lastName: newClientLastName, role: 'client' },
      });

      if (userError) throw userError;
      if (!userData?.user?.id) throw new Error('Erreur lors de la création de l\'utilisateur');

      const userId = userData.user.id;

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const grantedBy = sessionData.session?.user.id;

      const { error: accessError } = await supabase
        .from('client_access')
        .insert({ client_user_id: userId, organisation_id: organisationId, granted_by: grantedBy });

      if (accessError) throw accessError;

      try {
        await supabase.functions.invoke('send-client-welcome-email', {
          body: { email: newClientEmail, firstName: newClientFirstName, lastName: newClientLastName, password, organisationName, portalUrl: `${window.location.origin}/client` },
        });
      } catch (emailError) {
        console.warn('Welcome email failed, but client was created:', emailError);
      }

      toast({ title: 'Client créé', description: `${newClientFirstName} ${newClientLastName} a été ajouté avec succès` });

      setNewClientEmail('');
      setNewClientFirstName('');
      setNewClientLastName('');
      setShowCreateForm(false);
      await refetch();
    } catch (error: unknown) {
      console.error('Error creating client:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le client',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSend = async () => {
    if (selectedClients.length === 0) {
      toast({ title: 'Aucun client sélectionné', description: 'Veuillez sélectionner au moins un client', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      const selectedClientData = clients.filter(c => selectedClients.includes(c.userId));

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Session non valide');

      const portalUrl = `${window.location.origin}/client`;

      const response = await supabase.functions.invoke('send-audit-completion-email', {
        body: {
          organisationId,
          organisationName,
          clientEmails: selectedClientData.map(c => c.email),
          clientNames: selectedClientData.map(c => c.fullName),
          complianceScore: auditResults.complianceScore,
          answeredQuestions: auditResults.answeredQuestions,
          totalQuestions: auditResults.totalQuestions,
          risksHigh: auditResults.risksHigh,
          conformeCount: auditResults.conformeCount,
          partielCount: auditResults.partielCount,
          nonConformeCount: auditResults.nonConformeCount,
          completedAt: auditResults.completedAt || new Date().toISOString(),
          portalUrl,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Erreur lors de l\'envoi');

      toast({ title: 'Emails envoyés', description: `${selectedClientData.length} client(s) notifié(s) avec succès` });
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error sending audit emails:', error);
      toast({
        title: 'Erreur d\'envoi',
        description: error instanceof Error ? error.message : 'Impossible d\'envoyer les emails',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showCreateForm ? (
              <><UserPlus className="h-5 w-5 text-primary" />Ajouter un client</>
            ) : (
              <><Mail className="h-5 w-5 text-primary" />Envoyer le rapport au client</>
            )}
          </DialogTitle>
          <DialogDescription>
            {showCreateForm
              ? <>Créez un compte client pour <strong>{organisationName}</strong>.</>
              : <>Sélectionnez les clients à notifier avec les résultats de l'audit de <strong>{organisationName}</strong>.</>}
          </DialogDescription>
        </DialogHeader>

        {showCreateForm ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email *</Label>
              <Input id="client-email" type="email" placeholder="email@exemple.com" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client-firstname">Prénom *</Label>
                <Input id="client-firstname" placeholder="Jean" value={newClientFirstName} onChange={(e) => setNewClientFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-lastname">Nom *</Label>
                <Input id="client-lastname" placeholder="Dupont" value={newClientLastName} onChange={(e) => setNewClientLastName(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Un email avec les identifiants de connexion sera envoyé automatiquement au client.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Score:</span><span className="ml-2 font-semibold">{auditResults.complianceScore}%</span></div>
                <div><span className="text-muted-foreground">Questions:</span><span className="ml-2 font-semibold">{auditResults.answeredQuestions}/{auditResults.totalQuestions}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              {isLoadingClients ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />Chargement des clients...
                </div>
              ) : clients.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground py-6">
                  <Users className="h-8 w-8" />
                  <p>Aucun client associé à cette organisation</p>
                  <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />Créer un compte client
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Clients à notifier ({selectedClients.length}/{clients.length})</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(true)} className="text-xs h-7">
                        <UserPlus className="h-3 w-3 mr-1" />Ajouter
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs h-7">
                        {selectedClients.length === clients.length ? 'Désélectionner' : 'Tout sélectionner'}
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[150px] rounded-md border p-3">
                    <div className="space-y-3">
                      {clients.map((client) => (
                        <div key={client.userId} className="flex items-center space-x-3">
                          <Checkbox
                            id={`send-client-${client.userId}`}
                            checked={selectedClients.includes(client.userId)}
                            onCheckedChange={() => handleClientToggle(client.userId)}
                          />
                          <Label htmlFor={`send-client-${client.userId}`} className="flex-1 cursor-pointer">
                            <span className="font-medium">{client.fullName}</span>
                            <span className="block text-xs text-muted-foreground">{client.email}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {showCreateForm ? (
            <>
              <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isCreating}>
                <ArrowLeft className="h-4 w-4 mr-2" />Retour
              </Button>
              <Button onClick={handleCreateClient} disabled={isCreating || !newClientEmail || !newClientFirstName || !newClientLastName}>
                {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Création...</> : <><UserPlus className="h-4 w-4 mr-2" />Créer le client</>}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>Annuler</Button>
              <Button onClick={handleSend} disabled={isSending || selectedClients.length === 0 || clients.length === 0}>
                {isSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours...</> : <><Send className="h-4 w-4 mr-2" />Envoyer ({selectedClients.length})</>}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
