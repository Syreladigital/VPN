import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Organisation, Sector, OrganisationSize, DPORole } from '@/types/rgpd';

export interface AdminOrganisation extends Organisation {
  user_id: string;
  ownerEmail: string;
  ownerName: string;
}

export const useAdminOrganisations = () => {
  const [organisations, setOrganisations] = useState<AdminOrganisation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrganisations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all organisations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organisations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Get unique user IDs
      const userIds = [...new Set(orgsData?.map(o => o.user_id).filter(Boolean) as string[])];

      // Fetch profiles and emails for these users
      const [profilesResult, emailsResult] = await Promise.all([
        supabase.from('profiles').select('*').in('user_id', userIds),
        supabase.rpc('get_users_with_emails'),
      ]);

      const profiles = profilesResult.data || [];
      const emails = emailsResult.data || [];

      // Combine data
      const combinedOrgs: AdminOrganisation[] = (orgsData || []).map(org => {
        const profile = profiles.find(p => p.user_id === org.user_id);
        const email = emails.find((e: { user_id: string; email: string }) => e.user_id === org.user_id);
        
        return {
          id: org.id,
          name: org.name,
          sector: org.sector as Sector,
          size: org.size as OrganisationSize,
          dpoRole: org.dpo_role as DPORole,
          createdAt: new Date(org.created_at),
          user_id: org.user_id || '',
          ownerEmail: email?.email || '',
          ownerName: profile 
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Non renseigné'
            : 'Non renseigné',
        };
      });

      setOrganisations(combinedOrgs);
    } catch (error) {
      console.error('Error fetching organisations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les organisations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  return {
    organisations,
    loading,
    refresh: fetchOrganisations,
  };
};
