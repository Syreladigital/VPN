import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AppRole } from './useRole';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  role: AppRole;
  created_at: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch profiles, roles, and emails in parallel
      const [profilesResult, rolesResult, emailsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('*'),
        supabase.rpc('get_users_with_emails'),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;
      // Emails might fail for non-admins, that's ok
      const emails = emailsResult.data || [];

      // Combine profiles with roles and emails
      const combinedUsers: AdminUser[] = (profilesResult.data || []).map((profile) => {
        const userRole = rolesResult.data?.find((r) => r.user_id === profile.user_id);
        const userEmail = emails.find((e: { user_id: string; email: string }) => e.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: userEmail?.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          job_title: profile.job_title,
          role: (userRole?.role as AppRole) || 'user',
          created_at: profile.created_at,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserRole = useCallback(async (
    userId: string, 
    newRole: AppRole, 
    oldRole: AppRole,
    onLog?: (actionType: string, targetUserId: string, details: Record<string, string>) => void
  ) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, role: newRole } : u
        )
      );

      // Log the activity
      if (onLog) {
        onLog('role_change', userId, { old_role: oldRole, new_role: newRole });
      }

      const roleLabels: Record<AppRole, string> = {
        super_admin: 'Super Admin',
        admin: 'Administrateur',
        user: 'Utilisateur',
        client: 'Client',
      };

      toast({
        title: 'Rôle mis à jour',
        description: `L'utilisateur a maintenant le rôle ${roleLabels[newRole]}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le rôle',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteUser = useCallback(async (
    userId: string,
    userEmail?: string,
    onLog?: (actionType: string, targetUserId: string, details: Record<string, string>) => void
  ) => {
    try {
      const { error } = await supabase.rpc('delete_user_by_super_admin', {
        _user_id: userId,
      });

      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.user_id !== userId));

      // Log the activity
      if (onLog) {
        onLog('user_delete', userId, { deleted_email: userEmail || 'N/A' });
      }

      toast({
        title: 'Utilisateur supprimé',
        description: "L'utilisateur et toutes ses données ont été supprimés",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    updateUserRole,
    deleteUser,
    refresh: fetchUsers,
  };
};
