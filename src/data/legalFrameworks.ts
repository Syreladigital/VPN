import { LegalFramework } from '@/types/rgpd';

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
// Projet de Loi Tunisie 2025/95
// ========================================
export const LOI_TUNISIE_2025_CONFIG: LegalFrameworkConfig = {
  framework: 'loi_tunisie_2025',
  name: 'Projet de loi 2025/95',
  fullName: 'Projet de loi organique n° 2025/95 relative à la protection des données personnelles',
  description: 'Projet de loi tunisien modernisé aligné sur les standards internationaux',
  authority: {
    name: 'Instance Nationale de Protection des Données Personnelles',
    shortName: 'INPDP',
    website: 'http://www.inpdp.nat.tn',
    notificationUrl: 'http://www.inpdp.nat.tn'
  },
  mainLaw: {
    name: 'Projet de loi organique n° 2025/95 relative à la protection des données personnelles',
    shortName: 'Projet de loi 2025/95',
    articles: [
      'Article 5: Traitement licite, loyal et transparent',
      'Article 6: Finalités déterminées, explicites et légitimes',
      'Article 7: Données exactes et mises à jour',
      'Article 10: Conservation limitée aux finalités',
      'Article 15: Consentement libre, spécifique et éclairé',
      'Article 21: Droit d\'accès',
      'Article 29: Droit d\'opposition',
      'Article 32: Droit à la portabilité',
      'Article 34: Droit à l\'oubli',
      'Article 40: Interdiction des données sensibles sauf exceptions',
      'Article 41: Autorisation préalable INPDP pour données sensibles',
      'Article 70: Autorisation préalable pour données de santé',
      'Article 90: Information sur l\'utilisation d\'IA',
      'Article 91: Droit de ne pas faire l\'objet d\'une décision automatisée'
    ]
  },
  keyPrinciples: [
    'Licéité, loyauté et transparence (Art. 5)',
    'Finalités déterminées et légitimes (Art. 6)',
    'Exactitude et mise à jour (Art. 7)',
    'Conservation limitée (Art. 10)',
    'Respect de la dignité humaine (Art. 3)',
    'Interdiction de l\'atteinte aux personnes (Art. 3)'
  ],
  dataSubjectRights: [
    'Droit à l\'information (Art. 12-13)',
    'Droit au consentement (Art. 15-17)',
    'Droit d\'accès - délai 15 jours (Art. 21-22)',
    'Droit d\'opposition (Art. 29)',
    'Droit à la portabilité (Art. 32)',
    'Droit à l\'oubli (Art. 34)',
    'Droit face aux décisions automatisées et IA (Art. 90-91)'
  ],
  dpoRequirements: {
    mandatory: true,
    conditions: 'Obligatoire dans les institutions publiques et privées',
    declaration: 'Désignation obligatoire d\'un Délégué à la protection des données (DPO)'
  },
  breachNotification: {
    deadline: 'Sans délai',
    authority: 'INPDP (Autorité de protection des données personnelles)',
    notifyDataSubjects: true
  },
  sanctions: {
    maxFine: '100 000 dinars tunisiens (amendes administratives), jusqu\'à 200 000 dinars pour violations graves (Art. 125, 128)',
    criminalPenalties: true
  }
};

// ========================================
// Fonction d'accès à la configuration
// ========================================
export function getLegalFrameworkConfig(framework: LegalFramework): LegalFrameworkConfig {
  switch (framework) {
    case 'loi_tunisie_2025':
      return LOI_TUNISIE_2025_CONFIG;
    case 'rgpd_eu':
    default:
      return RGPD_EU_CONFIG;
  }
}

// ========================================
// Labels et textes adaptés au cadre juridique
// ========================================
export function getAuthorityName(framework: LegalFramework): string {
  return getLegalFrameworkConfig(framework).authority.shortName;
}

