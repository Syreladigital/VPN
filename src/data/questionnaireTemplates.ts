import { AuditItem, Sector } from '@/types/rgpd';

export interface QuestionnaireTemplate {
  id: string;
  category: string;
  tags?: string[];
  item: AuditItem;
}

// ========================================
// PHARMACIEN - Modèles de questionnaires
// ========================================
const pharmacienTemplates: Record<string, QuestionnaireTemplate[]> = {
  ropa: [
    {
      id: 'ph-tpl-1',
      category: 'Traitements réglementaires',
      tags: ['DP', 'obligation légale'],
      item: {
        id: `ph-new-${Date.now()}-1`,
        moduleId: 'ropa',
        title: 'Vaccination à l\'officine',
        description: 'Traitement des données lors des vaccinations (COVID, grippe, etc.)',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données de santé - transmission vers SI-VAC et DMP obligatoire',
        actions: [
          { id: 'a1', description: 'Vérifier la transmission vers SI-VAC', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter le consentement patient', priority: 1, completed: false },
          { id: 'a3', description: 'Vérifier l\'alimentation du DMP', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'ph-tpl-2',
      category: 'Traitements réglementaires',
      tags: ['stupéfiants', 'traçabilité'],
      item: {
        id: `ph-new-${Date.now()}-2`,
        moduleId: 'ropa',
        title: 'Registre des stupéfiants',
        description: 'Traçabilité des médicaments classés stupéfiants',
        status: 'conforme',
        riskLevel: 'moyen',
        riskJustification: 'Obligation légale stricte - données de prescription sensibles',
        actions: [
          { id: 'a1', description: 'Vérifier la tenue du registre réglementaire', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter les durées de conservation (10 ans)', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'ph-tpl-3',
      category: 'Services officinaux',
      tags: ['entretiens', 'suivi patient'],
      item: {
        id: `ph-new-${Date.now()}-3`,
        moduleId: 'ropa',
        title: 'Entretiens pharmaceutiques',
        description: 'Entretiens de suivi (asthme, anticoagulants, diabète, etc.)',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données de santé détaillées - suivi thérapeutique',
        actions: [
          { id: 'a1', description: 'Documenter le consentement du patient', priority: 1, completed: false },
          { id: 'a2', description: 'Vérifier le stockage sécurisé des fiches d\'entretien', priority: 1, completed: false },
          { id: 'a3', description: 'Définir les durées de conservation', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'ph-tpl-4',
      category: 'Services officinaux',
      tags: ['MAD', 'matériel médical'],
      item: {
        id: `ph-new-${Date.now()}-4`,
        moduleId: 'ropa',
        title: 'Location de matériel médical (MAD)',
        description: 'Gestion des locations et ventes de dispositifs médicaux',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Données de santé indirectes - suivi du matériel',
        actions: [
          { id: 'a1', description: 'Documenter les données collectées par type de matériel', priority: 2, completed: false },
          { id: 'a2', description: 'Vérifier les contrats avec les prestataires MAD', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'ph-tpl-5',
      category: 'Services officinaux',
      tags: ['PDA', 'EHPAD'],
      item: {
        id: `ph-new-${Date.now()}-5`,
        moduleId: 'ropa',
        title: 'Préparation des doses à administrer (PDA)',
        description: 'Conditionnement des médicaments pour les EHPAD/résidents',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données de santé - responsabilité partagée avec l\'EHPAD',
        actions: [
          { id: 'a1', description: 'Vérifier la convention avec l\'EHPAD', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter les flux de données entre les parties', priority: 1, completed: false },
          { id: 'a3', description: 'S\'assurer de la traçabilité des préparations', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  securite: [
    {
      id: 'ph-sec-tpl-1',
      category: 'Accès et authentification',
      tags: ['CPS', 'authentification'],
      item: {
        id: `ph-sec-new-${Date.now()}-1`,
        moduleId: 'securite',
        title: 'Accès étudiant et stagiaire',
        description: 'Gestion des accès temporaires pour les stagiaires en pharmacie',
        status: 'non_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Accès aux données de santé sans CPS - supervision requise',
        actions: [
          { id: 'a1', description: 'Définir un profil d\'accès restreint pour les stagiaires', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter la supervision obligatoire', priority: 1, completed: false },
          { id: 'a3', description: 'Mettre en place une traçabilité des actions', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  droits: [
    {
      id: 'ph-droits-tpl-1',
      category: 'Droits des patients',
      tags: ['portabilité', 'export'],
      item: {
        id: `ph-droits-new-${Date.now()}-1`,
        moduleId: 'droits',
        title: 'Portabilité des données patient',
        description: 'Droit à la portabilité vers une autre pharmacie',
        status: 'partiellement_conforme',
        riskLevel: 'faible',
        riskJustification: 'Transfert via DP - procédure encadrée',
        actions: [
          { id: 'a1', description: 'Documenter la procédure de transfert', priority: 2, completed: false },
          { id: 'a2', description: 'Informer les patients de leurs droits', priority: 3, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
};

// ========================================
// MÉDECIN - Modèles de questionnaires
// ========================================
const medecinTemplates: Record<string, QuestionnaireTemplate[]> = {
  ropa: [
    {
      id: 'med-tpl-1',
      category: 'Traitements médicaux',
      tags: ['certificats', 'attestations'],
      item: {
        id: `med-new-${Date.now()}-1`,
        moduleId: 'ropa',
        title: 'Certificats et attestations médicales',
        description: 'Rédaction et conservation des certificats médicaux',
        status: 'conforme',
        riskLevel: 'moyen',
        riskJustification: 'Secret médical - durée de conservation à respecter',
        actions: [
          { id: 'a1', description: 'Documenter les types de certificats émis', priority: 2, completed: false },
          { id: 'a2', description: 'Définir les durées de conservation par type', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'med-tpl-2',
      category: 'Traitements médicaux',
      tags: ['imagerie', 'examens'],
      item: {
        id: `med-new-${Date.now()}-2`,
        moduleId: 'ropa',
        title: 'Résultats d\'examens et imagerie',
        description: 'Réception et conservation des résultats d\'examens et images médicales',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données de santé volumineuses - stockage sécurisé obligatoire',
        actions: [
          { id: 'a1', description: 'Vérifier l\'hébergement HDS des images', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter les durées de conservation', priority: 1, completed: false },
          { id: 'a3', description: 'S\'assurer du chiffrement des fichiers', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'med-tpl-3',
      category: 'Recherche et études',
      tags: ['recherche', 'études cliniques'],
      item: {
        id: `med-new-${Date.now()}-3`,
        moduleId: 'ropa',
        title: 'Participation à des études cliniques',
        description: 'Collecte de données dans le cadre d\'études ou recherches',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Méthodologie de référence MR - déclaration CNIL obligatoire',
        actions: [
          { id: 'a1', description: 'Vérifier la conformité MR (MR-001 à MR-006)', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter le consentement spécifique', priority: 1, completed: false },
          { id: 'a3', description: 'S\'assurer de la pseudonymisation', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'med-tpl-4',
      category: 'Exercice médical',
      tags: ['remplacement', 'collaboration'],
      item: {
        id: `med-new-${Date.now()}-4`,
        moduleId: 'ropa',
        title: 'Médecin remplaçant',
        description: 'Accès aux données patient par un médecin remplaçant',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Continuité des soins - accès encadré',
        actions: [
          { id: 'a1', description: 'Documenter le contrat de remplacement', priority: 1, completed: false },
          { id: 'a2', description: 'Définir les accès limités nécessaires', priority: 2, completed: false },
          { id: 'a3', description: 'Tracer les accès du remplaçant', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  securite: [
    {
      id: 'med-sec-tpl-1',
      category: 'Sécurité des données',
      tags: ['sauvegarde', 'PRA'],
      item: {
        id: `med-sec-new-${Date.now()}-1`,
        moduleId: 'securite',
        title: 'Plan de reprise d\'activité (PRA)',
        description: 'Procédures de continuité en cas d\'incident',
        status: 'non_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Disponibilité des données médicales critique',
        actions: [
          { id: 'a1', description: 'Rédiger un plan de reprise d\'activité', priority: 1, completed: false },
          { id: 'a2', description: 'Tester régulièrement les restaurations', priority: 1, completed: false },
          { id: 'a3', description: 'Identifier les contacts d\'urgence (éditeur, IT)', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  droits: [
    {
      id: 'med-droits-tpl-1',
      category: 'Droits des patients',
      tags: ['mineur', 'tutelle'],
      item: {
        id: `med-droits-new-${Date.now()}-1`,
        moduleId: 'droits',
        title: 'Accès au dossier des mineurs',
        description: 'Gestion des demandes d\'accès pour les mineurs et personnes sous tutelle',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Règles spécifiques selon l\'âge et la capacité juridique',
        actions: [
          { id: 'a1', description: 'Documenter les règles d\'accès selon l\'âge', priority: 1, completed: false },
          { id: 'a2', description: 'Vérifier les titres habilitants (tutelle, curatelle)', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
};

// ========================================
// ASSURANCE VIE - Modèles de questionnaires
// ========================================
const assuranceVieTemplates: Record<string, QuestionnaireTemplate[]> = {
  ropa: [
    {
      id: 'av-tpl-1',
      category: 'Gestion des contrats',
      tags: ['arbitrage', 'gestion'],
      item: {
        id: `av-new-${Date.now()}-1`,
        moduleId: 'ropa',
        title: 'Opérations d\'arbitrage',
        description: 'Traitement des demandes de changement de supports d\'investissement',
        status: 'conforme',
        riskLevel: 'moyen',
        riskJustification: 'Données financières - traçabilité obligatoire',
        actions: [
          { id: 'a1', description: 'Documenter la base légale (exécution du contrat)', priority: 2, completed: false },
          { id: 'a2', description: 'Vérifier la journalisation des opérations', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'av-tpl-2',
      category: 'Gestion des sinistres',
      tags: ['décès', 'succession'],
      item: {
        id: `av-new-${Date.now()}-2`,
        moduleId: 'ropa',
        title: 'Règlement des sinistres décès',
        description: 'Traitement des dossiers de décès et versement aux bénéficiaires',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données sensibles (succession, bénéficiaires) - délais légaux',
        actions: [
          { id: 'a1', description: 'Documenter la collecte des pièces justificatives', priority: 1, completed: false },
          { id: 'a2', description: 'Vérifier le respect des délais légaux', priority: 1, completed: false },
          { id: 'a3', description: 'S\'assurer de l\'identification des bénéficiaires', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'av-tpl-3',
      category: 'Prospection commerciale',
      tags: ['marketing', 'consentement'],
      item: {
        id: `av-new-${Date.now()}-3`,
        moduleId: 'ropa',
        title: 'Prospection commerciale',
        description: 'Campagnes marketing et relances commerciales',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Consentement et droit d\'opposition à gérer',
        actions: [
          { id: 'a1', description: 'Vérifier la base légale (consentement ou intérêt légitime)', priority: 1, completed: false },
          { id: 'a2', description: 'Mettre en place un mécanisme d\'opposition facile', priority: 1, completed: false },
          { id: 'a3', description: 'Documenter les sources des données prospects', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  droits: [
    {
      id: 'av-droits-tpl-1',
      category: 'Droits des assurés',
      tags: ['effacement', 'prescription'],
      item: {
        id: `av-droits-new-${Date.now()}-1`,
        moduleId: 'droits',
        title: 'Droit à l\'effacement',
        description: 'Gestion des demandes d\'effacement des données',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Limitations légales (prescription, LCB-FT) à documenter',
        actions: [
          { id: 'a1', description: 'Documenter les motifs légitimes de refus', priority: 1, completed: false },
          { id: 'a2', description: 'Rédiger une réponse type pour les refus', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
};

// ========================================
// ASSURANCE NON-VIE - Modèles
// ========================================
const assuranceNonVieTemplates: Record<string, QuestionnaireTemplate[]> = {
  ropa: [
    {
      id: 'anv-tpl-1',
      category: 'Automobile',
      tags: ['télématique', 'pay as you drive'],
      item: {
        id: `anv-new-${Date.now()}-1`,
        moduleId: 'ropa',
        title: 'Assurance connectée (Pay as you drive)',
        description: 'Collecte de données de conduite via boîtier télématique',
        status: 'non_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Profilage comportemental - consentement et AIPD obligatoires',
        actions: [
          { id: 'a1', description: 'Obtenir le consentement explicite', priority: 1, completed: false },
          { id: 'a2', description: 'Réaliser une AIPD', priority: 1, completed: false },
          { id: 'a3', description: 'Informer sur les critères d\'évaluation', priority: 1, completed: false },
          { id: 'a4', description: 'Permettre le retrait du consentement', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'anv-tpl-2',
      category: 'Habitation',
      tags: ['objets connectés', 'domotique'],
      item: {
        id: `anv-new-${Date.now()}-2`,
        moduleId: 'ropa',
        title: 'Assurance habitation connectée',
        description: 'Données issues des capteurs et objets connectés du domicile',
        status: 'non_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Vie privée au domicile - sensibilité maximale',
        actions: [
          { id: 'a1', description: 'Limiter strictement les données collectées', priority: 1, completed: false },
          { id: 'a2', description: 'Obtenir un consentement éclairé', priority: 1, completed: false },
          { id: 'a3', description: 'Interdire l\'usage à des fins autres que la prévention', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'anv-tpl-3',
      category: 'Sinistres',
      tags: ['photos', 'constat'],
      item: {
        id: `anv-new-${Date.now()}-3`,
        moduleId: 'ropa',
        title: 'Application de déclaration de sinistre',
        description: 'Collecte de photos et données via application mobile',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Photos et géolocalisation - minimisation à vérifier',
        actions: [
          { id: 'a1', description: 'Vérifier la minimisation des données collectées', priority: 1, completed: false },
          { id: 'a2', description: 'Documenter la durée de conservation des photos', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
};

// ========================================
// TRANSPORT LOGISTIQUE - Modèles
// ========================================
const transportTemplates: Record<string, QuestionnaireTemplate[]> = {
  ropa: [
    {
      id: 'tr-tpl-1',
      category: 'Gestion RH',
      tags: ['permis', 'aptitude'],
      item: {
        id: `tr-new-${Date.now()}-1`,
        moduleId: 'ropa',
        title: 'Suivi des aptitudes conducteurs',
        description: 'Gestion des visites médicales et permis de conduire',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données de santé et aptitude au travail',
        actions: [
          { id: 'a1', description: 'Limiter la collecte aux informations d\'aptitude (oui/non)', priority: 1, completed: false },
          { id: 'a2', description: 'Ne pas conserver les détails médicaux', priority: 1, completed: false },
          { id: 'a3', description: 'Définir les durées de conservation', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'tr-tpl-2',
      category: 'Sécurité',
      tags: ['alcootest', 'contrôle'],
      item: {
        id: `tr-new-${Date.now()}-2`,
        moduleId: 'ropa',
        title: 'Contrôles d\'alcoolémie',
        description: 'Éthylotests aléatoires ou systématiques des conducteurs',
        status: 'non_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données de santé - cadre légal strict',
        actions: [
          { id: 'a1', description: 'Vérifier le fondement légal du contrôle', priority: 1, completed: false },
          { id: 'a2', description: 'Mettre à jour le règlement intérieur', priority: 1, completed: false },
          { id: 'a3', description: 'Limiter la conservation aux résultats positifs', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'tr-tpl-3',
      category: 'Clients',
      tags: ['B2C', 'livraison'],
      item: {
        id: `tr-new-${Date.now()}-3`,
        moduleId: 'ropa',
        title: 'Données des destinataires (B2C)',
        description: 'Collecte des données personnelles des destinataires de colis',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Volume important - information obligatoire',
        actions: [
          { id: 'a1', description: 'Informer les destinataires du traitement', priority: 1, completed: false },
          { id: 'a2', description: 'Définir les durées de conservation (3 mois max)', priority: 1, completed: false },
          { id: 'a3', description: 'Vérifier les clauses avec le donneur d\'ordre', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  securite: [
    {
      id: 'tr-sec-tpl-1',
      category: 'Sécurité physique',
      tags: ['badges', 'accès'],
      item: {
        id: `tr-sec-new-${Date.now()}-1`,
        moduleId: 'securite',
        title: 'Contrôle d\'accès par badge',
        description: 'Gestion des accès aux entrepôts et sites logistiques',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Traçabilité des mouvements - information salariés',
        actions: [
          { id: 'a1', description: 'Informer les salariés de la traçabilité', priority: 1, completed: false },
          { id: 'a2', description: 'Limiter la durée de conservation des logs (3 mois)', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
};

// ========================================
// BIEN-ÊTRE - Modèles
// ========================================
const bienEtreTemplates: Record<string, QuestionnaireTemplate[]> = {
  ropa: [
    {
      id: 'be-tpl-1',
      category: 'Séances et consultations',
      tags: ['notes', 'suivi'],
      item: {
        id: `be-new-${Date.now()}-1`,
        moduleId: 'ropa',
        title: 'Notes de séance',
        description: 'Prise de notes pendant les consultations (sophrologie, coaching, etc.)',
        status: 'partiellement_conforme',
        riskLevel: 'eleve',
        riskJustification: 'Données intimes et personnelles - sécurisation requise',
        actions: [
          { id: 'a1', description: 'Obtenir le consentement pour la prise de notes', priority: 1, completed: false },
          { id: 'a2', description: 'Stocker les notes de façon sécurisée', priority: 1, completed: false },
          { id: 'a3', description: 'Définir une durée de conservation courte', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'be-tpl-2',
      category: 'Vente en ligne',
      tags: ['e-commerce', 'produits'],
      item: {
        id: `be-new-${Date.now()}-2`,
        moduleId: 'ropa',
        title: 'Vente de produits en ligne',
        description: 'Boutique en ligne de produits bien-être (compléments, huiles, etc.)',
        status: 'partiellement_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Données clients et financières - e-commerce classique',
        actions: [
          { id: 'a1', description: 'Rédiger les CGV avec mentions RGPD', priority: 1, completed: false },
          { id: 'a2', description: 'Vérifier la conformité de la solution de paiement', priority: 1, completed: false },
          { id: 'a3', description: 'Mettre en place les cookies conformes', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
    {
      id: 'be-tpl-3',
      category: 'Contenu et marketing',
      tags: ['newsletter', 'emailing'],
      item: {
        id: `be-new-${Date.now()}-3`,
        moduleId: 'ropa',
        title: 'Newsletter et blog',
        description: 'Communication régulière avec les abonnés',
        status: 'partiellement_conforme',
        riskLevel: 'faible',
        riskJustification: 'Données limitées - consentement à vérifier',
        actions: [
          { id: 'a1', description: 'Vérifier le consentement des abonnés', priority: 1, completed: false },
          { id: 'a2', description: 'Intégrer un lien de désinscription', priority: 1, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
  cookies: [
    {
      id: 'be-cook-tpl-1',
      category: 'Site web',
      tags: ['analytics', 'tracking'],
      item: {
        id: `be-cook-new-${Date.now()}-1`,
        moduleId: 'cookies',
        title: 'Cookies analytics',
        description: 'Mesure d\'audience et comportement des visiteurs',
        status: 'non_conforme',
        riskLevel: 'moyen',
        riskJustification: 'Consentement obligatoire sauf exemption CNIL',
        actions: [
          { id: 'a1', description: 'Mettre en place une bannière cookies conforme', priority: 1, completed: false },
          { id: 'a2', description: 'Vérifier l\'éligibilité à l\'exemption (Matomo, etc.)', priority: 2, completed: false },
          { id: 'a3', description: 'Documenter tous les cookies déposés', priority: 2, completed: false },
        ],
        dpoComments: '',
        aiGenerated: true,
      }
    },
  ],
};

// ========================================
// Fonction d'export
// ========================================
export function getQuestionnaireTemplates(sector: Sector, moduleId: string): QuestionnaireTemplate[] {
  let templates: Record<string, QuestionnaireTemplate[]>;
  
  switch (sector) {
    case 'sante_reglementee_pharmacien':
      templates = pharmacienTemplates;
      break;
    case 'sante_reglementee_medecin':
      templates = medecinTemplates;
      break;
    case 'sante_non_reglementee_bien_etre':
      templates = bienEtreTemplates;
      break;
    case 'assurance_vie':
      templates = assuranceVieTemplates;
      break;
    case 'assurance_non_vie':
      templates = assuranceNonVieTemplates;
      break;
    case 'transport_logistique':
      templates = transportTemplates;
      break;
    default:
      return [];
  }
  
  return templates[moduleId] || [];
}

export function getAllTemplatesForSector(sector: Sector): QuestionnaireTemplate[] {
  let templates: Record<string, QuestionnaireTemplate[]>;
  
  switch (sector) {
    case 'sante_reglementee_pharmacien':
      templates = pharmacienTemplates;
      break;
    case 'sante_reglementee_medecin':
      templates = medecinTemplates;
      break;
    case 'sante_non_reglementee_bien_etre':
      templates = bienEtreTemplates;
      break;
    case 'assurance_vie':
      templates = assuranceVieTemplates;
      break;
    case 'assurance_non_vie':
      templates = assuranceNonVieTemplates;
      break;
    case 'transport_logistique':
      templates = transportTemplates;
      break;
    default:
      return [];
  }
  
  return Object.values(templates).flat();
}
