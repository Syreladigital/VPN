import { ConditionalQuestion, QuestionnaireSection } from '@/types/conditionalQuestionnaire';

// ========================================
// Questions critiques communes - Projet de loi tunisienne 2025/95
// Adaptées à la législation tunisienne
// ========================================

export const tunisianCommonCriticalQuestions: ConditionalQuestion[] = [
  {
    id: 'dpo-designation',
    question: 'Avez-vous désigné un Délégué à la Protection des Données Personnelles ?',
    description: 'Obligation prévue par le Projet de loi 2025/95 pour les institutions publiques et privées',
    type: 'boolean',
    category: 'Gouvernance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Désignation du Délégué à la Protection des Données',
      description: 'La désignation d\'un délégué est obligatoire selon le Projet de loi 2025/95 pour les institutions publiques et privées traitant des données personnelles.',
      actions: [
        'Identifier un candidat interne ou externe avec les compétences requises',
        'S\'assurer de son indépendance et de l\'absence de conflit d\'intérêts',
        'Notifier l\'INPDP de la désignation',
        'Mettre à disposition les ressources nécessaires à l\'exercice de ses missions'
      ],
      resources: [
        { label: 'Site INPDP', url: 'http://www.inpdp.nat.tn' }
      ]
    },
    followUpQuestions: [
      {
        id: 'dpo-type',
        question: 'Le délégué est-il interne ou externe ?',
        type: 'select',
        options: ['Interne', 'Externe', 'Mutualisé'],
        category: 'Gouvernance',
        showIf: { questionId: 'dpo-designation', answer: true }
      },
      {
        id: 'dpo-declared-inpdp',
        question: 'Le délégué a-t-il été notifié à l\'INPDP ?',
        type: 'boolean',
        category: 'Gouvernance',
        isCritical: true,
        showIf: { questionId: 'dpo-designation', answer: true },
        riskIfNo: 'moyen',
        guidance: {
          title: 'Notification à l\'INPDP',
          description: 'L\'Autorité de protection des données (INPDP) doit être informée de la désignation du délégué.',
          actions: [
            'Contacter l\'INPDP pour la procédure de notification',
            'Transmettre les coordonnées du délégué',
            'Conserver la preuve de notification'
          ]
        }
      }
    ]
  },
  {
    id: 'registre-traitements',
    question: 'Tenez-vous un registre des traitements de données personnelles ?',
    description: 'Obligation de documenter tous les traitements conformément à la Loi 2025/95',
    type: 'boolean',
    category: 'Documentation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Création d\'un registre des traitements',
      description: 'Le registre est obligatoire pour documenter tous les traitements de données personnelles effectués.',
      actions: [
        'Recenser tous les traitements de données personnelles',
        'Documenter pour chaque traitement : finalité, catégories de données, destinataires, durées (Art. 6, 7, 10)',
        'Identifier les mesures de sécurité mises en place',
        'Mettre à jour le registre régulièrement'
      ]
    },
    followUpQuestions: [
      {
        id: 'registre-format',
        question: 'Sous quel format est tenu le registre ?',
        type: 'select',
        options: ['Tableur Excel/Sheets', 'Outil dédié', 'Document Word/PDF', 'Logiciel métier intégré'],
        category: 'Documentation',
        showIf: { questionId: 'registre-traitements', answer: true }
      },
      {
        id: 'registre-maj',
        question: 'Le registre est-il mis à jour régulièrement ?',
        type: 'boolean',
        category: 'Documentation',
        showIf: { questionId: 'registre-traitements', answer: true },
        guidance: {
          title: 'Mise à jour du registre',
          description: 'Le registre doit être tenu à jour en permanence.',
          actions: [
            'Définir un processus de mise à jour (ex: revue trimestrielle)',
            'Impliquer les responsables métiers dans l\'identification des nouveaux traitements',
            'Documenter les modifications apportées'
          ]
        }
      }
    ]
  },
  {
    id: 'information-personnes',
    question: 'Informez-vous les personnes concernées avant la collecte de leurs données ?',
    description: 'Obligation prévue par les Articles 12 et 13 de la Loi 2025/95',
    type: 'boolean',
    category: 'Transparence',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Information des personnes concernées',
      description: 'Selon l\'Article 12, la personne concernée doit être informée avant la collecte des données traitées, des finalités, de la base juridique, de la durée de conservation, de ses droits et des destinataires.',
      actions: [
        'Rédiger des mentions d\'information claires et accessibles',
        'Inclure : finalités, base juridique, durée de conservation, droits des personnes, destinataires',
        'Informer de la source des données si collecte indirecte (Art. 13)',
        'Rendre l\'information facilement accessible'
      ]
    },
    followUpQuestions: [
      {
        id: 'information-complete',
        question: 'L\'information contient-elle toutes les mentions obligatoires (Art. 12) ?',
        type: 'boolean',
        category: 'Transparence',
        showIf: { questionId: 'information-personnes', answer: true },
        guidance: {
          title: 'Mentions obligatoires (Article 12)',
          description: 'Vérifiez que votre information contient : données traitées, finalités, base juridique, durée de conservation, droits des personnes, destinataires.',
          actions: [
            'Lister toutes les finalités de traitement',
            'Préciser les bases légales',
            'Indiquer les durées de conservation',
            'Détailler les droits (accès, opposition, portabilité, oubli) et comment les exercer'
          ]
        }
      }
    ]
  },
  {
    id: 'consentement',
    question: 'Recueillez-vous le consentement libre, spécifique et éclairé des personnes ?',
    description: 'Exigence de l\'Article 15 de la Loi 2025/95',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Gestion du consentement (Art. 15)',
      description: 'Le traitement des données nécessite le consentement libre, spécifique et éclairé de la personne concernée, sauf exceptions prévues par l\'Article 16.',
      actions: [
        'S\'assurer que le consentement est libre (non contraint)',
        'Recueillir un consentement spécifique à chaque finalité',
        'Fournir une information claire permettant un consentement éclairé',
        'Permettre le retrait du consentement à tout moment (Art. 17)'
      ]
    },
    followUpQuestions: [
      {
        id: 'consentement-preuve',
        question: 'Conservez-vous une preuve du consentement ?',
        type: 'boolean',
        category: 'Consentement',
        showIf: { questionId: 'consentement', answer: true }
      },
      {
        id: 'consentement-retrait',
        question: 'Les personnes peuvent-elles retirer leur consentement facilement (Art. 17) ?',
        type: 'boolean',
        category: 'Consentement',
        showIf: { questionId: 'consentement', answer: true }
      }
    ]
  },
  {
    id: 'procedure-droits',
    question: 'Avez-vous une procédure pour répondre aux demandes d\'exercice des droits ?',
    description: 'Droits d\'accès (Art. 21), opposition (Art. 29), portabilité (Art. 32), effacement (Art. 34)',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Procédure de gestion des droits',
      description: 'Vous devez pouvoir répondre aux demandes d\'accès dans un délai de 15 jours (Art. 22).',
      actions: [
        'Créer un formulaire de demande d\'exercice des droits',
        'Définir un processus de vérification d\'identité',
        'Respecter le délai de 15 jours pour le droit d\'accès',
        'Former les équipes à identifier et traiter les demandes'
      ]
    },
    followUpQuestions: [
      {
        id: 'droits-delai-15j',
        question: 'Répondez-vous aux demandes d\'accès dans le délai de 15 jours (Art. 22) ?',
        type: 'boolean',
        category: 'Droits des personnes',
        showIf: { questionId: 'procedure-droits', answer: true },
        riskIfNo: 'moyen'
      },
      {
        id: 'droits-portabilite',
        question: 'Permettez-vous la portabilité des données (Art. 32) ?',
        type: 'boolean',
        category: 'Droits des personnes',
        showIf: { questionId: 'procedure-droits', answer: true }
      },
      {
        id: 'droits-oubli',
        question: 'Avez-vous une procédure pour le droit à l\'oubli (Art. 34) ?',
        type: 'boolean',
        category: 'Droits des personnes',
        showIf: { questionId: 'procedure-droits', answer: true }
      }
    ]
  },
  {
    id: 'mesures-securite',
    question: 'Avez-vous mis en place des mesures de sécurité pour protéger les données personnelles ?',
    description: 'Mesures techniques et organisationnelles conformément à la Loi 2025/95',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'partiellement_conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Mesures de sécurité',
      description: 'Les mesures doivent être adaptées aux risques pour protéger l\'intégrité et la confidentialité des données.',
      actions: [
        'Réaliser une analyse des risques de sécurité',
        'Mettre en place le chiffrement des données sensibles',
        'Implémenter une politique de mots de passe robuste',
        'Sauvegarder régulièrement les données',
        'Former les collaborateurs aux bonnes pratiques'
      ]
    },
    followUpQuestions: [
      {
        id: 'securite-chiffrement',
        question: 'Les données sensibles sont-elles chiffrées ?',
        type: 'boolean',
        category: 'Sécurité',
        showIf: { questionId: 'mesures-securite', answer: true }
      },
      {
        id: 'securite-acces',
        question: 'L\'accès aux données est-il restreint aux personnes habilitées ?',
        type: 'boolean',
        category: 'Sécurité',
        showIf: { questionId: 'mesures-securite', answer: true }
      }
    ]
  },
  {
    id: 'donnees-sensibles',
    question: 'Traitez-vous des données sensibles (santé, origine ethnique, opinions politiques, etc.) ?',
    description: 'Régime spécial prévu par les Articles 40 et 41 de la Loi 2025/95',
    type: 'boolean',
    category: 'Données sensibles',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Traitement des données sensibles',
      description: 'Le traitement des données sensibles est interdit sauf exceptions (Art. 40). Une autorisation préalable de l\'INPDP est requise (Art. 41).',
      actions: [
        'Identifier si vous traitez des données sensibles (Art. 4)',
        'Vérifier que vous disposez d\'une exception légale',
        'Demander l\'autorisation préalable à l\'INPDP si nécessaire',
        'Mettre en place des mesures de protection renforcées'
      ]
    },
    followUpQuestions: [
      {
        id: 'sensibles-autorisation',
        question: 'Avez-vous obtenu l\'autorisation préalable de l\'INPDP (Art. 41) ?',
        type: 'boolean',
        category: 'Données sensibles',
        isCritical: true,
        showIf: { questionId: 'donnees-sensibles', answer: true },
        riskIfNo: 'eleve',
        guidance: {
          title: 'Autorisation préalable INPDP',
          description: 'Le traitement des données sensibles nécessite une autorisation préalable de l\'Autorité de protection des données.',
          actions: [
            'Préparer le dossier de demande d\'autorisation',
            'Soumettre la demande à l\'INPDP',
            'Attendre l\'autorisation avant de procéder au traitement'
          ]
        }
      },
      {
        id: 'sensibles-base-legale',
        question: 'Quelle est la base légale du traitement de ces données sensibles ?',
        type: 'select',
        options: [
          'Consentement explicite',
          'Obligation légale',
          'Intérêt public (santé, sécurité)',
          'Recherche scientifique',
          'Autre'
        ],
        category: 'Données sensibles',
        showIf: { questionId: 'donnees-sensibles', answer: true }
      }
    ]
  },
  {
    id: 'intelligence-artificielle',
    question: 'Utilisez-vous des systèmes d\'intelligence artificielle pour traiter des données personnelles ?',
    description: 'Régime spécial prévu par les Articles 90 et 91 de la Loi 2025/95',
    type: 'boolean',
    category: 'Intelligence Artificielle',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Utilisation de l\'IA (Art. 90-91)',
      description: 'La Loi 2025/95 encadre spécifiquement l\'utilisation de l\'IA pour le traitement des données personnelles.',
      actions: [
        'Informer les personnes de l\'utilisation de systèmes d\'IA (Art. 90)',
        'Expliquer les finalités et impacts potentiels',
        'Permettre de refuser les décisions automatisées (Art. 91)'
      ]
    },
    followUpQuestions: [
      {
        id: 'ia-information',
        question: 'Les personnes sont-elles informées de l\'utilisation de l\'IA (Art. 90) ?',
        type: 'boolean',
        category: 'Intelligence Artificielle',
        isCritical: true,
        showIf: { questionId: 'intelligence-artificielle', answer: true },
        riskIfNo: 'eleve'
      },
      {
        id: 'ia-decision-humaine',
        question: 'Les personnes peuvent-elles demander une intervention humaine (Art. 91) ?',
        type: 'boolean',
        category: 'Intelligence Artificielle',
        showIf: { questionId: 'intelligence-artificielle', answer: true },
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'transfert-etranger',
    question: 'Transférez-vous des données personnelles à l\'étranger ?',
    description: 'Encadrement strict des transferts hors Tunisie selon la Loi 2025/95',
    type: 'boolean',
    category: 'Transferts internationaux',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Transferts de données à l\'étranger',
      description: 'Les transferts de données à l\'étranger sont strictement encadrés. Des garanties appropriées doivent être mises en place.',
      actions: [
        'Identifier tous les transferts de données hors Tunisie',
        'Vérifier le niveau de protection du pays destinataire',
        'Mettre en place des garanties contractuelles',
        'Informer les personnes concernées'
      ]
    },
    followUpQuestions: [
      {
        id: 'transfert-garanties',
        question: 'Avez-vous mis en place des garanties appropriées pour ces transferts ?',
        type: 'boolean',
        category: 'Transferts internationaux',
        isCritical: true,
        showIf: { questionId: 'transfert-etranger', answer: true },
        riskIfNo: 'eleve'
      },
      {
        id: 'transfert-pays',
        question: 'Vers quels pays les données sont-elles transférées ?',
        type: 'text',
        category: 'Transferts internationaux',
        showIf: { questionId: 'transfert-etranger', answer: true }
      }
    ]
  }
];

