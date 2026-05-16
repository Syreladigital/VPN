export type Sector =
  | 'sante_reglementee_pharmacien'
  | 'sante_reglementee_medecin'
  | 'sante_non_reglementee_bien_etre'
  | 'assurance_vie'
  | 'assurance_non_vie'
  | 'transport_logistique';

export type OrganisationSize = 'independant' | 'tpe' | 'pme' | 'groupe';

export type DPORole = 'interne' | 'externe' | 'consultant';

export type Country = 'france' | 'eu_other';

export type LegalFramework = 'rgpd_eu';

export type ConformityStatus = 'conforme' | 'partiellement_conforme' | 'non_conforme';

// Extended status for UI display (includes "not evaluated" state)
export type DisplayConformityStatus = ConformityStatus | 'non_evalue';

export type RiskLevel = 'faible' | 'moyen' | 'eleve';

export type Priority = 1 | 2 | 3;

// Type de transport pour le secteur Transport & Logistique
export type TransportType = 'general' | 'sous_douane' | 'multimodal';

export const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  general: 'Transport Général',
  sous_douane: 'Magasin & Aire sous-douane',
  multimodal: 'Transport Multimodal',
};

export interface Organisation {
  id: string;
  name: string;
  sector: Sector;
  size: OrganisationSize;
  dpoRole: DPORole;
  createdAt: Date;
}

export interface AuditModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: DisplayConformityStatus;
  lastUpdated?: Date;
}

export interface AuditItem {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  status: ConformityStatus;
  riskLevel: RiskLevel;
  riskJustification: string;
  actions: AuditAction[];
  dpoComments: string;
  aiGenerated: boolean;
}

export interface AuditAction {
  id: string;
  description: string;
  priority: Priority;
  completed: boolean;
}

export const SECTOR_LABELS: Record<Sector, string> = {
  sante_reglementee_pharmacien: 'Santé réglementée – Pharmacien',
  sante_reglementee_medecin: 'Santé réglementée – Médecin',
  sante_non_reglementee_bien_etre: 'Santé non réglementée – Bien-être',
  assurance_vie: 'Assurance Vie',
  assurance_non_vie: 'Assurance Non-Vie',
  transport_logistique: 'Transport & Logistique',
};

export const SIZE_LABELS: Record<OrganisationSize, string> = {
  independant: 'Indépendant',
  tpe: 'TPE',
  pme: 'PME',
  groupe: 'Groupe',
};

export const DPO_ROLE_LABELS: Record<DPORole, string> = {
  interne: 'DPO interne',
  externe: 'DPO externe',
  consultant: 'Consultant RGPD',
};

export const STATUS_LABELS: Record<ConformityStatus, string> = {
  conforme: 'Conforme',
  partiellement_conforme: 'Partiellement conforme',
  non_conforme: 'Non conforme',
};

export const DISPLAY_STATUS_LABELS: Record<DisplayConformityStatus, string> = {
  conforme: 'Conforme',
  partiellement_conforme: 'Partiellement conforme',
  non_conforme: 'Non conforme',
  non_evalue: 'Non évalué',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  faible: 'Faible',
  moyen: 'Moyen',
  eleve: 'Élevé',
};

