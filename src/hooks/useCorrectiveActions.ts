import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CorrectiveAction {
  id: string;
  organisation_id: string;
  attempt_id: string | null;
  question_id: string;
  section_id: string;
  title: string;
  description: string | null;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  completed_at: string | null;
  impact_score: number;
  created_at: string;
  updated_at: string;
}

export interface CreateActionInput {
  question_id: string;
  section_id: string;
  title: string;
  description?: string;
  priority?: number;
  due_date?: string;
  impact_score?: number;
  attempt_id?: string;
}

export function useCorrectiveActions(organisationId: string | undefined) {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadActions = useCallback(async () => {
    if (!organisationId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('corrective_actions')
        .select('*')
        .eq('organisation_id', organisationId)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions((data || []) as CorrectiveAction[]);
    } catch (error) {
      console.error('Error loading corrective actions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const createAction = useCallback(async (input: CreateActionInput) => {
    if (!organisationId) return null;

    try {
      const { data, error } = await supabase
        .from('corrective_actions')
        .insert({
          organisation_id: organisationId,
          question_id: input.question_id,
          section_id: input.section_id,
          title: input.title,
          description: input.description || null,
          priority: input.priority || 2,
          due_date: input.due_date || null,
          impact_score: input.impact_score || 0,
          attempt_id: input.attempt_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Action créée',
        description: 'L\'action corrective a été ajoutée au plan d\'amélioration',
      });
      
      await loadActions();
      return data as CorrectiveAction;
    } catch (error) {
      console.error('Error creating action:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'action corrective',
        variant: 'destructive',
      });
      return null;
    }
  }, [organisationId, loadActions, toast]);

  const updateAction = useCallback(async (
    actionId: string, 
    updates: Partial<Pick<CorrectiveAction, 'title' | 'description' | 'priority' | 'status' | 'due_date'>>
  ) => {
    try {
      const finalUpdates = {
        ...updates,
        ...(updates.status === 'completed'
          ? { completed_at: new Date().toISOString() }
          : updates.status
            ? { completed_at: null }
            : {}),
      };

      const { error } = await supabase
        .from('corrective_actions')
        .update(finalUpdates)
        .eq('id', actionId);

      if (error) throw error;
      
      toast({
        title: 'Action mise à jour',
        description: 'Le statut de l\'action a été modifié',
      });
      
      await loadActions();
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'action',
        variant: 'destructive',
      });
    }
  }, [loadActions, toast]);

  const deleteAction = useCallback(async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('corrective_actions')
        .delete()
        .eq('id', actionId);

      if (error) throw error;
      
      toast({
        title: 'Action supprimée',
        description: 'L\'action corrective a été retirée du plan',
      });
      
      await loadActions();
    } catch (error) {
      console.error('Error deleting action:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'action',
        variant: 'destructive',
      });
    }
  }, [loadActions, toast]);

  // Calculate stats
  const stats = {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
    potentialImpact: actions
      .filter(a => a.status !== 'completed')
      .reduce((sum, a) => sum + a.impact_score, 0),
  };

  return {
    actions,
    isLoading,
    stats,
    createAction,
    updateAction,
    deleteAction,
    refresh: loadActions,
  };
}