// ========================================
// Questions spécifiques santé - Tunisie
// ========================================
export const tunisianHealthQuestions: ConditionalQuestion[] = [
  {
    id: 'sante-autorisation',
    question: 'Avez-vous obtenu l\'autorisation préalable de l\'INPDP pour le traitement des données de santé ?',
    description: 'Obligation prévue par l\'Article 70 de la Loi 2025/95',
    type: 'boolean',
    category: 'Données de santé',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Autorisation pour données de santé (Art. 70)',
      description: 'Le traitement des données de santé nécessite une autorisation préalable de l\'Autorité de protection des données.',
      actions: [
        'Identifier tous les traitements de données de santé',
        'Préparer le dossier de demande d\'autorisation',
        'Soumettre la demande à l\'INPDP',
        'Attendre l\'autorisation avant de procéder au traitement'
      ],
      resources: [
        { label: 'Site INPDP', url: 'http://www.inpdp.nat.tn' }
      ]
    }
  },
  {
    id: 'sante-professionnels',
    question: 'Les données de santé sont-elles traitées uniquement par des professionnels de santé ou personnes soumises au secret professionnel ?',
    description: 'Exigence de l\'Article 73 de la Loi 2025/95',
    type: 'boolean',
    category: 'Données de santé',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Accès aux données de santé (Art. 73)',
      description: 'Seuls les professionnels de santé ou les personnes soumises au secret professionnel peuvent traiter ces données.',
      actions: [
        'Identifier toutes les personnes ayant accès aux données de santé',
        'Vérifier leur statut (professionnel de santé ou secret professionnel)',
        'Limiter l\'accès aux seules personnes habilitées',
        'Former sur les obligations de confidentialité'
      ]
    }
  },
  {
    id: 'sante-secret',
    question: 'Le secret médical est-il respecté dans le partage des données ?',
    description: 'Les données ne doivent être partagées qu\'avec les personnes habilitées',
    type: 'boolean',
    category: 'Confidentialité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Respect du secret médical',
      description: 'Le secret médical s\'applique à tous les professionnels ayant accès aux données de santé.',
      actions: [
        'Former tous les collaborateurs au secret médical',
        'Limiter l\'accès aux données selon le besoin d\'en connaître',
        'Tracer tous les accès aux données sensibles',
        'Signer des clauses de confidentialité'
      ]
    }
  }
];