export function getNotificationDeadline(framework: LegalFramework): string {
  return getLegalFrameworkConfig(framework).breachNotification.deadline;
}

export function getRegisterName(framework: LegalFramework): string {
  return framework === 'rgpd_eu' ? 'ROPA (Registre des activités de traitement)' : 'Registre des traitements de données';
}

export function getDPOTitle(framework: LegalFramework): string {
  return framework === 'rgpd_eu' ? 'DPO (Délégué à la Protection des Données)' : 'Délégué à la protection des données personnelles';
}

// ========================================
// Textes de référence pour la documentation
// ========================================
export const TUNISIAN_LAW_FULL_TEXT = `
Projet de loi organique n° 2025/95 relative à la protection des données personnelles

Titre premier : Dispositions générales

Article 1
Cette loi garantit le droit de toute personne à la protection de ses données personnelles et fixe les conditions et procédures à respecter pour le traitement de ces données.

Article 2
Les dispositions de cette loi s'appliquent au traitement automatisé et non automatisé des données personnelles effectué sur le territoire tunisien, sous réserve des exigences de l'ordre public, de la défense nationale et des intérêts monétaires de l'État conformément à la législation en vigueur. Elles ne s'appliquent pas aux autorités publiques ou structures publiques chargées de la prévention, de la recherche, de l'enquête et de la répression des infractions pénales, ni au traitement des données personnelles à des fins strictement personnelles ou familiales.

Article 3
Le traitement des données personnelles doit respecter les principes de transparence, de loyauté, de dignité humaine et les dispositions de cette loi, sous le contrôle de l'Autorité de protection des données personnelles. Il est interdit d'utiliser ces données pour porter atteinte aux personnes, les diffamer ou à des fins criminelles.

Article 4 : Définitions
- Données personnelles : Toute information, quel que soit son support, permettant d'identifier directement ou indirectement une personne physique (nom, numéro d'identification, situation familiale, données de localisation, identifiant en ligne, etc.).
- Traitement des données personnelles : Toute opération (collecte, enregistrement, conservation, utilisation, transmission, effacement, etc.) effectuée sur des données personnelles.
- Données sensibles : Données révélant l'origine raciale ou ethnique, les opinions politiques, les convictions religieuses ou philosophiques, l'appartenance syndicale, la santé, la vie sexuelle, les données biométriques ou génétiques.
- Personne concernée : Toute personne physique dont les données font l'objet d'un traitement.
- Responsable du traitement : Personne physique ou morale déterminant les finalités et les moyens du traitement.
- Sous-traitant : Personne physique ou morale traitant les données pour le compte du responsable du traitement.
- Consentement : Toute manifestation de volonté libre, spécifique, éclairée et unambiguë par laquelle la personne concernée accepte le traitement de ses données.
- Droit à l'oubli : Droit de la personne concernée d'obtenir l'effacement de ses données.
- Profilage : Toute forme de traitement automatisé visant à évaluer des aspects personnels (comportements, préférences, etc.).
- Système d'intelligence artificielle : Tout système utilisant des techniques automatisées pour générer des prédictions, recommandations ou décisions influençant l'environnement.

Titre II : Principes généraux du traitement des données personnelles

Article 5
Les données personnelles doivent être traitées de manière licite, loyale et transparente, dans le respect de la vie privée et des libertés fondamentales.

Article 6
Les données doivent être collectées pour des finalités déterminées, explicites et légitimes.

Article 7
Les données doivent être exactes, mises à jour et conservées pour une durée n'excédant pas celle nécessaire aux finalités du traitement.

Article 8
Le traitement ultérieur des données à des fins autres que celles pour lesquelles elles ont été collectées n'est autorisé qu'avec le consentement de la personne concernée, sauf exceptions (intérêt vital, recherche scientifique, etc.).

Article 9
Il est interdit de conditionner la fourniture d'un service à l'acceptation du traitement des données personnelles pour des finalités non liées.

Article 10
Les données doivent être conservées pour une durée limitée aux finalités du traitement, sauf pour des archives d'intérêt public, des recherches scientifiques ou historiques, ou des statistiques.

Titre III : Droits de la personne concernée

Section 1 : Droit à l'information
Article 12 : La personne concernée doit être informée, avant la collecte, des données traitées, des finalités, de la base juridique, de la durée de conservation, de ses droits, et des destinataires des données.
Article 13 : Si les données ne sont pas collectées directement auprès de la personne concernée, celle-ci doit être informée de la source des données.

Section 2 : Droit au consentement
Article 15 : Le traitement des données personnelles nécessite le consentement libre, spécifique et éclairé de la personne concernée, sauf exceptions (obligation légale, intérêt public, etc.).
Article 16 : Le consentement n'est pas requis pour l'exercice de la liberté d'expression, le respect d'une obligation légale ou contractuelle, ou la protection d'un intérêt public (santé, sécurité).
Article 17 : La personne concernée peut retirer son consentement à tout moment.

Section 3 : Droit d'accès
Article 21 : La personne concernée a le droit d'accéder à ses données et d'en obtenir une copie.
Article 22 : La demande d'accès doit être traitée dans un délai de 15 jours.

Section 4 : Droit d'opposition
Article 29 : La personne concernée peut s'opposer au traitement de ses données pour des motifs légitimes.

Section 5 : Droit à la portabilité
Article 32 : La personne concernée a le droit de recevoir ses données dans un format structuré et de les transmettre à un autre responsable du traitement.

Section 6 : Droit à l'oubli
Article 34 : La personne concernée peut demander l'effacement de ses données si elles ne sont plus nécessaires, si le consentement est retiré, ou si le traitement est illicite.

Titre IV : Régimes spécifiques de traitement des données personnelles

Section 1 : Traitement des données sensibles
Article 40 : Le traitement des données sensibles (origine ethnique, santé, convictions religieuses, etc.) est interdit, sauf exceptions (consentement explicite, obligation légale, intérêt public).
Article 41 : Une autorisation préalable de l'Autorité de protection des données est requise pour le traitement des données sensibles.

Section 2 : Traitement des données de santé
Article 70 : Le traitement des données de santé nécessite une autorisation préalable de l'Autorité.
Article 73 : Seuls les professionnels de santé ou les personnes soumises au secret professionnel peuvent traiter ces données.

Section 3 : Traitement des données par intelligence artificielle
Article 90 : La personne concernée doit être informée de l'utilisation de systèmes d'IA, des finalités, des données utilisées et des impacts potentiels.
Article 91 : La personne concernée a le droit de ne pas faire l'objet d'une décision basée uniquement sur un traitement automatisé.

Titre V : Autorité de protection des données personnelles

Article 94
Une autorité publique indépendante, l'Autorité de protection des données personnelles, est créée pour :
- Contrôler le respect de la loi.
- Délivrer des autorisations et des labels de conformité.
- Sanctionner les manquements.
- Sensibiliser et former sur la protection des données.

Article 95
L'Autorité est composée de :
- Un président et des membres nommés pour 5 ans.
- Des représentants des ministères de la Santé, de l'Enseignement supérieur, et des experts en droit numérique et en technologies de l'information.

Titre VI : Sanctions

Article 125
Les infractions aux dispositions de cette loi sont passibles d'amendes allant de 2 000 à 100 000 dinars tunisiens, selon la gravité.

Article 128
Les peines d'emprisonnement (jusqu'à 5 ans) et d'amendes (jusqu'à 200 000 dinars) sont prévues pour les violations graves (traitement illicite de données sensibles, transfert illégal à l'étranger, etc.).

Titre VII : Dispositions transitoires et finales

Article 131
Cette loi entre en vigueur 6 mois après sa publication au Journal officiel de la République tunisienne et abroge la loi n° 63 de 2004 relative à la protection des données personnelles.
`;
