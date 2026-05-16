import { supabase } from '@/integrations/supabase/client';
import { Organisation } from '@/types/rgpd';
import { format } from 'date-fns';

export interface OrganisationBackup {
  version: string;
  exportDate: string;
  organisation: any;
  audits: any[];
  auditModules: any[];
  auditItems: any[];
  auditActions: any[];
  auditHistory: any[];
  processingRecords: any[];
  dataBreaches: any[];
  rightsRequests: any[];
  subprocessors: any[];
  notifications: any[];
  emailNotificationSettings: any;
}

export async function exportOrganisationBackup(organisationId: string): Promise<OrganisationBackup> {
  // Fetch organisation
  const { data: organisation, error: orgError } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', organisationId)
    .single();

  if (orgError) throw new Error(`Erreur lors de la récupération de l'organisation: ${orgError.message}`);

  // Fetch all audits for this organisation
  const { data: audits, error: auditsError } = await supabase
    .from('audits')
    .select('*')
    .eq('organisation_id', organisationId);

  if (auditsError) throw new Error(`Erreur lors de la récupération des audits: ${auditsError.message}`);

  // Fetch audit modules for all audits
  const auditIds = audits?.map(a => a.id) || [];
  let auditModules: any[] = [];
  if (auditIds.length > 0) {
    const { data, error } = await supabase
      .from('audit_modules')
      .select('*')
      .in('audit_id', auditIds);
    if (error) throw new Error(`Erreur lors de la récupération des modules: ${error.message}`);
    auditModules = data || [];
  }

  // Fetch audit items for all modules
  const moduleIds = auditModules.map(m => m.id);
  let auditItems: any[] = [];
  if (moduleIds.length > 0) {
    const { data, error } = await supabase
      .from('audit_items')
      .select('*')
      .in('module_id', moduleIds);
    if (error) throw new Error(`Erreur lors de la récupération des items: ${error.message}`);
    auditItems = data || [];
  }

  // Fetch audit actions for all items
  const itemIds = auditItems.map(i => i.id);
  let auditActions: any[] = [];
  if (itemIds.length > 0) {
    const { data, error } = await supabase
      .from('audit_actions')
      .select('*')
      .in('item_id', itemIds);
    if (error) throw new Error(`Erreur lors de la récupération des actions: ${error.message}`);
    auditActions = data || [];
  }

  // Fetch audit history
  let auditHistory: any[] = [];
  if (auditIds.length > 0) {
    const { data, error } = await supabase
      .from('audit_history')
      .select('*')
      .in('audit_id', auditIds);
    if (error) throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    auditHistory = data || [];
  }

  // Fetch processing records
  const { data: processingRecords, error: prError } = await supabase
    .from('processing_records')
    .select('*')
    .eq('organisation_id', organisationId);
  if (prError) throw new Error(`Erreur lors de la récupération des traitements: ${prError.message}`);

  // Fetch data breaches
  const { data: dataBreaches, error: dbError } = await supabase
    .from('data_breaches')
    .select('*')
    .eq('organisation_id', organisationId);
  if (dbError) throw new Error(`Erreur lors de la récupération des violations: ${dbError.message}`);

  // Fetch rights requests
  const { data: rightsRequests, error: rrError } = await supabase
    .from('rights_requests')
    .select('*')
    .eq('organisation_id', organisationId);
  if (rrError) throw new Error(`Erreur lors de la récupération des demandes: ${rrError.message}`);

  // Fetch subprocessors
  const { data: subprocessors, error: spError } = await supabase
    .from('subprocessors')
    .select('*')
    .eq('organisation_id', organisationId);
  if (spError) throw new Error(`Erreur lors de la récupération des sous-traitants: ${spError.message}`);

  // Fetch notifications
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .eq('organisation_id', organisationId);
  if (notifError) throw new Error(`Erreur lors de la récupération des notifications: ${notifError.message}`);

  // Fetch email notification settings
  const { data: emailSettings, error: emailError } = await supabase
    .from('email_notification_settings')
    .select('*')
    .eq('organisation_id', organisationId)
    .maybeSingle();
  if (emailError) throw new Error(`Erreur lors de la récupération des paramètres email: ${emailError.message}`);

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    organisation,
    audits: audits || [],
    auditModules,
    auditItems,
    auditActions,
    auditHistory,
    processingRecords: processingRecords || [],
    dataBreaches: dataBreaches || [],
    rightsRequests: rightsRequests || [],
    subprocessors: subprocessors || [],
    notifications: notifications || [],
    emailNotificationSettings: emailSettings,
  };
}

