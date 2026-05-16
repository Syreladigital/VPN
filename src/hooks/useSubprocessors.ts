import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subprocessor } from '@/types/documentation';
import { useToast } from '@/hooks/use-toast';

export function useSubprocessors(organisationId: string | undefined) {
  const [subprocessors, setSubprocessors] = useState<Subprocessor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubprocessors = async () => {
    if (!organisationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('subprocessors')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les sous-traitants',
        variant: 'destructive',
      });
    } else {
      setSubprocessors(data.map(mapDbToSubprocessor));
    }
    setLoading(false);
  };

  const createSubprocessor = async (sub: Omit<Subprocessor, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('subprocessors')
      .insert({
        organisation_id: sub.organisation_id,
        name: sub.name,
        activity: sub.activity,
        data_processed: sub.data_processed,
        contract_signed: sub.contract_signed,
        contract_date: sub.contract_date?.toISOString().split('T')[0],
        hds_certified: sub.hds_certified,
        location: sub.location,
        eu_based: sub.eu_based,
        transfer_mechanism: sub.transfer_mechanism,
        review_date: sub.review_date?.toISOString().split('T')[0],
        status: sub.status,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le sous-traitant',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Succès',
      description: 'Sous-traitant ajouté',
    });
    
    await fetchSubprocessors();
    return mapDbToSubprocessor(data);
  };

  const updateSubprocessor = async (id: string, updates: Partial<Subprocessor>) => {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.activity !== undefined) updateData.activity = updates.activity;
    if (updates.data_processed !== undefined) updateData.data_processed = updates.data_processed;
    if (updates.contract_signed !== undefined) updateData.contract_signed = updates.contract_signed;
    if (updates.contract_date) updateData.contract_date = updates.contract_date.toISOString().split('T')[0];
    if (updates.hds_certified !== undefined) updateData.hds_certified = updates.hds_certified;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.eu_based !== undefined) updateData.eu_based = updates.eu_based;
    if (updates.transfer_mechanism !== undefined) updateData.transfer_mechanism = updates.transfer_mechanism;
    if (updates.review_date) updateData.review_date = updates.review_date.toISOString().split('T')[0];
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase
      .from('subprocessors')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le sous-traitant',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Sous-traitant mis à jour',
    });
    
    await fetchSubprocessors();
    return true;
  };

  const deleteSubprocessor = async (id: string) => {
    const { error } = await supabase
      .from('subprocessors')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le sous-traitant',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Sous-traitant supprimé',
    });
    
    await fetchSubprocessors();
    return true;
  };

  useEffect(() => {
    fetchSubprocessors();
  }, [organisationId]);

  return { subprocessors, loading, createSubprocessor, updateSubprocessor, deleteSubprocessor, refetch: fetchSubprocessors };
}

function mapDbToSubprocessor(db: any): Subprocessor {
  return {
    id: db.id,
    organisation_id: db.organisation_id,
    name: db.name,
    activity: db.activity,
    data_processed: db.data_processed || [],
    contract_signed: db.contract_signed,
    contract_date: db.contract_date ? new Date(db.contract_date) : undefined,
    hds_certified: db.hds_certified,
    location: db.location,
    eu_based: db.eu_based,
    transfer_mechanism: db.transfer_mechanism,
    review_date: db.review_date ? new Date(db.review_date) : undefined,
    status: db.status,
    created_at: new Date(db.created_at),
    updated_at: new Date(db.updated_at),
  };
}
