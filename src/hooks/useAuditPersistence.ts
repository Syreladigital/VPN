import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organisation, AuditItem, ConformityStatus, RiskLevel, Priority } from '@/types/rgpd';
import { getAuditItemsForModule } from '@/data/sectorAuditItems';
import { useToast } from '@/hooks/use-toast';

interface AuditHistoryEntry {
  id: string;
  audit_id: string;
  conformity_score: number;
  total_actions: number;
  completed_actions: number;
  high_risk_count: number;
  snapshot_date: string;
  notes: string | null;
}

interface DbAuditItem {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  status: ConformityStatus;
  risk_level: RiskLevel;
  risk_justification: string | null;
  dpo_comments: string | null;
  ai_generated: boolean;
  audit_actions: {
    id: string;
    description: string;
    priority: number;
    completed: boolean;
  }[];
}

export function useAuditPersistence(organisation: Organisation | null) {
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AuditHistoryEntry[]>([]);
  const { toast } = useToast();

  // Create or get existing audit for organisation
  const initializeAudit = useCallback(async (org: Organisation) => {
    if (!org.id) return null;
    
    setLoading(true);
    try {
      // Check if audit exists for this organisation
      const { data: existingAudit, error: fetchError } = await supabase
        .from('audits')
        .select('*')
        .eq('organisation_id', org.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingAudit) {
        setAuditId(existingAudit.id);
        await loadHistory(existingAudit.id);
        return existingAudit.id;
      }

      // Create new audit
      const { data: newAudit, error: createError } = await supabase
        .from('audits')
        .insert({
          organisation_id: org.id,
          conformity_score: 0,
          total_actions: 0,
          completed_actions: 0,
          high_risk_count: 0,
          status: 'en_cours'
        })
        .select()
        .single();

      if (createError) throw createError;

      setAuditId(newAudit.id);
      return newAudit.id;
    } catch (error) {
      console.error('Error initializing audit:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'initialiser l\'audit',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load audit history
  const loadHistory = useCallback(async (auditIdParam: string) => {
    try {
      const { data, error } = await supabase
        .from('audit_history')
        .select('*')
        .eq('audit_id', auditIdParam)
        .order('snapshot_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, []);

  // Load audit items for a specific module from database
  const loadModuleItems = useCallback(async (
    moduleKey: string, 
    sector: string
  ): Promise<AuditItem[]> => {
    if (!auditId) {
      return getAuditItemsForModule(moduleKey, sector);
    }

    try {
      // Get module
      const { data: module, error: moduleError } = await supabase
        .from('audit_modules')
        .select('id')
        .eq('audit_id', auditId)
        .eq('module_key', moduleKey)
        .maybeSingle();

      if (moduleError) throw moduleError;

      if (!module) {
        // No module saved yet, return static data
        return getAuditItemsForModule(moduleKey, sector);
      }

      // Get items with actions
      const { data: items, error: itemsError } = await supabase
        .from('audit_items')
        .select(`
          id,
          module_id,
          title,
          description,
          status,
          risk_level,
          risk_justification,
          dpo_comments,
          ai_generated,
          audit_actions (
            id,
            description,
            priority,
            completed
          )
        `)
        .eq('module_id', module.id);

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return getAuditItemsForModule(moduleKey, sector);
      }

      // Transform to AuditItem format
      return items.map((item: DbAuditItem) => ({
        id: item.id,
        moduleId: moduleKey,
        title: item.title,
        description: item.description || '',
        status: item.status,
        riskLevel: item.risk_level,
        riskJustification: item.risk_justification || '',
        dpoComments: item.dpo_comments || '',
        aiGenerated: item.ai_generated,
        actions: item.audit_actions.map(action => ({
          id: action.id,
          description: action.description,
          priority: (action.priority >= 1 && action.priority <= 3 ? action.priority : 2) as Priority,
          completed: action.completed
        }))
      }));
    } catch (error) {
      console.error('Error loading module items:', error);
      return getAuditItemsForModule(moduleKey, sector);
    }
  }, [auditId]);

  // Save audit snapshot to history
  const saveSnapshot = useCallback(async (
    conformityScore: number,
    totalActions: number,
    completedActions: number,
    highRiskCount: number,
    notes?: string
  ) => {
    if (!auditId) return;

    setSaving(true);
    try {
      // Update current audit
      const { error: updateError } = await supabase
        .from('audits')
        .update({
          conformity_score: conformityScore,
          total_actions: totalActions,
          completed_actions: completedActions,
          high_risk_count: highRiskCount
        })
        .eq('id', auditId);

      if (updateError) throw updateError;

      // Create history snapshot
      const { error: historyError } = await supabase
        .from('audit_history')
        .insert({
          audit_id: auditId,
          conformity_score: conformityScore,
          total_actions: totalActions,
          completed_actions: completedActions,
          high_risk_count: highRiskCount,
          notes: notes || null
        });

      if (historyError) throw historyError;

      await loadHistory(auditId);

      toast({
        title: 'Sauvegardé',
        description: 'L\'audit a été enregistré avec succès'
      });
    } catch (error) {
      console.error('Error saving snapshot:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'audit',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [auditId, loadHistory, toast]);

  // Save audit item updates
  const saveAuditItem = useCallback(async (
    moduleKey: string,
    moduleName: string,
    item: AuditItem
  ) => {
    if (!auditId) return;

    try {
      // Get or create module
      let { data: module, error: moduleError } = await supabase
        .from('audit_modules')
        .select('id')
        .eq('audit_id', auditId)
        .eq('module_key', moduleKey)
        .maybeSingle();

      if (moduleError) throw moduleError;

      if (!module) {
        const { data: newModule, error: createModuleError } = await supabase
          .from('audit_modules')
          .insert({
            audit_id: auditId,
            module_key: moduleKey,
            name: moduleName,
            status: item.status
          })
          .select()
          .single();

        if (createModuleError) throw createModuleError;
        module = newModule;
      } else {
        // Update module status
        await supabase
          .from('audit_modules')
          .update({ status: item.status })
          .eq('id', module.id);
      }

      // Check if item exists by title OR by id (for items already from DB)
      let existingItemId: string | null = null;
      
      // First try to find by the item id if it looks like a UUID
      if (item.id && item.id.length === 36 && item.id.includes('-')) {
        const { data: itemById } = await supabase
          .from('audit_items')
          .select('id')
          .eq('id', item.id)
          .maybeSingle();
        
        if (itemById) {
          existingItemId = itemById.id;
        }
      }
      
      // If not found by id, try by title
      if (!existingItemId) {
        const { data: itemByTitle, error: itemFetchError } = await supabase
          .from('audit_items')
          .select('id')
          .eq('module_id', module.id)
          .eq('title', item.title)
          .maybeSingle();

        if (itemFetchError) throw itemFetchError;
        if (itemByTitle) {
          existingItemId = itemByTitle.id;
        }
      }

      if (existingItemId) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('audit_items')
          .update({
            description: item.description,
            status: item.status,
            risk_level: item.riskLevel,
            risk_justification: item.riskJustification,
            dpo_comments: item.dpoComments,
            ai_generated: item.aiGenerated
          })
          .eq('id', existingItemId);

        if (updateError) throw updateError;

        // Delete old actions and recreate them
        await supabase
          .from('audit_actions')
          .delete()
          .eq('item_id', existingItemId);

        for (const action of item.actions) {
          await supabase
            .from('audit_actions')
            .insert({
              item_id: existingItemId,
              description: action.description,
              priority: action.priority,
              completed: action.completed,
              completed_at: action.completed ? new Date().toISOString() : null
            });
        }
      } else {
        // Create new item
        const { data: newItem, error: createError } = await supabase
          .from('audit_items')
          .insert({
            module_id: module.id,
            title: item.title,
            description: item.description,
            status: item.status,
            risk_level: item.riskLevel,
            risk_justification: item.riskJustification,
            dpo_comments: item.dpoComments,
            ai_generated: item.aiGenerated
          })
          .select()
          .single();

        if (createError) throw createError;

        // Create actions
        for (const action of item.actions) {
          await supabase
            .from('audit_actions')
            .insert({
              item_id: newItem.id,
              description: action.description,
              priority: action.priority,
              completed: action.completed
            });
        }
      }
    } catch (error) {
      console.error('Error saving audit item:', error);
      throw error;
    }
  }, [auditId]);

  // Initialize audit when organisation changes
  useEffect(() => {
    if (organisation?.id) {
      initializeAudit(organisation);
    }
  }, [organisation?.id, initializeAudit]);

  return {
    auditId,
    loading,
    saving,
    history,
    saveSnapshot,
    saveAuditItem,
    loadHistory,
    loadModuleItems
  };
}
