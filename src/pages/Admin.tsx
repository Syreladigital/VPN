import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole, AppRole } from '@/hooks/useRole';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminOrganisations } from '@/hooks/useAdminOrganisations';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ArrowLeft, Shield, Users, Loader2, ShieldCheck, User, FileText, Trash2, Crown, Activity, BarChart3, Building2, Search, Eye, ScrollText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LoggingPolicyDocumentation } from '@/components/LoggingPolicyDocumentation';
import { AdminActivityLog } from '@/components/AdminActivityLog';
import { AdminAnonymizedDashboard } from '@/components/AdminAnonymizedDashboard';
import { AdminOrganisationsPanel } from '@/components/AdminOrganisationsPanel';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { AdminSecurityMonitoring } from '@/components/AdminSecurityMonitoring';
import { AuditLogsViewer } from '@/components/AuditLogsViewer';
import syrelaLogo from '@/assets/syrela-trust-logo.png';

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useRole();
  const { users, loading: usersLoading, updateUserRole, deleteUser, refresh: refreshUsers } = useAdminUsers();
  const { organisations, loading: orgsLoading } = useAdminOrganisations();
  const { logs, loading: logsLoading, logActivity, refresh: refreshLogs } = useActivityLogs();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Controlled tab state from URL params
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };
  // Filter users by search query
  const filteredUsers = users.filter(u => {
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(query) ||
      (u.email?.toLowerCase() || '').includes(query) ||
      (u.job_title?.toLowerCase() || '').includes(query)
    );
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/app');
    }
  }, [isAdmin, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleDeleteUser = async (userId: string, userEmail?: string) => {
    setDeletingUserId(userId);
    await deleteUser(userId, userEmail, logActivity);
    setDeletingUserId(null);
  };

  const handleRoleChange = (userId: string, newRole: AppRole, oldRole: AppRole) => {
    updateUserRole(userId, newRole, oldRole, logActivity);
  };

  const superAdminCount = users.filter((u) => u.role === 'super_admin').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge variant="destructive" className="gap-1">
            <Crown className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            Utilisateur
          </Badge>
        );
    }
  };

  const canEditRole = (targetRole: AppRole) => {
    if (isSuperAdmin) return true;
    // Admins can't edit super_admin roles
    return targetRole !== 'super_admin';
  };

  const getAvailableRoles = (): AppRole[] => {
    if (isSuperAdmin) {
      return ['user', 'admin', 'super_admin'];
    }
    return ['user', 'admin'];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={syrelaLogo} alt="Syrela Trust" className="h-10 w-auto" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              {isSuperAdmin ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {isSuperAdmin ? 'Super Administration' : 'Administration'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isSuperAdmin 
                  ? 'Gestion complète des utilisateurs et permissions'
                  : 'Gestion des utilisateurs et conformité'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="organisations" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organisations
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Journal d'activité
            </TabsTrigger>
            <TabsTrigger value="logging" className="gap-2">
              <FileText className="h-4 w-4" />
              Politique de journalisation
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Eye className="h-4 w-4" />
              Monitoring Sécurité
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="gap-2">
              <ScrollText className="h-4 w-4" />
              Journal d'audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminAnonymizedDashboard />
          </TabsContent>

          <TabsContent value="organisations">
            <AdminOrganisationsPanel organisations={organisations} loading={orgsLoading} />
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            {/* Header Banner */}
            <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Liste des Collaborateurs</h2>
                  <p className="text-muted-foreground">
                    {users.length} collaborateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''} sur la plateforme
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total collaborateurs</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                    <Crown className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{superAdminCount}</p>
                    <p className="text-sm text-muted-foreground">Super Admins</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <ShieldCheck className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{adminCount}</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <User className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userCount}</p>
                    <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Gestion des collaborateurs</CardTitle>
                      <CardDescription>
                        {isSuperAdmin 
                          ? 'Modifiez les rôles et supprimez les collaborateurs'
                          : 'Modifiez les rôles des collaborateurs'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom ou email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="pl-9"
                        maxLength={100}
                      />
                    </div>
                    {isAdmin && (
                      <CreateUserDialog
                        onUserCreated={refreshUsers}
                        onLog={logActivity}
                        isSuperAdmin={isSuperAdmin}
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      {userSearchQuery ? 'Aucun collaborateur trouvé pour cette recherche' : 'Aucun collaborateur inscrit'}
                    </p>
                    {userSearchQuery && (
                      <Button 
                        variant="link" 
                        onClick={() => setUserSearchQuery('')}
                        className="mt-2"
                      >
                        Effacer la recherche
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Fonction</TableHead>
                          <TableHead>Inscrit le</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Modifier le rôle</TableHead>
                          {isSuperAdmin && (
                            <TableHead className="text-right">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => {
                          const isCurrentUser = u.user_id === user.id;
                          const canEdit = canEditRole(u.role) && !isCurrentUser;
                          
                          return (
                            <TableRow key={u.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {u.first_name && u.last_name
                                      ? `${u.first_name} ${u.last_name}`
                                      : 'Nom non renseigné'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {u.email || `${u.user_id.slice(0, 8)}...`}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {u.job_title || (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(u.created_at).toLocaleDateString('fr-FR')}
                              </TableCell>
                              <TableCell>
                                {getRoleBadge(u.role)}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={u.role}
                                  onValueChange={(value: AppRole) =>
                                    handleRoleChange(u.user_id, value, u.role)
                                  }
                                  disabled={!canEdit}
                                >
                                  <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableRoles().map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {role === 'super_admin' && 'Super Admin'}
                                        {role === 'admin' && 'Administrateur'}
                                        {role === 'user' && 'Utilisateur'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              {isSuperAdmin && (
                                <TableCell className="text-right">
                                  {!isCurrentUser && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          disabled={deletingUserId === u.user_id}
                                        >
                                          {deletingUserId === u.user_id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Supprimer cet utilisateur ?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Cette action est irréversible. L'utilisateur{' '}
                                            <strong>
                                              {u.first_name && u.last_name
                                                ? `${u.first_name} ${u.last_name}`
                                                : u.user_id.slice(0, 8)}
                                            </strong>{' '}
                                            ainsi que toutes ses organisations et données associées
                                            seront définitivement supprimés.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(u.user_id, u.email)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">À propos des rôles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <Badge variant="destructive" className="shrink-0 gap-1">
                    <Crown className="h-3 w-3" />
                    Super Admin
                  </Badge>
                  <p>
                    Accès complet à toutes les fonctionnalités. Peut supprimer des utilisateurs,
                    promouvoir des administrateurs et gérer tous les rôles. Accès aux statistiques anonymisées uniquement.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="default" className="shrink-0 gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                  <p>
                    Gestion des utilisateurs standards (pas les super admins). Accès aux statistiques anonymisées 
                    uniquement - aucun accès aux données personnelles des utilisateurs (conformité RGPD).
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <User className="h-3 w-3" />
                    Utilisateur
                  </Badge>
                  <p>
                    Accès limité à ses propres organisations et audits. Ne peut pas
                    accéder à l'administration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <AdminActivityLog 
              logs={logs} 
              loading={logsLoading} 
              onRefresh={refreshLogs} 
            />
          </TabsContent>

          <TabsContent value="logging">
            <LoggingPolicyDocumentation />
          </TabsContent>

          <TabsContent value="security">
            <AdminSecurityMonitoring />
          </TabsContent>

          <TabsContent value="audit-logs">
            <AuditLogsViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
