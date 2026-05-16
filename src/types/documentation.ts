export interface ProcessingRecord {
  id: string;
  organisation_id: string;
  name: string;
  purposes: string;
  legal_basis: string;
  data_categories: string[];
  data_subjects: string[];
  recipients: string[];
  transfers_outside_eu: boolean;
  transfer_safeguards?: string;
  retention_period?: string;
  security_measures?: string;
  dpo_validation: boolean;
  dpo_validation_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DataBreach {
  id: string;
  organisation_id: string;
  breach_date: Date;
  discovery_date: Date;
  notification_deadline?: Date;
  cnil_notified: boolean;
  cnil_notification_date?: Date;
  nature: string;
  categories_affected: string[];
  estimated_count?: number;
  consequences?: string;
  measures_taken?: string;
  persons_informed: boolean;
  status: 'open' | 'closed' | 'notified';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RightsRequest {
  id: string;
  organisation_id: string;
  request_date: Date;
  deadline?: Date;
  requester_name: string;
  requester_email?: string;
  identity_verified: boolean;
  right_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'opposition' | 'limitation';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  response_date?: Date;
  response_content?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subprocessor {
  id: string;
  organisation_id: string;
  name: string;
  activity: string;
  data_processed: string[];
  contract_signed: boolean;
  contract_date?: Date;
  hds_certified: boolean;
  location?: string;
  eu_based: boolean;
  transfer_mechanism?: string;
  review_date?: Date;
  status: 'active' | 'inactive' | 'pending';
  created_at: Date;
  updated_at: Date;
}

export const LEGAL_BASIS_OPTIONS = [
  { value: 'consent', label: 'Consentement' },
  { value: 'contract', label: 'Exécution d\'un contrat' },
  { value: 'legal_obligation', label: 'Obligation légale' },
  { value: 'vital_interest', label: 'Intérêts vitaux' },
  { value: 'public_interest', label: 'Mission d\'intérêt public' },
  { value: 'legitimate_interest', label: 'Intérêts légitimes' },
];

export const RIGHT_TYPE_LABELS: Record<RightsRequest['right_type'], string> = {
  access: 'Droit d\'accès',
  rectification: 'Droit de rectification',
  erasure: 'Droit à l\'effacement',
  portability: 'Droit à la portabilité',
  opposition: 'Droit d\'opposition',
  limitation: 'Droit à la limitation',
};

export const BREACH_STATUS_LABELS: Record<DataBreach['status'], string> = {
  open: 'En cours',
  closed: 'Clôturé',
  notified: 'Notifié CNIL',
};

export const REQUEST_STATUS_LABELS: Record<RightsRequest['status'], string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Traité',
  rejected: 'Rejeté',
};

export const SUBPROCESSOR_STATUS_LABELS: Record<Subprocessor['status'], string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
};
