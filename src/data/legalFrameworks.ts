
// ========================================
// Configuration des cadres juridiques
// ========================================

export interface LegalReference {
  name: string;
  shortName: string;
  articles?: string[];
  url?: string;
}

export interface AuthorityInfo {
  name: string;
  shortName: string;
  website?: string;
  notificationUrl?: string;
}

export interface LegalFrameworkConfig {
  framework: LegalFramework;
  name: string;
  fullName: string;
  description: string;
  authority: AuthorityInfo;
  mainLaw: LegalReference;
  keyPrinciples: string[];
  dataSubjectRights: string[];
  dpoRequirements: {
    mandatory: boolean;
    conditions: string;
    declaration: string;
  };
  breachNotification: {
    deadline: string;
    authority: string;
    notifyDataSubjects: boolean;
  };
  sanctions: {
    maxFine: string;
    criminalPenalties: boolean;
  };
}

// ========================================
// RGPD - Union Européenne
// ========================================
export const RGPD_EU_CONFIG: LegalFrameworkConfig = {
  framework: 'rgpd_eu',
  name: 'RGPD',
  fullName: 'Règlement Général sur la Protection des Données (UE 2016/679)',
  description: 'Règlement européen applicable depuis le 25 mai 2018',
  authority: {
    name: 'Commission Nationale de l\'Informatique et des Libertés',
    shortName: 'CNIL',
    website: 'https://www.cnil.fr',
    notificationUrl: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles'
  },
  mainLaw: {
    name: 'Règlement (UE) 2016/679 du Parlement européen et du Conseil',
    shortName: 'RGPD',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj'
  },
  keyPrinciples: [
    'Licéité, loyauté et transparence',
    'Limitation des finalités',
    'Minimisation des données',
    'Exactitude',
    'Limitation de la conservation',
    'Intégrité et confidentialité',
    'Responsabilité (accountability)'
  ],
  dataSubjectRights: [
    'Droit d\'accès (Art. 15)',
    'Droit de rectification (Art. 16)',
    'Droit à l\'effacement / Droit à l\'oubli (Art. 17)',
    'Droit à la limitation du traitement (Art. 18)',
    'Droit à la portabilité (Art. 20)',
    'Droit d\'opposition (Art. 21)',
    'Droit de ne pas faire l\'objet d\'une décision automatisée (Art. 22)'
  ],
  dpoRequirements: {
    mandatory: true,
    conditions: 'Obligatoire pour les autorités publiques et les organismes traitant des données sensibles à grande échelle',
    declaration: 'Déclaration obligatoire auprès de la CNIL'
  },
  breachNotification: {
    deadline: '72 heures',
    authority: 'CNIL',
    notifyDataSubjects: true
  },
  sanctions: {
    maxFine: '20 millions d\'euros ou 4% du CA mondial annuel',
    criminalPenalties: false
  }
};

// ========================================
// Fonctions d'accès à la configuration
// ========================================
export function getLegalFrameworkConfig(): LegalFrameworkConfig {
  return RGPD_EU_CONFIG;
}

export function getAuthorityName(): string {
  return RGPD_EU_CONFIG.authority.shortName;
}

export function getNotificationDeadline(): string {
  return RGPD_EU_CONFIG.breachNotification.deadline;
}

export function getRegisterName(): string {
  return 'ROPA (Registre des activités de traitement)';
}

export function getDPOTitle(): string {
  return 'DPO (Délégué à la Protection des Données)';
}

