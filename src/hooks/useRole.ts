import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'user' | 'super_admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // When auth state resolves, user may go from null -> defined.
    // Ensure we re-enter a loading state to avoid premature redirects.
    setLoading(true);

    if (!user) {
      setRole(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        const userRole = (data?.role as AppRole) || 'user';
        setRole(userRole);
        setIsSuperAdmin(userRole === 'super_admin');
        setIsAdmin(userRole === 'admin' || userRole === 'super_admin');
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole('user');
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return {
    role,
    isAdmin,
    isSuperAdmin,
    loading,
  };
};