// ========================================
// Questions Transport - Tunisie
// ========================================
export const tunisianTransportGeneralQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-tn-geolocalisation',
    question: 'Avez-vous déclaré les traitements de géolocalisation à l\'INPDP ?',
    description: 'La géolocalisation des véhicules et conducteurs nécessite une déclaration préalable selon la Loi 2025/95',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Déclaration géolocalisation INPDP',
      description: 'Tout traitement de géolocalisation doit être déclaré à l\'Instance Nationale de Protection des Données Personnelles.',
      actions: [
        'Identifier tous les systèmes de géolocalisation utilisés',
        'Préparer le dossier de déclaration à l\'INPDP',
        'Informer les conducteurs du suivi GPS',
        'Définir les durées de conservation des données'
      ],
      resources: [
        { label: 'Site INPDP', url: 'http://www.inpdp.nat.tn' }
      ]
    },
    followUpQuestions: [
      {
        id: 'transp-tn-geo-information',
        question: 'Les conducteurs sont-ils informés du suivi GPS ?',
        type: 'boolean',
        category: 'Géolocalisation',
        showIf: { questionId: 'transp-tn-geolocalisation', answer: true },
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'transp-tn-chronotachygraphe',
    question: 'Les données de chronotachygraphe sont-elles traitées conformément à la Loi 2025/95 ?',
    description: 'Temps de conduite, repos, téléchargement et conservation des données',
    type: 'boolean',
    category: 'Chronotachygraphe',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Conformité chronotachygraphe',
      description: 'Les données de chronotachygraphe contiennent des informations personnelles sur les conducteurs.',
      actions: [
        'Définir les finalités du traitement',
        'Limiter l\'accès aux données aux personnes habilitées',
        'Respecter les durées de conservation légales',
        'Permettre l\'accès des conducteurs à leurs données'
      ]
    }
  },
  {
    id: 'transp-tn-videosurveillance',
    question: 'Avez-vous obtenu l\'autorisation de l\'INPDP pour la vidéosurveillance ?',
    description: 'Entrepôts, dashcams, caméras embarquées selon la Loi 2025/95',
    type: 'boolean',
    category: 'Vidéosurveillance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Autorisation vidéosurveillance INPDP',
      description: 'La vidéosurveillance nécessite une autorisation préalable de l\'INPDP.',
      actions: [
        'Inventorier tous les dispositifs de vidéosurveillance',
        'Demander l\'autorisation à l\'INPDP',
        'Afficher les panneaux d\'information',
        'Définir les durées de conservation (max 30 jours recommandés)'
      ]
    }
  },
  {
    id: 'transp-tn-clients',
    question: 'Informez-vous vos clients du traitement de leurs données conformément aux Articles 12-13 ?',
    description: 'Données clients, marchandises, traçabilité',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Information clients (Art. 12-13)',
      description: 'Les clients doivent être informés des traitements de leurs données.',
      actions: [
        'Rédiger une politique de confidentialité claire',
        'Inclure les mentions obligatoires dans les contrats',
        'Permettre l\'exercice des droits'
      ]
    }
  },
  {
    id: 'transp-tn-conducteurs',
    question: 'Les dossiers RH des conducteurs respectent-ils la Loi 2025/95 ?',
    description: 'Données personnelles, aptitude médicale, formations',
    type: 'boolean',
    category: 'RH Conducteurs',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Conformité RH conducteurs',
      description: 'Les données RH des conducteurs incluent souvent des données sensibles (aptitude médicale).',
      actions: [
        'Limiter la collecte aux données nécessaires',
        'Sécuriser les dossiers médicaux',
        'Respecter les durées de conservation légales',
        'Permettre l\'accès des salariés à leurs données'
      ]
    }
  },
  {
    id: 'transp-tn-soustraitants',
    question: 'Vos contrats avec les sous-traitants incluent-ils les clauses de protection des données ?',
    description: 'Affrétés, partenaires, télématique selon la Loi 2025/95',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Contrats sous-traitants',
      description: 'Les contrats avec les sous-traitants doivent encadrer le traitement des données.',
      actions: [
        'Auditer les sous-traitants existants',
        'Inclure des clauses de protection des données',
        'Vérifier les garanties de sécurité',
        'Prévoir les modalités de restitution/suppression'
      ]
    }
  },
  {
    id: 'transp-tn-securite-it',
    question: 'Les systèmes informatiques (TMS, télématique) sont-ils sécurisés ?',
    description: 'Cybersécurité, sauvegardes, PCA selon la Loi 2025/95',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Sécurité des systèmes informatiques',
      description: 'Les mesures de sécurité doivent être adaptées aux risques.',
      actions: [
        'Réaliser un audit de sécurité des systèmes',
        'Mettre en place des sauvegardes régulières',
        'Chiffrer les données sensibles',
        'Former les collaborateurs à la cybersécurité'
      ]
    }
  }
];

