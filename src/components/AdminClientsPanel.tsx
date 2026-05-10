import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, UserPlus, Users, Trash2, Building2, Calendar, Link2, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientAccess {
  id: string;
  client_user_id: string;
  organisation_id: string;
  granted_at: string;
  expires_at: string | null;
  organisation?: { id: string; name: string };
  profile?: { first_name: string | null; last_name: string | null };
  email?: string;
}

interface Organisation {
  id: string;
  name: string;
}

export const AdminClientsPanel = () => {
  const { toast } = useToast();
  const [clientAccesses, setClientAccesses] = useState<ClientAccess[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: accessData, error: accessError } = await supabase
        .from('client_access')
        .select('*')
        .order('granted_at', { ascending: false });

      if (accessError) throw accessError;

      const { data: orgData, error: orgError } = await supabase
        .from('organisations')
        .select('id, name')
        .order('name');

      if (orgError) throw orgError;
      setOrganisations(orgData || []);

      if (accessData) {
        const enriched = await Promise.all(
          accessData.map(async (access) => {
            const org = orgData?.find(o => o.id === access.organisation_id);

            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', access.client_user_id)
              .maybeSingle();

            const { data: usersData } = await supabase.rpc('get_users_with_emails');
            const userEmail = usersData?.find((u: { user_id: string }) => u.user_id === access.client_user_id)?.email;

            return { ...access, organisation: org, profile: profileData, email: userEmail };
          })
        );
        setClientAccesses(enriched);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateClient = async () => {
    if (!email || !password || !selectedOrgId) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data: createData, error: createError } = await supabase.functions.invoke('create-user', {
        body: { email, password, first_name: firstName, last_name: lastName, role: 'client' },
      });

      if (createError) throw createError;
      if (createData?.error) throw new Error(createData.error);

      const newUserId = createData.user?.id;
      if (!newUserId) throw new Error('Utilisateur non créé');

      const { data: currentUser } = await supabase.auth.getUser();
      const { error: accessError } = await supabase
        .from('client_access')
        .insert({
          client_user_id: newUserId,
          organisation_id: selectedOrgId,
          granted_by: currentUser.user?.id,
        });

      if (accessError) throw accessError;

      if (sendWelcomeEmail) {
        const selectedOrg = organisations.find(o => o.id === selectedOrgId);
        const recipientName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '';
        try {
          const { error: emailError } = await supabase.functions.invoke('send-client-welcome-email', {
            body: { recipientEmail: email, recipientName, password, organisationName: selectedOrg?.name || 'Organisation', loginUrl: `${window.location.origin}/auth` },
          });
          if (emailError) {
            console.error('Error sending welcome email:', emailError);
            toast({ title: 'Client créé', description: `Le compte client a été créé mais l'email de bienvenue n'a pas pu être envoyé.` });
          } else {
            toast({ title: 'Client créé', description: `Le compte client ${email} a été créé et un email de bienvenue a été envoyé.` });
          }
        } catch (emailErr) {
          console.error('Error sending welcome email:', emailErr);
          toast({ title: 'Client créé', description: `Le compte client a été créé mais l'email de bienvenue n'a pas pu être envoyé.` });
        }
      } else {
        toast({ title: 'Client créé', description: `Le compte client ${email} a été créé et associé à l'organisation` });
      }

      setEmail(''); setPassword(''); setFirstName(''); setLastName(''); setSelectedOrgId('');
      setSendWelcomeEmail(true);
      setDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      console.error('Error creating client:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le client',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccess = async (accessId: string) => {
    setDeletingId(accessId);
    try {
      const { error } = await supabase.from('client_access').delete().eq('id', accessId);
      if (error) throw error;
      toast({ title: 'Accès révoqué', description: 'L\'accès client a été supprimé' });
      fetchData();
    } catch (error) {
      console.error('Error deleting access:', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'accès', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(result);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-blue-500/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 ring-4 ring-blue-500/10">
              <Users className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Gestion des Clients</h2>
              <p className="text-muted-foreground">
                {clientAccesses.length} accès client{clientAccesses.length > 1 ? 's' : ''} configuré{clientAccesses.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" />Créer un client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un compte client</DialogTitle>
                <DialogDescription>Le client pourra accéder au portail en lecture seule</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@entreprise.fr" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Button type="button" variant="link" size="sm" onClick={generatePassword} className="h-auto p-0 text-xs">Générer</Button>
                  </div>
                  <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organisation">Organisation *</Label>
                  <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une organisation" /></SelectTrigger>
                    <SelectContent>
                      {organisations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="sendWelcomeEmail" checked={sendWelcomeEmail} onCheckedChange={(checked) => setSendWelcomeEmail(checked === true)} />
                  <Label htmlFor="sendWelcomeEmail" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Envoyer un email de bienvenue avec les identifiants
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreateClient} disabled={creating}>
                  {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : 'Créer le client'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" />Accès clients actifs</CardTitle>
          <CardDescription>Liste des clients ayant accès au portail lecture seule</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : clientAccesses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Aucun client configuré</p>
              <p className="text-sm text-muted-foreground">Créez un compte client pour lui donner accès au portail</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Accès depuis</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientAccesses.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {access.profile?.first_name && access.profile?.last_name
                              ? `${access.profile.first_name} ${access.profile.last_name}`
                              : 'Nom non renseigné'}
                          </p>
                          <p className="text-sm text-muted-foreground">{access.email || access.client_user_id.slice(0, 8) + '...'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {access.organisation?.name || 'Organisation inconnue'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(access.granted_at), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {access.expires_at
                          ? <Badge variant="outline">{format(new Date(access.expires_at), 'dd MMM yyyy', { locale: fr })}</Badge>
                          : <Badge variant="secondary">Permanent</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={deletingId === access.id}>
                              {deletingId === access.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Révoquer l'accès</AlertDialogTitle>
                              <AlertDialogDescription>Le client n'aura plus accès au portail. Cette action ne supprime pas le compte utilisateur.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAccess(access.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Révoquer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