export function downloadBackupAsJSON(backup: OrganisationBackup, organisationName: string): void {
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const sanitizedName = organisationName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
  link.download = `sauvegarde_${sanitizedName}_${dateStr}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface GlobalBackup {
  version: string;
  exportDate: string;
  totalOrganisations: number;
  organisations: OrganisationBackup[];
}

export type ProgressCallback = (current: number, total: number, orgName?: string) => void;

export async function exportGlobalBackup(
  organisationIds: string[], 
  onProgress?: ProgressCallback
): Promise<GlobalBackup> {
  const backups: OrganisationBackup[] = [];
  const total = organisationIds.length;
  
  for (let i = 0; i < organisationIds.length; i++) {
    const orgId = organisationIds[i];
    try {
      const backup = await exportOrganisationBackup(orgId);
      backups.push(backup);
      onProgress?.(i + 1, total, backup.organisation?.name);
    } catch (error) {
      console.error(`Erreur lors de l'export de l'organisation ${orgId}:`, error);
      onProgress?.(i + 1, total);
    }
  }

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalOrganisations: backups.length,
    organisations: backups,
  };
}

export function downloadGlobalBackupAsJSON(backup: GlobalBackup): void {
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
  link.download = `sauvegarde_globale_${backup.totalOrganisations}_organisations_${dateStr}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getBackupStats(backup: OrganisationBackup): {
  totalRecords: number;
  details: { label: string; count: number }[];
} {
  const details = [
    { label: 'Audits', count: backup.audits.length },
    { label: 'Modules d\'audit', count: backup.auditModules.length },
    { label: 'Éléments d\'audit', count: backup.auditItems.length },
    { label: 'Actions correctives', count: backup.auditActions.length },
    { label: 'Historique d\'audit', count: backup.auditHistory.length },
    { label: 'Traitements', count: backup.processingRecords.length },
    { label: 'Violations de données', count: backup.dataBreaches.length },
    { label: 'Demandes de droits', count: backup.rightsRequests.length },
    { label: 'Sous-traitants', count: backup.subprocessors.length },
    { label: 'Notifications', count: backup.notifications.length },
  ];

  const totalRecords = details.reduce((sum, d) => sum + d.count, 0);

  return { totalRecords, details };
}

export function validateBackupFile(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Le fichier n\'est pas un JSON valide' };
  }

  if (!data.version) {
    return { valid: false, error: 'Version de sauvegarde manquante' };
  }

  if (!data.organisation) {
    return { valid: false, error: 'Données d\'organisation manquantes' };
  }

  const requiredArrays = [
    'audits', 'auditModules', 'auditItems', 'auditActions',
    'processingRecords', 'dataBreaches', 'rightsRequests', 'subprocessors'
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      return { valid: false, error: `Données "${key}" invalides ou manquantes` };
    }
  }

  return { valid: true };
}

export interface RestoreResult {
  success: boolean;
  imported: {
    audits: number;
    auditModules: number;
    auditItems: number;
    auditActions: number;
    auditHistory: number;
    processingRecords: number;
    dataBreaches: number;
    rightsRequests: number;
    subprocessors: number;
    notifications: number;
    emailSettings: boolean;
  };
  errors: string[];
}