export const tunisianTransportCustomsQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-tn-douane-autorisation',
    question: 'Avez-vous obtenu l\'autorisation de l\'INPDP pour le traitement des données douanières ?',
    description: 'Données spécifiques aux opérations sous douane selon la Loi 2025/95',
    type: 'boolean',
    category: 'Autorisation douane',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Autorisation traitement données douanières',
      description: 'Les données douanières peuvent inclure des informations sensibles nécessitant une autorisation.',
      actions: [
        'Identifier les données douanières traitées',
        'Demander l\'autorisation à l\'INPDP si nécessaire',
        'Documenter les finalités spécifiques',
        'Définir les durées de conservation réglementaires'
      ]
    }
  },
  {
    id: 'transp-tn-douane-conservation',
    question: 'Les durées de conservation des documents douaniers sont-elles respectées ?',
    description: 'Conservation réglementaire des DAU, déclarations et justificatifs',
    type: 'boolean',
    category: 'Conservation douane',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Conservation documents douaniers',
      description: 'Les documents douaniers ont des durées de conservation réglementaires spécifiques.',
      actions: [
        'Identifier les durées légales de conservation',
        'Mettre en place une politique d\'archivage',
        'Prévoir la destruction sécurisée après expiration'
      ]
    }
  },
  {
    id: 'transp-tn-douane-acces',
    question: 'L\'accès aux données douanières est-il restreint aux personnes habilitées ?',
    description: 'Contrôle des accès selon la Loi 2025/95',
    type: 'boolean',
    category: 'Accès douane',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Contrôle d\'accès données douanières',
      description: 'Seules les personnes habilitées doivent accéder aux données douanières.',
      actions: [
        'Définir les profils d\'accès',
        'Mettre en place une traçabilité des accès',
        'Réviser régulièrement les habilitations'
      ]
    }
  }
];

export const tunisianTransportMultimodalQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-tn-multi-interoperabilite',
    question: 'Les échanges de données entre modes de transport respectent-ils la Loi 2025/95 ?',
    description: 'Interopérabilité route/rail/mer/air et protection des données',
    type: 'boolean',
    category: 'Interopérabilité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Échanges de données multimodaux',
      description: 'Les échanges de données entre différents acteurs du transport doivent être encadrés.',
      actions: [
        'Cartographier les flux de données entre partenaires',
        'Contractualiser les échanges de données',
        'Sécuriser les interfaces d\'échange',
        'Informer les personnes concernées'
      ]
    }
  },
  {
    id: 'transp-tn-multi-portuaire',
    question: 'Les données portuaires/aéroportuaires sont-elles traitées conformément à la Loi 2025/95 ?',
    description: 'Données spécifiques aux passages portuaires et aéroportuaires',
    type: 'boolean',
    category: 'Données portuaires',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Conformité données portuaires/aéroportuaires',
      description: 'Les données liées aux passages portuaires et aéroportuaires sont souvent sensibles.',
      actions: [
        'Identifier les données collectées aux points de passage',
        'Vérifier les autorisations nécessaires',
        'Sécuriser les transmissions de données'
      ]
    }
  },
  {
    id: 'transp-tn-multi-tracking',
    question: 'Le suivi multimodal des marchandises respecte-t-il le principe de minimisation ?',
    description: 'Données de tracking sur l\'ensemble de la chaîne logistique',
    type: 'boolean',
    category: 'Tracking multimodal',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Minimisation données tracking',
      description: 'Ne collecter que les données nécessaires au suivi des marchandises.',
      actions: [
        'Auditer les données collectées à chaque étape',
        'Supprimer les données non nécessaires',
        'Anonymiser les données historiques'
      ]
    }
  }
];

