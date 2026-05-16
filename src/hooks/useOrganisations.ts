import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organisation, Sector, OrganisationSize, DPORole } from '@/types/rgpd';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbOrganisation = Database['public']['Tables']['organisations']['Row'];
type DbSector = Database['public']['Enums']['sector_type'];
type DbSize = Database['public']['Enums']['organisation_size_type'];
type DbDpoRole = Database['public']['Enums']['dpo_role_type'];

function mapDbToOrganisation(db: DbOrganisation): Organisation {
  return {
    id: db.id,
    name: db.name,
    sector: db.sector as Sector,
    size: db.size as OrganisationSize,
    dpoRole: db.dpo_role as DPORole,
    createdAt: new Date(db.created_at)
  };
}

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrganisations = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrganisations([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setOrganisations((data || []).map(mapDbToOrganisation));
    } catch (error) {
      console.error('Error fetching organisations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les organismes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createOrganisation = useCallback(async (
    org: Omit<Organisation, 'id' | 'createdAt'>
  ): Promise<Organisation | null> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté',
          variant: 'destructive'
        });
        return null;
      }

      // Validate all required fields are present and non-empty
      if (!org.name?.trim() || !org.sector || !org.size || !org.dpoRole) {
        toast({
          title: 'Erreur',
          description: 'Tous les champs obligatoires doivent être remplis correctement',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('organisations')
        .insert({
          name: org.name.trim(),
          sector: org.sector as DbSector,
          size: org.size as DbSize,
          dpo_role: org.dpoRole as DbDpoRole,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newOrg = mapDbToOrganisation(data);
      setOrganisations(prev => [newOrg, ...prev]);

      toast({
        title: 'Organisme créé',
        description: `${org.name} a été ajouté`
      });

      return newOrg;
    } catch (error) {
      console.error('Error creating organisation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'organisme',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const deleteOrganisation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('organisations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrganisations(prev => prev.filter(o => o.id !== id));
      
      toast({
        title: 'Supprimé',
        description: 'L\'organisme a été supprimé'
      });
    } catch (error) {
      console.error('Error deleting organisation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'organisme',
        variant: 'destructive'
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  return {
    organisations,
    loading,
    createOrganisation,
    deleteOrganisation,
    refresh: fetchOrganisations
  };
}
