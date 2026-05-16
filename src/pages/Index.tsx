import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Organisation } from '@/types/rgpd';
import { OrganisationForm } from '@/components/OrganisationForm';
import { CollaboratorTabs } from '@/components/CollaboratorTabs';
import { AuditDashboard } from '@/components/AuditDashboard';
import { useOrganisations } from '@/hooks/useOrganisations';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { LogOut, User, Loader2, Settings, ShieldCheck, FileText, UserPlus, Users } from 'lucide-react';
import syrelaLogo from '@/assets/syrela-trust-logo.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/NotificationBell';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { AIAssistant } from '@/components/AIAssistant';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin } = useRole();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const { organisations, loading, createOrganisation, deleteOrganisation } = useOrganisations();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateOrganisation = async (org: Omit<Organisation, 'id' | 'createdAt'> & { clientEmail?: string }) => {
    const created = await createOrganisation(org);
    if (created) {
      setOrganisation(created);
      setShowForm(false);
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

  if (organisation) {
    return (
      <AuditDashboard
        organisation={organisation}
        onBack={() => setOrganisation(null)}
        profile={profile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={syrelaLogo} alt="Syrela Trust" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">SyrelaTrust</h1>
              <p className="text-xs text-muted-foreground">Audits RGPD Sectoriels</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell organisationId={organisations[0]?.id} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : user.email}
                </DropdownMenuLabel>
                {profile?.job_title && (
                  <p className="px-2 pb-2 text-xs text-muted-foreground">{profile.job_title}</p>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/documentation')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Documentation RGPD
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Administration
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=clients')}>
                    <Users className="mr-2 h-4 w-4" />
                    Clients
                  </DropdownMenuItem>
                )}
                {isSuperAdmin && (
                  <DropdownMenuItem onClick={() => setShowCreateUserDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Ajout de collaborateur
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex flex-col items-center px-4 py-8">
        {showForm ? (
          <OrganisationForm 
            onSubmit={handleCreateOrganisation}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <CollaboratorTabs
            organisations={organisations}
            loading={loading}
            profile={profile}
            onSelect={setOrganisation}
            onCreateNew={() => setShowForm(true)}
            onDelete={deleteOrganisation}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Outil conforme aux recommandations CNIL — Toute validation finale est humaine
          </p>
        </div>
      </footer>
      {/* Create User Dialog */}
      {isSuperAdmin && (
        <CreateUserDialog
          open={showCreateUserDialog}
          onOpenChange={setShowCreateUserDialog}
          onUserCreated={() => setShowCreateUserDialog(false)}
          isSuperAdmin={isSuperAdmin}
          triggerButton={false}
        />
      )}

      {/* AI Assistant - visible dès la page principale */}
      <AIAssistant 
        context={{
          organisationName: undefined,
          sector: undefined,
          size: undefined,
          dpoRole: undefined,
          currentModule: 'Accueil',
          conformityScore: undefined,
        }}
        mode="audit"
      />
    </div>
  );
};

export default Index;
