import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingRecord } from '@/types/documentation';
import { useToast } from '@/hooks/use-toast';

export function useProcessingRecords(organisationId: string | undefined) {
  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    if (!organisationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('processing_records')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les fiches de traitement',
        variant: 'destructive',
      });
    } else {
      setRecords(data.map(mapDbToRecord));
    }
    setLoading(false);
  };

  const createRecord = async (record: Omit<ProcessingRecord, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('processing_records')
      .insert({
        organisation_id: record.organisation_id,
        name: record.name,
        purposes: record.purposes,
        legal_basis: record.legal_basis,
        data_categories: record.data_categories,
        data_subjects: record.data_subjects,
        recipients: record.recipients,
        transfers_outside_eu: record.transfers_outside_eu,
        transfer_safeguards: record.transfer_safeguards,
        retention_period: record.retention_period,
        security_measures: record.security_measures,
        dpo_validation: record.dpo_validation,
        dpo_validation_date: record.dpo_validation_date?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la fiche de traitement',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Succès',
      description: 'Fiche de traitement créée',
    });
    
    await fetchRecords();
    return mapDbToRecord(data);
  };

  const updateRecord = async (id: string, updates: Partial<ProcessingRecord>) => {
    const { error } = await supabase
      .from('processing_records')
      .update({
        name: updates.name,
        purposes: updates.purposes,
        legal_basis: updates.legal_basis,
        data_categories: updates.data_categories,
        data_subjects: updates.data_subjects,
        recipients: updates.recipients,
        transfers_outside_eu: updates.transfers_outside_eu,
        transfer_safeguards: updates.transfer_safeguards,
        retention_period: updates.retention_period,
        security_measures: updates.security_measures,
        dpo_validation: updates.dpo_validation,
        dpo_validation_date: updates.dpo_validation_date?.toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la fiche',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Fiche mise à jour',
    });
    
    await fetchRecords();
    return true;
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('processing_records')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la fiche',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Succès',
      description: 'Fiche supprimée',
    });
    
    await fetchRecords();
    return true;
  };

  useEffect(() => {
    fetchRecords();
  }, [organisationId]);

  return { records, loading, createRecord, updateRecord, deleteRecord, refetch: fetchRecords };
}

function mapDbToRecord(db: any): ProcessingRecord {
  return {
    id: db.id,
    organisation_id: db.organisation_id,
    name: db.name,
    purposes: db.purposes,
    legal_basis: db.legal_basis,
    data_categories: db.data_categories || [],
    data_subjects: db.data_subjects || [],
    recipients: db.recipients || [],
    transfers_outside_eu: db.transfers_outside_eu,
    transfer_safeguards: db.transfer_safeguards,
    retention_period: db.retention_period,
    security_measures: db.security_measures,
    dpo_validation: db.dpo_validation,
    dpo_validation_date: db.dpo_validation_date ? new Date(db.dpo_validation_date) : undefined,
    created_at: new Date(db.created_at),
    updated_at: new Date(db.updated_at),
  };
}
