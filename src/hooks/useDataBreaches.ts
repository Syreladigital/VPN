import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataBreach } from '@/types/documentation';
import { useToast } from '@/hooks/use-toast';

export function useDataBreaches(organisationId: string | undefined) {
  const [breaches, setBreaches] = useState<DataBreach[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBreaches = async () => {
    if (!organisationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('data_breaches')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les violations',
        variant: 'destructive',
      });
    } else {
      setBreaches(data.map(mapDbToBreach));
    }
    setLoading(false);
  };

  const createBreach = async (breach: Omit<DataBreach, 'id' | 'created_at' | 'updated_at'>) => {
    // Calculer automatiquement le délai de notification (72h)
    const notificationDeadline = new Date(breach.discovery_date);
    notificationDeadline.setHours(notificationDeadline.getHours() + 72);

    const { data, error } = await supabase
      .from('data_breaches')
      .insert({
        organisation_id: breach.organisation_id,
        breach_date: breach.breach_date.toISOString(),
        discovery_date: breach.discovery_date.toISOString(),
        notification_deadline: notificationDeadline.toISOString(),
        cnil_notified: breach.cnil_notified,
        cnil_notification_date: breach.cnil_notification_date?.toISOString(),
        nature: breach.nature,
        categories_affected: breach.categories_affected,
        estimated_count: breach.estimated_count,
        consequences: breach.consequences,
        measures_taken: breach.measures_taken,
        persons_informed: breach.persons_informed,
        status: breach.status,
        notes: breach.notes,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la déclaration de violation',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Succès',
      description: 'Déclaration de violation créée',
    });
    
    await fetchBreaches();
    return mapDbToBreach(data);
  };

  const updateBreach = async (id: string, updates: Partial<DataBreach>) => {
    const updateData: any = {};
    
    if (updates.breach_date) updateData.breach_date = updates.breach_date.toISOString();
    if (updates.discovery_date) updateData.discovery_date = updates.discovery_date.toISOString();
    if (updates.cnil_notification_date) updateData.cnil_notification_date = updates.cnil_notification_date.toISOString();
    if (updates.nature !== undefined) updateData.nature = updates.nature;
    if (updates.categories_affected !== undefined) updateData.categories_affected = updates.categories_affected;
    if (updates.estimated_count !== undefined) updateData.estimated_count = updates.estimated_count;
    if (updates.consequences !== undefined) updateData.consequences = updates.consequences;
    if (updates.measures_taken !== undefined) updateData.measures_taken = updates.measures_taken;
    if (updates.persons_informed !== undefined) updateData.persons_informed = updates.persons_informed;
    if (updates.cnil_notified !== undefined) updateData.cnil_notified = updates.cnil_notified;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase
      .from('data_breaches')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la violation',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Violation mise à jour',
    });
    
    await fetchBreaches();
    return true;
  };

  const deleteBreach = async (id: string) => {
    const { error } = await supabase
      .from('data_breaches')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la violation',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Violation supprimée',
    });
    
    await fetchBreaches();
    return true;
  };

  useEffect(() => {
    fetchBreaches();
  }, [organisationId]);

  return { breaches, loading, createBreach, updateBreach, deleteBreach, refetch: fetchBreaches };
}

function mapDbToBreach(db: any): DataBreach {
  return {
    id: db.id,
    organisation_id: db.organisation_id,
    breach_date: new Date(db.breach_date),
    discovery_date: new Date(db.discovery_date),
    notification_deadline: db.notification_deadline ? new Date(db.notification_deadline) : undefined,
    cnil_notified: db.cnil_notified,
    cnil_notification_date: db.cnil_notification_date ? new Date(db.cnil_notification_date) : undefined,
    nature: db.nature,
    categories_affected: db.categories_affected || [],
    estimated_count: db.estimated_count,
    consequences: db.consequences,
    measures_taken: db.measures_taken,
    persons_informed: db.persons_informed,
    status: db.status,
    notes: db.notes,
    created_at: new Date(db.created_at),
    updated_at: new Date(db.updated_at),
  };
}
