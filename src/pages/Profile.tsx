import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganisations } from '@/hooks/useOrganisations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Loader2, 
  Save, 
  Trash2,
  Mail
} from 'lucide-react';
import syrelaLogo from '@/assets/syrela-trust-logo.png';
import EmailNotificationSettings from '@/components/EmailNotificationSettings';
import { profileFormSchema, getFirstError } from '@/lib/validationSchemas';
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const { organisations, loading: orgsLoading, deleteOrganisation } = useOrganisations();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setJobTitle(profile.job_title || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
    };
    
    const validationError = getFirstError(profileFormSchema, formData);
    if (validationError) {
      toast({
        title: 'Erreur de validation',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);

    const { error } = await updateProfile({
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      job_title: jobTitle.trim() || null,
    });

    setSaving(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={syrelaLogo} alt="Syrela Trust" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-semibold">Mon Profil</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.first_name || profile?.last_name 
                  ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                  : user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de profil DPO
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Fonction</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="Délégué à la Protection des Données"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Cette information apparaîtra dans les rapports d'audit exportés
                </p>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'adresse email ne peut pas être modifiée
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Mes organisations</CardTitle>
                <CardDescription>
                  Liste des organisations que vous gérez
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : organisations.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Aucune organisation enregistrée
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/app')}
                >
                  Créer une organisation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {organisations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {org.sector} • {org.size}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'organisation ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera définitivement "{org.name}" et tous ses audits associés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteOrganisation(org.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Notifications - show if at least one org */}
        {organisations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notifications email</h2>
                <p className="text-sm text-muted-foreground">
                  Configurez les alertes email pour votre première organisation
                </p>
              </div>
            </div>
            <EmailNotificationSettings organisationId={organisations[0]?.id} />
          </div>
        )}

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <span className="font-medium text-foreground">ID utilisateur :</span>{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{user.id}</code>
            </p>
            <p>
              <span className="font-medium text-foreground">Compte créé le :</span>{' '}
              {new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