// ========================================
// Questions spécifiques Assurance Vie - Tunisie
// ========================================
export const tunisianLifeInsuranceQuestions: ConditionalQuestion[] = [
  {
    id: 'ass-vie-tn-autorisation',
    question: 'Avez-vous obtenu l\'autorisation préalable de l\'INPDP pour le traitement des données de santé dans les questionnaires médicaux ?',
    description: 'Obligation prévue par les Articles 70-73 du Projet de loi 2025/95 pour les données de santé utilisées en tarification',
    type: 'boolean',
    category: 'Autorisation INPDP',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Autorisation données de santé assurance vie',
      description: 'Les questionnaires médicaux utilisés pour la tarification contiennent des données sensibles nécessitant une autorisation préalable.',
      actions: [
        'Identifier tous les traitements de données de santé (questionnaires, expertises)',
        'Préparer le dossier de demande d\'autorisation INPDP',
        'Justifier la nécessité des données collectées',
        'Attendre l\'autorisation avant tout traitement'
      ],
      resources: [
        { label: 'Site INPDP', url: 'http://www.inpdp.nat.tn' }
      ]
    }
  },
  {
    id: 'ass-vie-tn-consentement',
    question: 'Recueillez-vous un consentement explicite des assurés pour le traitement de leurs données de santé ?',
    description: 'Exigence de l\'Article 40 du Projet de loi 2025/95 pour les données sensibles',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Consentement explicite données sensibles',
      description: 'Le traitement des données de santé nécessite un consentement explicite selon l\'Article 40.',
      actions: [
        'Créer un formulaire de consentement spécifique',
        'Expliquer clairement l\'utilisation des données de santé pour la tarification',
        'Permettre le refus partiel (certaines données seulement)',
        'Conserver la preuve du consentement'
      ]
    },
    followUpQuestions: [
      {
        id: 'ass-vie-tn-consentement-preuve',
        question: 'Conservez-vous une preuve du consentement ?',
        type: 'boolean',
        category: 'Consentement',
        showIf: { questionId: 'ass-vie-tn-consentement', answer: true }
      }
    ]
  },
  {
    id: 'ass-vie-tn-beneficiaires',
    question: 'Les données des bénéficiaires sont-elles traitées conformément au Projet de loi 2025/95 ?',
    description: 'Les clauses bénéficiaires contiennent des données personnelles de tiers',
    type: 'boolean',
    category: 'Données bénéficiaires',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Protection des données bénéficiaires',
      description: 'Les bénéficiaires sont des tiers dont les données doivent également être protégées.',
      actions: [
        'Limiter la collecte aux données nécessaires (nom, coordonnées)',
        'Informer l\'assuré de la transmission aux bénéficiaires en cas de sinistre',
        'Sécuriser l\'accès aux clauses bénéficiaires',
        'Définir les durées de conservation après le décès'
      ]
    }
  },
  {
    id: 'ass-vie-tn-profilage',
    question: 'Utilisez-vous des systèmes de scoring ou de décision automatisée pour la tarification ?',
    description: 'Encadrement par les Articles 90-91 du Projet de loi 2025/95 sur l\'intelligence artificielle',
    type: 'boolean',
    category: 'Profilage et IA',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Décision automatisée et profilage',
      description: 'Le Projet de loi 2025/95 encadre strictement les décisions automatisées (Art. 90-91).',
      actions: [
        'Informer les assurés de l\'existence du profilage (Art. 90)',
        'Permettre l\'intervention humaine dans les décisions',
        'Expliquer la logique des algorithmes sur demande',
        'Permettre de contester les décisions automatisées (Art. 91)'
      ]
    },
    followUpQuestions: [
      {
        id: 'ass-vie-tn-profilage-info',
        question: 'Les assurés sont-ils informés du profilage (Art. 90) ?',
        type: 'boolean',
        category: 'Profilage et IA',
        isCritical: true,
        showIf: { questionId: 'ass-vie-tn-profilage', answer: true },
        riskIfNo: 'eleve'
      },
      {
        id: 'ass-vie-tn-profilage-humain',
        question: 'Une intervention humaine est-elle possible (Art. 91) ?',
        type: 'boolean',
        category: 'Profilage et IA',
        showIf: { questionId: 'ass-vie-tn-profilage', answer: true },
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'ass-vie-tn-reassurance',
    question: 'Transférez-vous des données vers des réassureurs à l\'étranger ?',
    description: 'Encadrement des transferts internationaux selon le Projet de loi 2025/95',
    type: 'boolean',
    category: 'Transferts internationaux',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Transferts vers réassureurs',
      description: 'Les transferts de données hors Tunisie sont strictement encadrés.',
      actions: [
        'Identifier tous les réassureurs recevant des données',
        'Vérifier le niveau de protection du pays destinataire',
        'Mettre en place des garanties contractuelles',
        'Informer les assurés des transferts'
      ]
    },
    followUpQuestions: [
      {
        id: 'ass-vie-tn-reassurance-garanties',
        question: 'Avez-vous mis en place des garanties contractuelles ?',
        type: 'boolean',
        category: 'Transferts internationaux',
        isCritical: true,
        showIf: { questionId: 'ass-vie-tn-reassurance', answer: true },
        riskIfNo: 'eleve'
      }
    ]
  },
  {
    id: 'ass-vie-tn-conservation',
    question: 'Avez-vous défini des durées de conservation conformes pour les contrats d\'assurance vie ?',
    description: 'Conservation proportionnée selon l\'Article 10 du Projet de loi 2025/95',
    type: 'boolean',
    category: 'Conservation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Durées de conservation assurance vie',
      description: 'Les durées doivent être limitées aux finalités (Art. 10) tout en respectant les obligations légales.',
      actions: [
        'Définir les durées par type de données (contrats, sinistres, prospects)',
        'Respecter les obligations légales de conservation (30 ans après le décès)',
        'Prévoir l\'archivage intermédiaire et définitif',
        'Documenter les durées dans le registre des traitements'
      ]
    }
  }
];

