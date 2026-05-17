import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
    setLoading(true);

    if (!user) {
      setRole(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    api.get<{ role: AppRole }>('/api/auth/me')
      .then(({ role: userRole }) => {
        setRole(userRole ?? 'user');
        setIsSuperAdmin(userRole === 'super_admin');
        setIsAdmin(userRole === 'admin' || userRole === 'super_admin');
      })
      .catch(() => {
        setRole('user');
        setIsAdmin(false);
        setIsSuperAdmin(false);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return { role, isAdmin, isSuperAdmin, loading };
};