export async function restoreOrganisationBackup(
  backup: OrganisationBackup,
  targetOrganisationId: string
): Promise<RestoreResult> {
  const result: RestoreResult = {
    success: true,
    imported: {
      audits: 0,
      auditModules: 0,
      auditItems: 0,
      auditActions: 0,
      auditHistory: 0,
      processingRecords: 0,
      dataBreaches: 0,
      rightsRequests: 0,
      subprocessors: 0,
      notifications: 0,
      emailSettings: false,
    },
    errors: [],
  };

  // Map old IDs to new IDs
  const auditIdMap = new Map<string, string>();
  const moduleIdMap = new Map<string, string>();
  const itemIdMap = new Map<string, string>();

  try {
    // 1. Import audits
    for (const audit of backup.audits) {
      const { data, error } = await supabase
        .from('audits')
        .insert({
          organisation_id: targetOrganisationId,
          status: audit.status || 'en_cours',
          conformity_score: audit.conformity_score || 0,
          total_actions: audit.total_actions || 0,
          completed_actions: audit.completed_actions || 0,
          high_risk_count: audit.high_risk_count || 0,
        })
        .select('id')
        .single();

      if (error) {
        result.errors.push(`Erreur audit: ${error.message}`);
      } else if (data) {
        auditIdMap.set(audit.id, data.id);
        result.imported.audits++;
      }
    }

    // 2. Import audit modules
    for (const module of backup.auditModules) {
      const newAuditId = auditIdMap.get(module.audit_id);
      if (!newAuditId) continue;

      const { data, error } = await supabase
        .from('audit_modules')
        .insert({
          audit_id: newAuditId,
          module_key: module.module_key,
          name: module.name,
          description: module.description,
          status: module.status || 'non_conforme',
        })
        .select('id')
        .single();

      if (error) {
        result.errors.push(`Erreur module: ${error.message}`);
      } else if (data) {
        moduleIdMap.set(module.id, data.id);
        result.imported.auditModules++;
      }
    }

    // 3. Import audit items
    for (const item of backup.auditItems) {
      const newModuleId = moduleIdMap.get(item.module_id);
      if (!newModuleId) continue;

      const { data, error } = await supabase
        .from('audit_items')
        .insert({
          module_id: newModuleId,
          title: item.title,
          description: item.description,
          status: item.status || 'non_conforme',
          risk_level: item.risk_level || 'moyen',
          risk_justification: item.risk_justification,
          dpo_comments: item.dpo_comments,
          ai_generated: item.ai_generated || false,
        })
        .select('id')
        .single();

      if (error) {
        result.errors.push(`Erreur item: ${error.message}`);
      } else if (data) {
        itemIdMap.set(item.id, data.id);
        result.imported.auditItems++;
      }
    }

    // 4. Import audit actions
    for (const action of backup.auditActions) {
      const newItemId = itemIdMap.get(action.item_id);
      if (!newItemId) continue;

      const { error } = await supabase
        .from('audit_actions')
        .insert({
          item_id: newItemId,
          description: action.description,
          priority: action.priority || 2,
          completed: action.completed || false,
          completed_at: action.completed_at,
        });

      if (error) {
        result.errors.push(`Erreur action: ${error.message}`);
      } else {
        result.imported.auditActions++;
      }
    }

    // 5. Import audit history
    for (const history of backup.auditHistory || []) {
      const newAuditId = auditIdMap.get(history.audit_id);
      if (!newAuditId) continue;

      const { error } = await supabase
        .from('audit_history')
        .insert({
          audit_id: newAuditId,
          conformity_score: history.conformity_score,
          total_actions: history.total_actions,
          completed_actions: history.completed_actions,
          high_risk_count: history.high_risk_count,
          notes: history.notes,
          snapshot_date: history.snapshot_date,
        });

      if (error) {
        result.errors.push(`Erreur historique: ${error.message}`);
      } else {
        result.imported.auditHistory++;
      }
    }

    // 6. Import processing records
    for (const record of backup.processingRecords) {
      const { error } = await supabase
        .from('processing_records')
        .insert({
          organisation_id: targetOrganisationId,
          name: record.name,
          purposes: record.purposes,
          legal_basis: record.legal_basis,
          data_categories: record.data_categories,
          data_subjects: record.data_subjects,
          recipients: record.recipients,
          retention_period: record.retention_period,
          security_measures: record.security_measures,
          transfers_outside_eu: record.transfers_outside_eu || false,
          transfer_safeguards: record.transfer_safeguards,
          dpo_validation: record.dpo_validation || false,
          dpo_validation_date: record.dpo_validation_date,
        });

      if (error) {
        result.errors.push(`Erreur traitement: ${error.message}`);
      } else {
        result.imported.processingRecords++;
      }
    }

    // 7. Import data breaches
    for (const breach of backup.dataBreaches) {
      const { error } = await supabase
        .from('data_breaches')
        .insert({
          organisation_id: targetOrganisationId,
          nature: breach.nature,
          discovery_date: breach.discovery_date,
          breach_date: breach.breach_date,
          notification_deadline: breach.notification_deadline,
          categories_affected: breach.categories_affected,
          estimated_count: breach.estimated_count,
          consequences: breach.consequences,
          measures_taken: breach.measures_taken,
          cnil_notified: breach.cnil_notified || false,
          cnil_notification_date: breach.cnil_notification_date,
          persons_informed: breach.persons_informed || false,
          status: breach.status || 'open',
          notes: breach.notes,
        });

      if (error) {
        result.errors.push(`Erreur violation: ${error.message}`);
      } else {
        result.imported.dataBreaches++;
      }
    }

    // 8. Import rights requests
    for (const request of backup.rightsRequests) {
      const { error } = await supabase
        .from('rights_requests')
        .insert({
          organisation_id: targetOrganisationId,
          requester_name: request.requester_name,
          requester_email: request.requester_email,
          right_type: request.right_type,
          request_date: request.request_date,
          deadline: request.deadline,
          status: request.status || 'pending',
          identity_verified: request.identity_verified || false,
          response_date: request.response_date,
          response_content: request.response_content,
          notes: request.notes,
        });

      if (error) {
        result.errors.push(`Erreur demande: ${error.message}`);
      } else {
        result.imported.rightsRequests++;
      }
    }

    // 9. Import subprocessors
    for (const sub of backup.subprocessors) {
      const { error } = await supabase
        .from('subprocessors')
        .insert({
          organisation_id: targetOrganisationId,
          name: sub.name,
          activity: sub.activity,
          location: sub.location,
          eu_based: sub.eu_based ?? true,
          transfer_mechanism: sub.transfer_mechanism,
          data_processed: sub.data_processed,
          contract_signed: sub.contract_signed || false,
          contract_date: sub.contract_date,
          review_date: sub.review_date,
          hds_certified: sub.hds_certified || false,
          status: sub.status || 'active',
        });

      if (error) {
        result.errors.push(`Erreur sous-traitant: ${error.message}`);
      } else {
        result.imported.subprocessors++;
      }
    }

    // 10. Import notifications (optional - skip old ones)
    for (const notif of backup.notifications || []) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          organisation_id: targetOrganisationId,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          severity: notif.severity || 'info',
          read: notif.read || false,
          dismissed: notif.dismissed || false,
          due_date: notif.due_date,
          reference_type: notif.reference_type,
          reference_id: notif.reference_id,
        });

      if (error) {
        result.errors.push(`Erreur notification: ${error.message}`);
      } else {
        result.imported.notifications++;
      }
    }

    // 11. Import email notification settings
    if (backup.emailNotificationSettings) {
      const settings = backup.emailNotificationSettings;
      const { error } = await supabase
        .from('email_notification_settings')
        .upsert({
          organisation_id: targetOrganisationId,
          enabled: settings.enabled ?? true,
          email_recipients: settings.email_recipients || [],
          notify_breaches: settings.notify_breaches ?? true,
          notify_rights_requests: settings.notify_rights_requests ?? true,
          notify_subprocessors: settings.notify_subprocessors ?? true,
          breach_reminder_hours: settings.breach_reminder_hours || 48,
          rights_reminder_days: settings.rights_reminder_days || 7,
          subprocessor_reminder_days: settings.subprocessor_reminder_days || 30,
        });

      if (error) {
        result.errors.push(`Erreur paramètres email: ${error.message}`);
      } else {
        result.imported.emailSettings = true;
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}