// ========================================
// Questions spécifiques Assurance Non-Vie (IARD) - Tunisie
// ========================================
export const tunisianNonLifeInsuranceQuestions: ConditionalQuestion[] = [
  {
    id: 'ass-iard-tn-sinistres',
    question: 'Les données des sinistres sont-elles traitées conformément au Projet de loi 2025/95 ?',
    description: 'Déclarations, expertises, photos, témoignages',
    type: 'boolean',
    category: 'Gestion sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Conformité gestion des sinistres',
      description: 'Les sinistres génèrent de nombreuses données personnelles à protéger.',
      actions: [
        'Limiter la collecte aux données nécessaires au traitement du sinistre',
        'Sécuriser les photos et documents transmis',
        'Informer les victimes et témoins du traitement de leurs données',
        'Définir les durées de conservation post-sinistre'
      ]
    }
  },
  {
    id: 'ass-iard-tn-experts',
    question: 'Les experts mandatés respectent-ils les obligations du Projet de loi 2025/95 ?',
    description: 'Sous-traitants ayant accès aux données des assurés et victimes',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Encadrement des experts',
      description: 'Les experts sont des sous-traitants au sens du Projet de loi 2025/95.',
      actions: [
        'Inclure des clauses de protection des données dans les conventions',
        'Vérifier les mesures de sécurité des experts',
        'Encadrer les transferts de données (photos, rapports)',
        'Former les experts aux obligations légales'
      ]
    }
  },
  {
    id: 'ass-iard-tn-fraude',
    question: 'Avez-vous obtenu l\'autorisation de l\'INPDP pour les traitements anti-fraude ?',
    description: 'La lutte contre la fraude implique des fichiers spécifiques nécessitant une autorisation',
    type: 'boolean',
    category: 'Lutte anti-fraude',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Autorisation traitement anti-fraude',
      description: 'Les fichiers de détection de fraude nécessitent une autorisation préalable de l\'INPDP.',
      actions: [
        'Identifier les traitements de détection de fraude',
        'Demander l\'autorisation à l\'INPDP',
        'Informer les assurés de ces traitements',
        'Permettre l\'exercice des droits d\'opposition'
      ]
    },
    followUpQuestions: [
      {
        id: 'ass-iard-tn-fraude-info',
        question: 'Les assurés sont-ils informés des traitements anti-fraude ?',
        type: 'boolean',
        category: 'Lutte anti-fraude',
        showIf: { questionId: 'ass-iard-tn-fraude', answer: true }
      }
    ]
  },
  {
    id: 'ass-iard-tn-tiers',
    question: 'Les données des tiers (victimes, témoins) sont-elles traitées conformément au Projet de loi 2025/95 ?',
    description: 'Les victimes d\'accidents sont des personnes concernées au sens de la loi',
    type: 'boolean',
    category: 'Données tiers',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Protection des données des tiers',
      description: 'Les victimes et témoins ont les mêmes droits que les assurés (Art. 12-34).',
      actions: [
        'Informer les tiers du traitement de leurs données (Art. 12-13)',
        'Permettre l\'exercice de leurs droits',
        'Limiter la conservation après règlement du sinistre',
        'Sécuriser les données médicales des victimes'
      ]
    }
  },
  {
    id: 'ass-iard-tn-geolocalisation',
    question: 'Utilisez-vous la géolocalisation pour la tarification ou la gestion des sinistres auto ?',
    description: 'Boîtiers télématiques, applications mobiles, pay-how-you-drive',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Géolocalisation assurance auto',
      description: 'La géolocalisation des assurés nécessite leur consentement explicite.',
      actions: [
        'Obtenir le consentement libre et spécifique (Art. 15)',
        'Informer clairement de l\'utilisation des données de conduite',
        'Permettre le retrait du consentement (Art. 17)',
        'Limiter la conservation des données de trajet'
      ]
    },
    followUpQuestions: [
      {
        id: 'ass-iard-tn-geoloc-consentement',
        question: 'Le consentement est-il recueilli avant l\'activation ?',
        type: 'boolean',
        category: 'Géolocalisation',
        isCritical: true,
        showIf: { questionId: 'ass-iard-tn-geolocalisation', answer: true },
        riskIfNo: 'eleve'
      }
    ]
  },
  {
    id: 'ass-iard-tn-video',
    question: 'Utilisez-vous des preuves vidéo (dashcam, vidéosurveillance) dans la gestion des sinistres ?',
    description: 'Images contenant des données personnelles de tiers',
    type: 'boolean',
    category: 'Preuves vidéo',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Utilisation des preuves vidéo',
      description: 'Les enregistrements vidéo contiennent des données personnelles de multiples personnes.',
      actions: [
        'Limiter la collecte au strict nécessaire pour l\'instruction du sinistre',
        'Flouter les visages des personnes non concernées',
        'Supprimer les enregistrements après traitement du dossier',
        'Sécuriser le stockage des vidéos'
      ]
    }
  },
  {
    id: 'ass-iard-tn-conservation',
    question: 'Avez-vous défini des durées de conservation conformes pour les contrats IARD ?',
    description: 'Conservation proportionnée selon l\'Article 10 du Projet de loi 2025/95',
    type: 'boolean',
    category: 'Conservation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'partiellement_conforme'
    },
    guidance: {
      title: 'Durées de conservation IARD',
      description: 'Les durées doivent respecter les obligations légales tout en limitant la conservation.',
      actions: [
        'Définir les durées par type de données (contrats, sinistres, prospects)',
        'Respecter les prescriptions légales (2 ans RC, 10 ans construction)',
        'Prévoir la purge automatique des données anciennes',
        'Documenter les durées dans le registre'
      ]
    }
  }
];

