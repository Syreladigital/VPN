import { useMemo } from 'react';
import { ProcessingRecord, DataBreach, RightsRequest, Subprocessor } from '@/types/documentation';
import { isBefore } from 'date-fns';

export interface CategoryScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
  missingElements: string[];
  icon: string;
}

export interface RecordCompleteness {
  id: string;
  name: string;
  percentage: number;
  missingFields: string[];
}

export interface DocumentaryCompletenessResult {
  globalScore: number;
  globalPercentage: number;
  categories: CategoryScore[];
  recordsCompleteness: {
    processingRecords: RecordCompleteness[];
    subprocessors: RecordCompleteness[];
    rightsRequests: RecordCompleteness[];
    dataBreaches: RecordCompleteness[];
  };
  priorityActions: string[];
  conformityLevel: 'excellent' | 'good' | 'partial' | 'insufficient';
}

// Calcul de la complétude d'un traitement
function calculateProcessingRecordCompleteness(record: ProcessingRecord): RecordCompleteness {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 10;

  // Champs obligatoires (poids plus élevé)
  if (record.name?.trim()) filledFields += 1; else missingFields.push('Nom du traitement');
  if (record.purposes?.trim()) filledFields += 1; else missingFields.push('Finalités');
  if (record.legal_basis?.trim()) filledFields += 1; else missingFields.push('Base légale');
  if (record.data_categories?.length > 0) filledFields += 1; else missingFields.push('Catégories de données');
  if (record.data_subjects?.length > 0) filledFields += 1; else missingFields.push('Personnes concernées');
  
  // Champs recommandés
  if (record.recipients?.length > 0) filledFields += 1; else missingFields.push('Destinataires');
  if (record.retention_period?.trim()) filledFields += 1; else missingFields.push('Durée de conservation');
  if (record.security_measures?.trim()) filledFields += 1; else missingFields.push('Mesures de sécurité');
  
  // Validation DPO
  if (record.dpo_validation) filledFields += 1; else missingFields.push('Validation DPO');
  
  // Transferts hors UE documentés si applicable
  if (!record.transfers_outside_eu || (record.transfers_outside_eu && record.transfer_safeguards?.trim())) {
    filledFields += 1;
  } else {
    missingFields.push('Garanties transfert hors UE');
  }

  return {
    id: record.id,
    name: record.name,
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

// Calcul de la complétude d'un sous-traitant
function calculateSubprocessorCompleteness(sub: Subprocessor): RecordCompleteness {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 8;

  if (sub.name?.trim()) filledFields += 1; else missingFields.push('Nom');
  if (sub.activity?.trim()) filledFields += 1; else missingFields.push('Activité');
  if (sub.data_processed?.length > 0) filledFields += 1; else missingFields.push('Données traitées');
  if (sub.contract_signed) filledFields += 1; else missingFields.push('Contrat signé');
  if (sub.location?.trim()) filledFields += 1; else missingFields.push('Localisation');
  if (sub.review_date) filledFields += 1; else missingFields.push('Date de révision');
  
  // Si hors UE, mécanisme de transfert requis
  if (sub.eu_based || (!sub.eu_based && sub.transfer_mechanism?.trim())) {
    filledFields += 1;
  } else {
    missingFields.push('Mécanisme de transfert');
  }
  
  // Certification HDS (bonus pour la santé)
  if (sub.hds_certified) filledFields += 1; else missingFields.push('Certification HDS');

  return {
    id: sub.id,
    name: sub.name,
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

// Calcul de la complétude d'une demande de droits
function calculateRightsRequestCompleteness(request: RightsRequest): RecordCompleteness {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 6;

  if (request.requester_name?.trim()) filledFields += 1; else missingFields.push('Nom du demandeur');
  if (request.requester_email?.trim()) filledFields += 1; else missingFields.push('Email');
  if (request.right_type) filledFields += 1; else missingFields.push('Type de droit');
  if (request.identity_verified) filledFields += 1; else missingFields.push('Identité vérifiée');
  
  // Réponse documentée si traité
  if (request.status === 'completed' || request.status === 'rejected') {
    if (request.response_content?.trim()) filledFields += 1; else missingFields.push('Contenu de réponse');
    if (request.response_date) filledFields += 1; else missingFields.push('Date de réponse');
  } else {
    filledFields += 2; // Non applicable
  }

  return {
    id: request.id,
    name: `${request.requester_name} - ${request.right_type}`,
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

// Calcul de la complétude d'une violation
function calculateBreachCompleteness(breach: DataBreach): RecordCompleteness {
  const missingFields: string[] = [];
  let filledFields = 0;
  const totalFields = 8;

  if (breach.nature?.trim()) filledFields += 1; else missingFields.push('Nature de la violation');
  if (breach.breach_date) filledFields += 1; else missingFields.push('Date de violation');
  if (breach.discovery_date) filledFields += 1; else missingFields.push('Date de découverte');
  if (breach.categories_affected?.length > 0) filledFields += 1; else missingFields.push('Catégories affectées');
  if (breach.consequences?.trim()) filledFields += 1; else missingFields.push('Conséquences');
  if (breach.measures_taken?.trim()) filledFields += 1; else missingFields.push('Mesures prises');
  
  // Notification CNIL si requise
  if (breach.cnil_notified || breach.status === 'closed') {
    filledFields += 1;
  } else if (breach.notification_deadline && isBefore(new Date(), new Date(breach.notification_deadline))) {
    filledFields += 0.5; // En attente
  } else {
    missingFields.push('Notification CNIL');
  }
  
  // Information des personnes
  if (breach.persons_informed !== undefined) filledFields += 1; else missingFields.push('Personnes informées');

  return {
    id: breach.id,
    name: breach.nature,
    percentage: Math.round((filledFields / totalFields) * 100),
    missingFields,
  };
}

interface UseDocumentaryCompletenessScoreParams {
  processingRecords: ProcessingRecord[];
  subprocessors: Subprocessor[];
  rightsRequests: RightsRequest[];
  dataBreaches: DataBreach[];
  auditScore?: number;
  hasAudit?: boolean;
}

export function useDocumentaryCompletenessScore({
  processingRecords,
  subprocessors,
  rightsRequests,
  dataBreaches,
  auditScore = 0,
  hasAudit = false,
}: UseDocumentaryCompletenessScoreParams): DocumentaryCompletenessResult {
  return useMemo(() => {
    const categories: CategoryScore[] = [];
    const priorityActions: string[] = [];

    // 1. Registre des traitements (30%)
    const recordsCompleteness = processingRecords.map(calculateProcessingRecordCompleteness);
    const avgRecordsCompleteness = recordsCompleteness.length > 0
      ? recordsCompleteness.reduce((sum, r) => sum + r.percentage, 0) / recordsCompleteness.length
      : 0;
    
    const recordsMissing: string[] = [];
    if (processingRecords.length === 0) recordsMissing.push('Aucun traitement documenté');
    const unvalidatedCount = processingRecords.filter(r => !r.dpo_validation).length;
    if (unvalidatedCount > 0) recordsMissing.push(`${unvalidatedCount} traitement(s) non validé(s) par le DPO`);
    const incompleteRecords = recordsCompleteness.filter(r => r.percentage < 80);
    if (incompleteRecords.length > 0) recordsMissing.push(`${incompleteRecords.length} fiche(s) incomplète(s)`);

    categories.push({
      id: 'processing_records',
      name: 'Registre des traitements',
      score: Math.round(avgRecordsCompleteness * 0.3),
      maxScore: 30,
      percentage: Math.round(avgRecordsCompleteness),
      weight: 30,
      missingElements: recordsMissing,
      icon: 'FileText',
    });

    if (processingRecords.length === 0) {
      priorityActions.push('Créer au moins une fiche de traitement');
    } else if (unvalidatedCount > 0) {
      priorityActions.push('Faire valider les traitements par le DPO');
    }

    // 2. Sous-traitants (25%)
    const subCompleteness = subprocessors.map(calculateSubprocessorCompleteness);
    const avgSubCompleteness = subCompleteness.length > 0
      ? subCompleteness.reduce((sum, s) => sum + s.percentage, 0) / subCompleteness.length
      : 0;
    
    const subMissing: string[] = [];
    if (subprocessors.length === 0) subMissing.push('Aucun sous-traitant documenté');
    const noContractCount = subprocessors.filter(s => !s.contract_signed).length;
    if (noContractCount > 0) subMissing.push(`${noContractCount} sous-traitant(s) sans contrat`);
    const noReviewCount = subprocessors.filter(s => !s.review_date).length;
    if (noReviewCount > 0) subMissing.push(`${noReviewCount} sans date de révision`);

    categories.push({
      id: 'subprocessors',
      name: 'Sous-traitants',
      score: Math.round(avgSubCompleteness * 0.25),
      maxScore: 25,
      percentage: Math.round(avgSubCompleteness),
      weight: 25,
      missingElements: subMissing,
      icon: 'Factory',
    });

    if (noContractCount > 0) {
      priorityActions.push('Signer les contrats avec tous les sous-traitants');
    }

    // 3. Demandes de droits (20%)
    const requestsCompleteness = rightsRequests.map(calculateRightsRequestCompleteness);
    const avgRequestsCompleteness = requestsCompleteness.length > 0
      ? requestsCompleteness.reduce((sum, r) => sum + r.percentage, 0) / requestsCompleteness.length
      : 100; // Si pas de demandes, c'est OK
    
    const requestsMissing: string[] = [];
    const overdueRequests = rightsRequests.filter(r => {
      if (r.status === 'completed' || r.status === 'rejected') return false;
      if (!r.deadline) return false;
      return isBefore(new Date(r.deadline), new Date());
    });
    if (overdueRequests.length > 0) requestsMissing.push(`${overdueRequests.length} demande(s) en retard`);
    const unverifiedCount = rightsRequests.filter(r => !r.identity_verified && r.status !== 'rejected').length;
    if (unverifiedCount > 0) requestsMissing.push(`${unverifiedCount} identité(s) non vérifiée(s)`);

    categories.push({
      id: 'rights_requests',
      name: 'Demandes de droits',
      score: Math.round(avgRequestsCompleteness * 0.2),
      maxScore: 20,
      percentage: Math.round(avgRequestsCompleteness),
      weight: 20,
      missingElements: requestsMissing,
      icon: 'UserCheck',
    });

    if (overdueRequests.length > 0) {
      priorityActions.push('Traiter les demandes de droits en retard');
    }

    // 4. Violations de données (15%)
    const breachesCompleteness = dataBreaches.map(calculateBreachCompleteness);
    const avgBreachesCompleteness = breachesCompleteness.length > 0
      ? breachesCompleteness.reduce((sum, b) => sum + b.percentage, 0) / breachesCompleteness.length
      : 100; // Si pas de violations, c'est OK
    
    const breachesMissing: string[] = [];
    const openBreaches = dataBreaches.filter(b => b.status === 'open');
    if (openBreaches.length > 0) breachesMissing.push(`${openBreaches.length} violation(s) non clôturée(s)`);
    const notNotifiedBreaches = dataBreaches.filter(b => 
      b.status !== 'closed' && !b.cnil_notified && b.notification_deadline && 
      isBefore(new Date(b.notification_deadline), new Date())
    );
    if (notNotifiedBreaches.length > 0) breachesMissing.push(`${notNotifiedBreaches.length} notification(s) CNIL en retard`);

    categories.push({
      id: 'data_breaches',
      name: 'Violations de données',
      score: Math.round(avgBreachesCompleteness * 0.15),
      maxScore: 15,
      percentage: Math.round(avgBreachesCompleteness),
      weight: 15,
      missingElements: breachesMissing,
      icon: 'AlertTriangle',
    });

    if (notNotifiedBreaches.length > 0) {
      priorityActions.push('Notifier les violations à la CNIL');
    }

    // 5. Audit RGPD (10%)
    const auditMissing: string[] = [];
    let auditCategoryScore = 0;
    
    if (hasAudit) {
      auditCategoryScore = Math.min(auditScore, 100);
      if (auditScore < 50) auditMissing.push('Score d\'audit inférieur à 50%');
    } else {
      auditMissing.push('Aucun audit réalisé');
    }

    categories.push({
      id: 'audit',
      name: 'Audit RGPD',
      score: Math.round(auditCategoryScore * 0.1),
      maxScore: 10,
      percentage: Math.round(auditCategoryScore),
      weight: 10,
      missingElements: auditMissing,
      icon: 'Shield',
    });

    if (!hasAudit) {
      priorityActions.push('Réaliser un audit de conformité RGPD');
    }

    // Calcul du score global
    const globalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
    const globalPercentage = Math.round(globalScore);

    // Niveau de conformité
    let conformityLevel: DocumentaryCompletenessResult['conformityLevel'];
    if (globalPercentage >= 80) conformityLevel = 'excellent';
    else if (globalPercentage >= 60) conformityLevel = 'good';
    else if (globalPercentage >= 40) conformityLevel = 'partial';
    else conformityLevel = 'insufficient';

    return {
      globalScore,
      globalPercentage,
      categories,
      recordsCompleteness: {
        processingRecords: recordsCompleteness,
        subprocessors: subCompleteness,
        rightsRequests: requestsCompleteness,
        dataBreaches: breachesCompleteness,
      },
      priorityActions: priorityActions.slice(0, 5),
      conformityLevel,
    };
  }, [processingRecords, subprocessors, rightsRequests, dataBreaches, auditScore, hasAudit]);
}
