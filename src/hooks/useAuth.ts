import { useState, useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { api } from '@/lib/api';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authClient.getSession().then(({ data: session }) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user as AuthUser);
        fetchProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get<{
        first_name: string | null;
        last_name: string | null;
        job_title: string | null;
        id: string;
      }>('/api/auth/me');
      setProfile({
        id: data.id,
        user_id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        job_title: data.job_title,
      });
    } catch {
      setProfile(null);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
    });
    if (!error && data?.user) {
      setUser(data.user as AuthUser);
      await fetchProfile();
    }
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (!error && data?.user) {
      setUser(data.user as AuthUser);
      await fetchProfile();
    }
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authClient.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'user_id'>>) => {
    if (!user) return { error: new Error('Non authentifié') };
    try {
      const data = await api.patch<Profile>('/api/profile', updates);
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  return {
    user,
    session: user ? { user } : null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};