// ========================================
// Sections Assurance tunisiennes
// ========================================
export const tunisianLifeInsuranceSections: QuestionnaireSection[] = [
  {
    id: 'ass-vie-tn',
    title: '6. Assurance vie',
    description: 'Données de santé (Art. 70), consentement (Art. 40), bénéficiaires, profilage (Art. 90-91)',
    icon: 'heart',
    questions: tunisianLifeInsuranceQuestions
  }
];

export const tunisianNonLifeInsuranceSections: QuestionnaireSection[] = [
  {
    id: 'ass-iard-tn',
    title: '6. Assurance IARD',
    description: 'Sinistres, experts, anti-fraude, données tiers, géolocalisation',
    icon: 'shield',
    questions: tunisianNonLifeInsuranceQuestions
  }
];

// ========================================
// Sections Transport tunisiennes
// ========================================
export const tunisianTransportGeneralSections: QuestionnaireSection[] = [
  {
    id: 'transp-tn-general',
    title: '7. Transport général',
    description: 'Géolocalisation, chronotachygraphe, vidéosurveillance, données clients, RH, sous-traitants',
    icon: 'truck',
    questions: tunisianTransportGeneralQuestions
  }
];

export const tunisianTransportCustomsSections: QuestionnaireSection[] = [
  {
    id: 'transp-tn-customs',
    title: '7. Magasin & Aire sous douane',
    description: 'Autorisation INPDP, conservation documents, contrôle accès données douanières',
    icon: 'archive',
    questions: tunisianTransportCustomsQuestions
  }
];

export const tunisianTransportMultimodalSections: QuestionnaireSection[] = [
  {
    id: 'transp-tn-multimodal',
    title: '7. Transport multimodal',
    description: 'Interopérabilité, données portuaires/aéroportuaires, tracking multimodal',
    icon: 'ship',
    questions: tunisianTransportMultimodalQuestions
  }
];

// ========================================
// Sections communes tunisiennes
// ========================================
export const tunisianCommonSections: QuestionnaireSection[] = [
  {
    id: 'gouvernance-tn',
    title: '1. Gouvernance et responsabilités',
    description: 'Délégué à la protection des données, responsabilités, documentation',
    icon: 'shield',
    questions: tunisianCommonCriticalQuestions.slice(0, 2) // DPO + Registre
  },
  {
    id: 'transparence-tn',
    title: '2. Information et consentement',
    description: 'Information des personnes (Art. 12-13), consentement (Art. 15-17)',
    icon: 'file-text',
    questions: tunisianCommonCriticalQuestions.slice(2, 4) // Information + Consentement
  },
  {
    id: 'droits-tn',
    title: '3. Droits des personnes',
    description: 'Accès (Art. 21-22), opposition (Art. 29), portabilité (Art. 32), oubli (Art. 34)',
    icon: 'users',
    questions: tunisianCommonCriticalQuestions.slice(4, 5) // Droits
  },
  {
    id: 'securite-tn',
    title: '4. Sécurité et données sensibles',
    description: 'Mesures de sécurité, données sensibles (Art. 40-41)',
    icon: 'lock',
    questions: tunisianCommonCriticalQuestions.slice(5, 7) // Sécurité + Données sensibles
  },
  {
    id: 'ia-transferts-tn',
    title: '5. IA et transferts internationaux',
    description: 'Intelligence artificielle (Art. 90-91), transferts à l\'étranger',
    icon: 'globe',
    questions: tunisianCommonCriticalQuestions.slice(7) // IA + Transferts
  }
];

// ========================================
// Sections santé tunisiennes
// ========================================
export const tunisianHealthSections: QuestionnaireSection[] = [
  {
    id: 'sante-tn',
    title: '6. Données de santé',
    description: 'Autorisation INPDP (Art. 70), professionnels habilités (Art. 73), secret médical',
    icon: 'heart',
    questions: tunisianHealthQuestions
  }
];

// ========================================
// Labels des questionnaires tunisiens
// ========================================
export const TUNISIAN_QUESTIONNAIRE_LABELS: Record<string, string> = {
  sante_reglementee_pharmacien: 'Questionnaire Projet de loi 2025/95 - Pharmacie',
  sante_reglementee_medecin: 'Questionnaire Projet de loi 2025/95 - Professionnel de santé',
  sante_non_reglementee_bien_etre: 'Questionnaire Projet de loi 2025/95 - Bien-être',
  assurance_vie: 'Questionnaire Projet de loi 2025/95 - Assurance vie',
  assurance_non_vie: 'Questionnaire Projet de loi 2025/95 - Assurance IARD',
  transport_logistique: 'Questionnaire Projet de loi 2025/95 - Transport & Logistique'
};
