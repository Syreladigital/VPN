import { ConditionalQuestion, QuestionnaireSection, SectorQuestionnaire } from '@/types/conditionalQuestionnaire';
import { Sector } from '@/types/rgpd';

// ========================================
// Questions critiques communes à tous les secteurs
// ========================================
const commonCriticalQuestions: ConditionalQuestion[] = [
  {
    id: 'dpo-designation',
    question: 'Avez-vous désigné un DPO (Délégué à la Protection des Données) ?',
    description: 'Le DPO est obligatoire pour les organismes traitant des données sensibles à grande échelle',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Comment désigner un DPO',
      description: 'La désignation d\'un DPO est obligatoire pour les organismes publics et ceux traitant des données sensibles à grande échelle.',
      actions: [
        'Identifier un candidat interne ou externe avec les compétences requises',
        'S\'assurer de son indépendance et de l\'absence de conflit d\'intérêts',
        'Déclarer le DPO auprès de la CNIL via le formulaire en ligne',
        'Mettre à disposition les ressources nécessaires à l\'exercice de ses missions'
      ],
      resources: [
        { label: 'Guide CNIL - Désigner un DPO', url: 'https://www.cnil.fr/fr/designer-un-dpo' }
      ]
    },
    followUpQuestions: [
      {
        id: 'dpo-type',
        question: 'Le DPO est-il interne ou externe ?',
        type: 'select',
        options: ['Interne', 'Externe', 'Mutualisé'],
        category: 'Gouvernance RGPD',
        showIf: { questionId: 'dpo-designation', answer: true }
      },
      {
        id: 'dpo-declared-cnil',
        question: 'Le DPO a-t-il été déclaré à la CNIL ?',
        type: 'boolean',
        category: 'Gouvernance RGPD',
        isCritical: true,
        showIf: { questionId: 'dpo-designation', answer: true },
        riskIfNo: 'moyen',
        guidance: {
          title: 'Déclaration du DPO à la CNIL',
          description: 'La déclaration du DPO à la CNIL est obligatoire et doit être effectuée en ligne.',
          actions: [
            'Accéder au service en ligne de désignation de la CNIL',
            'Remplir le formulaire avec les coordonnées du DPO',
            'Conserver l\'accusé de réception de la désignation'
          ],
          resources: [
            { label: 'Formulaire de désignation CNIL', url: 'https://www.cnil.fr/fr/designation-dpo' }
          ]
        }
      },
      {
        id: 'dpo-plan',
        question: 'Avez-vous prévu de désigner un DPO ?',
        type: 'boolean',
        category: 'Gouvernance RGPD',
        showIf: { questionId: 'dpo-designation', answer: false }
      }
    ]
  },
  {
    id: 'registre-traitements',
    question: 'Tenez-vous un registre des activités de traitement (ROPA) ?',
    description: 'Obligation prévue par l\'article 30 du RGPD',
    type: 'boolean',
    category: 'Documentation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Comment créer un registre des traitements',
      description: 'Le registre est obligatoire pour tout organisme, quelle que soit sa taille.',
      actions: [
        'Recenser tous les traitements de données personnelles',
        'Documenter pour chaque traitement : finalité, catégories de données, destinataires, durées',
        'Identifier les mesures de sécurité mises en place',
        'Mettre à jour le registre régulièrement'
      ],
      resources: [
        { label: 'Modèle CNIL de registre', url: 'https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement' }
      ]
    },
    followUpQuestions: [
      {
        id: 'registre-format',
        question: 'Sous quel format est tenu le registre ?',
        type: 'select',
        options: ['Tableur Excel/Sheets', 'Outil dédié RGPD', 'Document Word/PDF', 'Logiciel métier intégré'],
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
    id: 'politique-confidentialite',
    question: 'Avez-vous une politique de confidentialité accessible aux personnes concernées ?',
    description: 'Information obligatoire selon les articles 13 et 14 du RGPD',
    type: 'boolean',
    category: 'Transparence',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Rédiger une politique de confidentialité',
      description: 'La politique de confidentialité doit informer les personnes de manière claire et accessible.',
      actions: [
        'Rédiger la politique avec un langage simple et compréhensible',
        'Inclure toutes les mentions obligatoires (identité du RT, finalités, droits...)',
        'Rendre la politique facilement accessible (site web, affichage, contrats)',
        'Mettre à jour la politique en cas de changement'
      ]
    },
    followUpQuestions: [
      {
        id: 'politique-complete',
        question: 'La politique contient-elle toutes les mentions obligatoires ?',
        type: 'boolean',
        category: 'Transparence',
        showIf: { questionId: 'politique-confidentialite', answer: true },
        guidance: {
          title: 'Mentions obligatoires',
          description: 'Vérifiez que votre politique contient : identité du responsable, finalités, bases légales, destinataires, durées de conservation, droits des personnes.',
          actions: [
            'Lister toutes les finalités de traitement',
            'Préciser les bases légales pour chaque finalité',
            'Indiquer les durées de conservation',
            'Détailler les droits des personnes et comment les exercer'
          ]
        }
      }
    ]
  },
  {
    id: 'procedure-droits',
    question: 'Avez-vous mis en place une procédure pour répondre aux demandes d\'exercice des droits ?',
    description: 'Accès, rectification, effacement, portabilité, opposition...',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Mettre en place une procédure de gestion des droits',
      description: 'Vous devez pouvoir répondre aux demandes dans un délai d\'un mois.',
      actions: [
        'Créer un formulaire de demande d\'exercice des droits',
        'Définir un processus de vérification d\'identité',
        'Former les équipes à identifier et traiter les demandes',
        'Mettre en place un suivi des demandes avec délais'
      ]
    },
    followUpQuestions: [
      {
        id: 'droits-delai',
        question: 'Répondez-vous aux demandes dans le délai légal d\'un mois ?',
        type: 'boolean',
        category: 'Droits des personnes',
        showIf: { questionId: 'procedure-droits', answer: true },
        riskIfNo: 'moyen'
      },
      {
        id: 'droits-registre',
        question: 'Tenez-vous un registre des demandes d\'exercice des droits ?',
        type: 'boolean',
        category: 'Droits des personnes',
        showIf: { questionId: 'procedure-droits', answer: true }
      }
    ]
  },
  {
    id: 'mesures-securite',
    question: 'Avez-vous mis en place des mesures de sécurité pour protéger les données personnelles ?',
    description: 'Mesures techniques et organisationnelles adaptées aux risques',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'partiellement_conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Mettre en place des mesures de sécurité',
      description: 'Les mesures doivent être adaptées aux risques identifiés.',
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
      },
      {
        id: 'securite-sauvegarde',
        question: 'Effectuez-vous des sauvegardes régulières ?',
        type: 'boolean',
        category: 'Sécurité',
        showIf: { questionId: 'mesures-securite', answer: true }
      }
    ]
  },
  {
    id: 'procedure-violation',
    question: 'Avez-vous une procédure de notification des violations de données ?',
    description: 'Notification à la CNIL dans les 72h selon l\'article 33 du RGPD',
    type: 'boolean',
    category: 'Violations de données',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Créer une procédure de gestion des violations',
      description: 'Vous devez notifier la CNIL dans les 72 heures suivant la découverte d\'une violation.',
      actions: [
        'Définir ce qui constitue une violation de données',
        'Établir une chaîne d\'alerte interne',
        'Préparer un modèle de notification CNIL',
        'Former les équipes à détecter et signaler les incidents'
      ],
      resources: [
        { label: 'Formulaire de notification CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    },
    followUpQuestions: [
      {
        id: 'violation-72h',
        question: 'La procédure permet-elle de notifier dans les 72h ?',
        type: 'boolean',
        category: 'Violations de données',
        showIf: { questionId: 'procedure-violation', answer: true }
      },
      {
        id: 'violation-registre',
        question: 'Tenez-vous un registre des violations ?',
        type: 'boolean',
        category: 'Violations de données',
        showIf: { questionId: 'procedure-violation', answer: true }
      }
    ]
  }
];

// ========================================
// Questions spécifiques aux secteurs de santé
// ========================================
const healthSectorQuestions: ConditionalQuestion[] = [
  {
    id: 'hebergement-hds',
    question: 'Les données de santé sont-elles hébergées chez un hébergeur certifié HDS ?',
    description: 'Obligation pour les données de santé hébergées par un tiers',
    type: 'boolean',
    category: 'Hébergement de données de santé',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: {
      ifYes: 'conforme',
      ifNo: 'non_conforme'
    },
    guidance: {
      title: 'Certification HDS obligatoire',
      description: 'L\'hébergement de données de santé par un tiers nécessite la certification HDS.',
      actions: [
        'Identifier tous les hébergeurs de données de santé',
        'Vérifier leur certification HDS',
        'Si non certifié, migrer vers un hébergeur HDS',
        'Mettre à jour les contrats de sous-traitance'
      ],
      resources: [
        { label: 'Liste des hébergeurs HDS certifiés', url: 'https://esante.gouv.fr/labels-certifications/hebergement-des-donnees-de-sante' }
      ]
    },
    followUpQuestions: [
      {
        id: 'hds-editeur',
        question: 'Quel est votre éditeur de logiciel métier ?',
        type: 'text',
        category: 'Hébergement de données de santé',
        showIf: { questionId: 'hebergement-hds', answer: true }
      },
      {
        id: 'hds-interne',
        question: 'Les données sont-elles hébergées en interne ?',
        type: 'boolean',
        category: 'Hébergement de données de santé',
        showIf: { questionId: 'hebergement-hds', answer: false },
        guidance: {
          title: 'Hébergement interne',
          description: 'Si vous hébergez les données en interne, la certification HDS n\'est pas obligatoire mais des mesures de sécurité renforcées sont nécessaires.',
          actions: [
            'Documenter les mesures de sécurité mises en place',
            'Réaliser des audits de sécurité réguliers',
            'Mettre en place des sauvegardes chiffrées'
          ]
        }
      }
    ]
  },
  {
    id: 'consentement-patients',
    question: 'Recueillez-vous le consentement des patients pour les traitements hors soins ?',
    description: 'Le consentement est requis pour les traitements non liés aux soins (recherche, marketing...)',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Gestion du consentement',
      description: 'Le consentement doit être libre, spécifique, éclairé et univoque.',
      actions: [
        'Identifier les traitements nécessitant un consentement',
        'Créer des formulaires de consentement clairs',
        'Documenter la preuve du consentement',
        'Permettre le retrait facile du consentement'
      ]
    },
    followUpQuestions: [
      {
        id: 'consentement-preuve',
        question: 'Conservez-vous une preuve du consentement ?',
        type: 'boolean',
        category: 'Consentement',
        showIf: { questionId: 'consentement-patients', answer: true }
      },
      {
        id: 'consentement-retrait',
        question: 'Les patients peuvent-ils retirer leur consentement facilement ?',
        type: 'boolean',
        category: 'Consentement',
        showIf: { questionId: 'consentement-patients', answer: true }
      }
    ]
  },
  {
    id: 'secret-medical',
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
// Questions spécifiques pharmacies - Audit RGPD complet (40 questions)
// ========================================

// Section 1: Gouvernance RGPD & Responsabilités (5 questions)
const pharmacyGovernanceQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-responsable-traitement',
    question: 'Avez-vous formalisé votre rôle de responsable de traitement et identifié vos sous-traitants ?',
    description: 'Croire que "le logiciel est conforme" suffit est une erreur. Vous restez responsable.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser votre responsabilité RGPD',
      description: 'En tant que pharmacien titulaire, vous êtes le responsable de traitement. Vous devez identifier tous vos sous-traitants.',
      actions: [
        'Documenter par écrit votre statut de responsable de traitement',
        'Lister tous les sous-traitants (éditeur LGO, grossiste, maintenance IT, expert-comptable)',
        'Vérifier l\'existence de contrats avec chaque sous-traitant',
        'Ne pas déléguer votre responsabilité à l\'éditeur logiciel'
      ],
      resources: [
        { label: 'Guide CNIL - Responsable de traitement', url: 'https://www.cnil.fr/fr/definition/responsable-de-traitement' }
      ]
    }
  },
  {
    id: 'pharma-registre-specifique',
    question: 'Tenez-vous un registre des traitements SPÉCIFIQUE à votre pharmacie (pas un modèle générique) ?',
    description: 'Un modèle standard ne reflète pas vos traitements réels. Le registre doit être personnalisé.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Créer un registre adapté à l\'officine',
      description: 'Le registre doit refléter VOS traitements réels, pas un modèle générique fourni par votre groupement.',
      actions: [
        'Partir du modèle CNIL et l\'adapter à votre officine',
        'Lister vos traitements réels : dispensation, préparations, carte fidélité, téléconsultation...',
        'Documenter chaque sous-traitant et les données échangées',
        'Prévoir une mise à jour au moins annuelle'
      ],
      resources: [
        { label: 'Modèle de registre CNIL', url: 'https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement' }
      ]
    }
  },
  {
    id: 'pharma-referent-rgpd',
    question: 'Avez-vous désigné un référent RGPD (même interne) avec des missions écrites ?',
    description: 'Une personne doit être responsable de la conformité RGPD avec des missions documentées.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Désigner un référent RGPD',
      description: 'Même sans obligation de DPO, un référent interne facilite la conformité au quotidien.',
      actions: [
        'Désigner une personne référente (titulaire ou adjoint)',
        'Documenter ses missions par écrit : veille, formation équipe, gestion demandes',
        'Prévoir du temps dédié pour cette fonction',
        'En cas de DPO externe mutualisé, formaliser la relation'
      ]
    }
  },
  {
    id: 'pharma-formation-salaries',
    question: 'Les salariés ont-ils reçu une information ou formation RGPD minimale (traçable) ?',
    description: 'La formation doit être documentée pour prouver la sensibilisation de l\'équipe.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Former l\'équipe officinale au RGPD',
      description: 'Chaque membre de l\'équipe manipule des données sensibles. La preuve de formation est essentielle.',
      actions: [
        'Organiser une session de sensibilisation RGPD (même courte)',
        'Documenter : date, participants, contenu, signature',
        'Rappeler les règles de confidentialité au comptoir',
        'Renouveler annuellement ou à l\'arrivée de nouveaux collaborateurs'
      ]
    },
    followUpQuestions: [
      {
        id: 'pharma-formation-contenu',
        question: 'La formation couvre-t-elle la confidentialité au comptoir et la gestion des données patients ?',
        type: 'boolean',
        category: 'Gouvernance RGPD',
        showIf: { questionId: 'pharma-formation-salaries', answer: true }
      }
    ]
  },
  {
    id: 'pharma-procedure-violation',
    question: 'Avez-vous une procédure écrite en cas de violation de données (ransomware, mail erroné, perte PC) ?',
    description: 'Une pharmacie est une cible. Savez-vous exactement qui fait quoi en cas de cyberattaque ?',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédure de gestion des violations',
      description: 'Notification CNIL obligatoire sous 72h. Sans procédure, vous perdrez un temps précieux.',
      actions: [
        'Rédiger une procédure simple : qui alerter, qui décide, qui notifie',
        'Inclure les contacts clés : CNIL, éditeur, prestataire IT, assurance cyber',
        'Préparer un modèle de notification CNIL pré-rempli',
        'Tester la procédure une fois par an (exercice)'
      ],
      resources: [
        { label: 'Formulaire notification CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  }
];

// Section 2: Données patients & pratiques officinales (8 questions)
const pharmacyPatientDataQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-donnees-collectees',
    question: 'Avez-vous identifié précisément les données patients collectées (santé, identité, contact, historique) ?',
    description: 'Savoir ce que vous collectez est le fondement de la conformité.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Cartographier les données patients',
      description: 'Listez toutes les catégories de données collectées dans votre officine.',
      actions: [
        'Identifier : identité, coordonnées, numéro sécu, données de santé, historique',
        'Vérifier les données collectées via le LGO, les fiches papier, les mails',
        'Documenter pour chaque type de donnée : source, finalité, durée'
      ]
    }
  },
  {
    id: 'pharma-minimisation',
    question: 'Toutes les données collectées sont-elles strictement nécessaires à l\'acte officinal ?',
    description: 'Ne collectez que ce qui est vraiment utile pour la dispensation et le suivi.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Appliquer le principe de minimisation',
      description: 'Le RGPD impose de ne collecter que les données nécessaires.',
      actions: [
        'Revoir les champs obligatoires dans votre LGO',
        'Supprimer les informations superflues (profession, situation familiale si non utile)',
        'Questionner chaque nouvelle donnée collectée : est-ce vraiment nécessaire ?'
      ]
    }
  },
  {
    id: 'pharma-durees-conservation',
    question: 'Les durées de conservation sont-elles définies et respectées (pas "par défaut") ?',
    description: 'Les données ne peuvent pas être conservées indéfiniment.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Définir les durées de conservation',
      description: 'Chaque type de donnée a une durée de conservation légale ou recommandée.',
      actions: [
        'Ordonnances classiques : 3 ans',
        'Ordonnances stupéfiants : 10 ans',
        'Historique client : durée de la relation + 3 ans',
        'Paramétrer la purge automatique dans le LGO si possible'
      ]
    }
  },
  {
    id: 'pharma-preparations-magistrales',
    question: 'Les préparations magistrales et données associées sont-elles traitées séparément ?',
    description: 'Les préparations impliquent des données de santé spécifiques nécessitant une attention particulière.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: false,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Gérer les données de préparations',
      description: 'Les préparations magistrales contiennent des informations médicales détaillées.',
      actions: [
        'Documenter le traitement spécifique des données de préparation',
        'Assurer la traçabilité réglementaire (ordonnancier)',
        'Sécuriser l\'accès à ces informations sensibles'
      ]
    }
  },
  {
    id: 'pharma-mineurs',
    question: 'Les données de patients mineurs sont-elles gérées avec des règles spécifiques ?',
    description: 'Les mineurs bénéficient de protections particulières.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: false,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Protection des données des mineurs',
      description: 'Les données des mineurs nécessitent une vigilance accrue.',
      actions: [
        'Vérifier l\'autorisation parentale si nécessaire',
        'Respecter la confidentialité vis-à-vis des parents pour certains actes (contraception)',
        'Documenter les règles appliquées'
      ]
    }
  },
  {
    id: 'pharma-impressions-securisees',
    question: 'Les impressions (ordonnances, duplicatas) sont-elles sécurisées et détruites correctement ?',
    description: 'Les documents papier sont souvent négligés mais contiennent des données sensibles.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Sécuriser les documents papier',
      description: 'Le papier reste un vecteur de fuite de données important.',
      actions: [
        'Ne pas laisser les impressions accessibles au public',
        'Récupérer immédiatement les documents imprimés',
        'Détruire par broyeur les documents périmés (pas à la poubelle)',
        'Former l\'équipe à ces bonnes pratiques'
      ]
    }
  },
  {
    id: 'pharma-ecrans-visibles',
    question: 'Les écrans sont-ils protégés de la vue du public au comptoir ?',
    description: 'Risque structurel de non-conformité si le public peut voir les écrans.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Protéger la visibilité des écrans',
      description: 'La confidentialité au comptoir est une obligation RGPD souvent négligée.',
      actions: [
        'Installer des filtres de confidentialité sur les écrans',
        'Orienter les écrans hors de la vue du public',
        'Configurer un verrouillage automatique rapide',
        'Réduire la taille des fenêtres affichant des données sensibles'
      ]
    }
  },
  {
    id: 'pharma-confidentialite-comptoir',
    question: 'Les discussions sensibles peuvent-elles être entendues par d\'autres clients ?',
    description: 'La confidentialité orale fait partie du secret professionnel.',
    type: 'boolean',
    category: 'Données patients',
    isCritical: true,
    riskIfNo: 'eleve',
    isInverted: true, // "Non" = conforme (les discussions NE PEUVENT PAS être entendues)
    guidance: {
      title: 'Assurer la confidentialité orale',
      description: 'Les conversations au comptoir doivent rester confidentielles.',
      actions: [
        'Aménager un espace de confidentialité si possible',
        'Former l\'équipe à baisser la voix pour les sujets sensibles',
        'Proposer de passer dans un espace isolé pour les discussions délicates',
        'Installer une signalétique rappelant la confidentialité'
      ]
    }
  }
];

// Section 3: Logiciels métier & éditeurs (6 questions)
const pharmacySoftwareQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-lgo-hds',
    question: 'Votre LGO (logiciel de gestion d\'officine) est-il certifié HDS ou conforme aux exigences santé ?',
    description: 'Mensonge courant : "l\'éditeur gère tout". Non, votre responsabilité reste engagée.',
    type: 'boolean',
    category: 'Logiciels métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Vérifier la certification HDS du LGO',
      description: 'L\'hébergement de données de santé par un tiers nécessite la certification HDS.',
      actions: [
        'Demander le certificat HDS à votre éditeur',
        'Vérifier la validité du certificat (date d\'expiration)',
        'S\'assurer que l\'hébergeur mentionné est bien certifié',
        'En cas de doute, contacter l\'ANS pour vérification'
      ],
      resources: [
        { label: 'Liste hébergeurs HDS', url: 'https://esante.gouv.fr/labels-certifications/hebergement-des-donnees-de-sante' }
      ]
    },
    followUpQuestions: [
      {
        id: 'pharma-lgo-editeur',
        question: 'Quel est votre éditeur LGO ?',
        type: 'text',
        category: 'Logiciels métier',
        showIf: { questionId: 'pharma-lgo-hds', answer: true }
      }
    ]
  },
  {
    id: 'pharma-contrat-editeur',
    question: 'Avez-vous un contrat de sous-traitance RGPD (DPA) signé avec l\'éditeur du logiciel ?',
    description: 'Le contrat doit formaliser les obligations RGPD de l\'éditeur.',
    type: 'boolean',
    category: 'Logiciels métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser la relation avec l\'éditeur',
      description: 'Un contrat de sous-traitance (article 28 RGPD) est obligatoire.',
      actions: [
        'Demander le DPA (Data Processing Agreement) à votre éditeur',
        'Vérifier les clauses : confidentialité, sécurité, notification violations',
        'S\'assurer qu\'il couvre les sous-traitants ultérieurs (cloud, hébergeur)',
        'Conserver une copie signée'
      ]
    }
  },
  {
    id: 'pharma-mises-a-jour',
    question: 'Les mises à jour de sécurité sont-elles automatiques et documentées ?',
    description: 'Les mises à jour corrigent des failles de sécurité critiques.',
    type: 'boolean',
    category: 'Logiciels métier',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Maintenir les logiciels à jour',
      description: 'Les mises à jour de sécurité sont essentielles contre les cyberattaques.',
      actions: [
        'Activer les mises à jour automatiques si possible',
        'Sinon, planifier des mises à jour régulières (hebdomadaires)',
        'Documenter les mises à jour effectuées',
        'Inclure le système d\'exploitation et les logiciels annexes'
      ]
    }
  },
  {
    id: 'pharma-acces-nominatifs',
    question: 'Les accès au logiciel sont-ils nominatifs (pas de compte partagé) ?',
    description: 'Un compte partagé empêche la traçabilité et l\'imputation des actions.',
    type: 'boolean',
    category: 'Logiciels métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Mettre en place des accès nominatifs',
      description: 'Chaque utilisateur doit avoir son propre identifiant.',
      actions: [
        'Créer un compte par collaborateur',
        'Supprimer tout compte générique ("comptoir1", "pharma")',
        'Désactiver les comptes des collaborateurs partis',
        'Changer les mots de passe régulièrement'
      ]
    }
  },
  {
    id: 'pharma-droits-roles',
    question: 'Les droits utilisateurs sont-ils limités selon le rôle (préparateur / pharmacien) ?',
    description: 'Un préparateur n\'a pas besoin des mêmes accès qu\'un pharmacien titulaire.',
    type: 'boolean',
    category: 'Logiciels métier',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Appliquer le principe du moindre privilège',
      description: 'Chaque utilisateur n\'accède qu\'aux données nécessaires à sa fonction.',
      actions: [
        'Définir des profils de droits par fonction',
        'Restreindre les exports pour les préparateurs',
        'Limiter l\'accès aux fonctions sensibles (stupéfiants, statistiques)',
        'Revoir les droits annuellement'
      ]
    }
  },
  {
    id: 'pharma-exports-controles',
    question: 'Les exports de données sont-ils contrôlés et tracés ?',
    description: 'Un export massif de données patients représente un risque majeur.',
    type: 'boolean',
    category: 'Logiciels métier',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Encadrer les exports de données',
      description: 'Les exports doivent être justifiés, limités et tracés.',
      actions: [
        'Limiter les droits d\'export aux utilisateurs autorisés',
        'Activer les logs d\'export dans le LGO',
        'Définir une procédure d\'autorisation pour les exports massifs',
        'Chiffrer les exports contenant des données sensibles'
      ]
    }
  }
];

// Section 4: Fournisseurs, grossistes, partenaires (6 questions)
const pharmacyPartnersQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-liste-fournisseurs',
    question: 'Avez-vous listé tous les fournisseurs ayant accès à des données (grossistes, maintenance, téléphonie, IT) ?',
    description: 'Faille majeure : accès technique permanent non contrôlé.',
    type: 'boolean',
    category: 'Fournisseurs & partenaires',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Inventorier les fournisseurs avec accès',
      description: 'Tout fournisseur accédant à vos données est un sous-traitant potentiel.',
      actions: [
        'Lister : éditeur LGO, grossistes, maintenance IT, téléphonie, alarme, vidéosurveillance',
        'Identifier les données accessibles par chacun',
        'Évaluer le niveau de risque de chaque fournisseur',
        'Mettre à jour la liste annuellement'
      ]
    }
  },
  {
    id: 'pharma-clauses-rgpd-fournisseurs',
    question: 'Existe-t-il des clauses RGPD écrites avec chaque fournisseur accédant aux données ?',
    description: 'Sans contrat, vous ne pouvez pas imposer d\'obligations à vos fournisseurs.',
    type: 'boolean',
    category: 'Fournisseurs & partenaires',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contractualiser avec les fournisseurs',
      description: 'L\'article 28 du RGPD impose un contrat écrit avec chaque sous-traitant.',
      actions: [
        'Demander les DPA à tous vos fournisseurs',
        'Pour les petits prestataires, ajouter une clause RGPD à vos contrats',
        'Vérifier les garanties de sécurité proposées',
        'Archiver tous les contrats signés'
      ]
    }
  },
  {
    id: 'pharma-grossistes-donnees',
    question: 'Les grossistes ont-ils accès à des données identifiantes patients ou uniquement à des flux produits ?',
    description: 'Vérifiez précisément ce que voient vos grossistes.',
    type: 'select',
    options: ['Flux produits uniquement', 'Données identifiantes patients', 'Je ne sais pas'],
    category: 'Fournisseurs & partenaires',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Analyser les flux vers les grossistes',
      description: 'Les transmissions aux grossistes doivent être limitées au strict nécessaire.',
      actions: [
        'Vérifier les données transmises dans les flux de commande',
        'S\'assurer que les données patients ne sont pas transmises inutilement',
        'Demander au grossiste une confirmation écrite des données reçues',
        'Désactiver les options de transmission non nécessaires'
      ]
    }
  },
  {
    id: 'pharma-interventions-techniques',
    question: 'Les interventions techniques (maintenance, SAV) sont-elles encadrées ?',
    description: 'Un technicien peut accéder à toutes vos données pendant une intervention.',
    type: 'boolean',
    category: 'Fournisseurs & partenaires',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Encadrer les interventions techniques',
      description: 'Les intervenants externes accèdent potentiellement à des données sensibles.',
      actions: [
        'Exiger une clause de confidentialité signée',
        'Superviser les interventions sur site quand possible',
        'Tracer les interventions (date, intervenant, actions)',
        'Limiter les accès à distance au strict nécessaire'
      ]
    }
  },
  {
    id: 'pharma-acces-temporaires',
    question: 'Les accès fournisseurs sont-ils temporaires et révoqués après intervention ?',
    description: 'Un accès permanent non surveillé est une faille de sécurité majeure.',
    type: 'boolean',
    category: 'Fournisseurs & partenaires',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Limiter la durée des accès externes',
      description: 'Les accès à distance doivent être temporaires et contrôlés.',
      actions: [
        'Créer des comptes temporaires pour les interventions',
        'Révoquer systématiquement après chaque intervention',
        'Préférer l\'intervention supervisée en direct',
        'Tenir un registre des accès accordés et révoqués'
      ]
    }
  },
  {
    id: 'pharma-evaluation-risques-prestataires',
    question: 'Avez-vous évalué le niveau de risque de chaque prestataire ?',
    description: 'Tous les prestataires ne présentent pas le même niveau de risque.',
    type: 'boolean',
    category: 'Fournisseurs & partenaires',
    isCritical: false,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Évaluer les risques prestataires',
      description: 'Une évaluation simple permet de prioriser les actions.',
      actions: [
        'Classer par niveau de risque : élevé (accès données santé), moyen, faible',
        'Prioriser la contractualisation avec les prestataires à risque élevé',
        'Vérifier les certifications (HDS, ISO 27001) des prestataires critiques',
        'Renouveler l\'évaluation annuellement'
      ]
    }
  }
];

// Section 5: Expert-comptable & données sociales (4 questions)
const pharmacyAccountantQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-donnees-comptable',
    question: 'Avez-vous identifié les données transmises à l\'expert-comptable (salariés, rémunérations, RIB) ?',
    description: 'L\'expert-comptable reçoit des données personnelles sensibles sur vos salariés.',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Cartographier les données vers le comptable',
      description: 'Identifiez précisément ce que vous transmettez.',
      actions: [
        'Lister : bulletins de paie, RIB, contrats, arrêts maladie, mutuelles',
        'Vérifier les canaux de transmission utilisés',
        'S\'assurer de la nécessité de chaque donnée transmise'
      ]
    }
  },
  {
    id: 'pharma-contrat-comptable',
    question: 'Existe-t-il un contrat de sous-traitance RGPD avec le cabinet comptable ?',
    description: 'Votre expert-comptable est un sous-traitant au sens du RGPD.',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contractualiser avec le cabinet comptable',
      description: 'Le cabinet comptable doit s\'engager sur le RGPD.',
      actions: [
        'Demander le DPA du cabinet (l\'Ordre a fourni des modèles)',
        'Vérifier les mesures de sécurité du cabinet',
        'S\'assurer de la confidentialité des collaborateurs du cabinet',
        'Conserver une copie du contrat signé'
      ]
    }
  },
  {
    id: 'pharma-echanges-securises-comptable',
    question: 'Les échanges avec le comptable se font-ils via mail sécurisé ou plateforme dédiée ?',
    description: 'Les bulletins de paie par mail classique sont une violation courante.',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Sécuriser les échanges comptables',
      description: 'Les données RH transitant par email sont exposées.',
      actions: [
        'Utiliser la plateforme sécurisée du cabinet si disponible',
        'À défaut, chiffrer les fichiers sensibles avant envoi',
        'Éviter l\'envoi de RIB ou bulletins par mail simple',
        'Supprimer les mails sensibles après traitement'
      ]
    }
  },
  {
    id: 'pharma-acces-paie',
    question: 'Les accès au logiciel de paie sont-ils restreints et tracés ?',
    description: 'Qui peut voir les salaires dans votre officine ?',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: false,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Restreindre l\'accès aux données de paie',
      description: 'Les informations salariales sont confidentielles.',
      actions: [
        'Limiter l\'accès au titulaire et au responsable RH',
        'Vérifier que le comptable n\'a pas créé d\'accès non autorisés',
        'S\'assurer de la traçabilité des accès si possible'
      ]
    }
  }
];

// Section 6: Mails patients & communication (4 questions)
const pharmacyEmailQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-mails-patients-sante',
    question: 'Recevez-vous des mails de patients contenant des données de santé ?',
    description: 'Point critique : le mail est souvent la première source de violation RGPD.',
    type: 'boolean',
    category: 'Mails & communication',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Analyser les flux mails patients',
      description: 'Les patients envoient facilement des ordonnances ou questions de santé par mail.',
      actions: [
        'Recenser les types de mails reçus des patients',
        'Évaluer la sensibilité des données reçues',
        'Définir une politique de traitement de ces mails'
      ]
    },
    followUpQuestions: [
      {
        id: 'pharma-mails-patients-types',
        question: 'Quels types de données recevez-vous par mail ?',
        type: 'select',
        options: ['Ordonnances', 'Questions de santé', 'Demandes administratives', 'Tous types'],
        category: 'Mails & communication',
        showIf: { questionId: 'pharma-mails-patients-sante', answer: true }
      }
    ]
  },
  {
    id: 'pharma-information-patients-mail',
    question: 'Les patients sont-ils informés de ne pas transmettre de données sensibles par mail classique ?',
    description: 'Le mail non chiffré n\'est pas adapté aux données de santé.',
    type: 'boolean',
    category: 'Mails & communication',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Informer les patients sur les risques du mail',
      description: 'Les patients ignorent souvent que le mail n\'est pas sécurisé.',
      actions: [
        'Afficher une mention sur votre site web',
        'Ajouter une mention dans les réponses automatiques',
        'Proposer une alternative sécurisée (messagerie santé, dépôt en officine)',
        'Former l\'équipe à relayer ce message'
      ]
    }
  },
  {
    id: 'pharma-adresse-professionnelle',
    question: 'Utilisez-vous une adresse mail professionnelle sécurisée (pas Gmail/Outlook perso) ?',
    description: 'Une adresse @gmail.com n\'inspire pas confiance et pose des problèmes RGPD.',
    type: 'boolean',
    category: 'Mails & communication',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Utiliser une messagerie professionnelle',
      description: 'La messagerie doit être professionnelle et hébergée en conformité.',
      actions: [
        'Utiliser un domaine professionnel (@mapharmacie.fr)',
        'Choisir un hébergeur respectant le RGPD (EU de préférence)',
        'Éviter les adresses personnelles gratuites',
        'Envisager une solution de messagerie sécurisée santé (MSSanté)'
      ]
    }
  },
  {
    id: 'pharma-politique-reponse-mail',
    question: 'Avez-vous une politique de réponse mail (contenu, délai, suppression) ?',
    description: 'Les mails s\'accumulent et ne sont jamais supprimés.',
    type: 'boolean',
    category: 'Mails & communication',
    isCritical: false,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Définir une politique mail',
      description: 'Les emails contenant des données doivent être gérés.',
      actions: [
        'Définir un délai de réponse standard',
        'Éviter d\'inclure des données sensibles dans les réponses',
        'Supprimer ou archiver les mails après traitement',
        'Ne pas conserver les pièces jointes sensibles indéfiniment'
      ]
    }
  }
];

// Section 7: Téléconsultation & services numériques (4 questions)
const pharmacyTeleconsultQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-teleconsultation',
    question: 'Proposez-vous ou facilitez-vous la téléconsultation en officine ?',
    description: 'La téléconsultation implique des obligations spécifiques.',
    type: 'boolean',
    category: 'Téléconsultation',
    isCritical: false,
    riskIfNo: 'faible',
    guidance: {
      title: 'Évaluer l\'activité téléconsultation',
      description: 'Si vous proposez la téléconsultation, des règles spécifiques s\'appliquent.',
      actions: [
        'Identifier si vous facilitez la téléconsultation (cabine, tablette)',
        'Recenser les solutions utilisées',
        'Évaluer votre niveau d\'implication (simple mise à disposition vs gestion active)'
      ]
    },
    followUpQuestions: [
      {
        id: 'pharma-teleconsult-solution',
        question: 'Quelle solution de téléconsultation utilisez-vous ?',
        type: 'text',
        category: 'Téléconsultation',
        showIf: { questionId: 'pharma-teleconsultation', answer: true }
      }
    ]
  },
  {
    id: 'pharma-teleconsult-hebergement',
    question: 'La solution utilisée est-elle hébergée en France/UE et conforme santé (HDS) ?',
    description: 'La téléconsultation implique des données de santé nécessitant un hébergement HDS.',
    type: 'boolean',
    category: 'Téléconsultation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Vérifier la conformité de la solution',
      description: 'La téléconsultation génère des données de santé sensibles.',
      actions: [
        'Demander la certification HDS de l\'éditeur',
        'Vérifier la localisation des serveurs (France/UE)',
        'S\'assurer du chiffrement de bout en bout',
        'Vérifier l\'agrément de la plateforme'
      ]
    }
  },
  {
    id: 'pharma-teleconsult-information',
    question: 'Les patients sont-ils informés clairement du traitement de leurs données en téléconsultation ?',
    description: 'L\'information doit être délivrée avant la téléconsultation.',
    type: 'boolean',
    category: 'Téléconsultation',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Informer les patients',
      description: 'Le patient doit comprendre ce qui se passe avec ses données.',
      actions: [
        'Afficher une information claire avant la téléconsultation',
        'Expliquer qui accède aux données (pharmacie, médecin, plateforme)',
        'Préciser les durées de conservation',
        'Indiquer les droits du patient'
      ]
    }
  },
  {
    id: 'pharma-teleconsult-suppression',
    question: 'Les sessions et données sont-elles supprimées automatiquement après usage ?',
    description: 'Les enregistrements ne doivent pas être conservés indéfiniment.',
    type: 'boolean',
    category: 'Téléconsultation',
    isCritical: false,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Gérer la conservation des sessions',
      description: 'Les données de téléconsultation ont une durée de vie limitée.',
      actions: [
        'Vérifier la politique de conservation de la plateforme',
        'S\'assurer de la suppression automatique des sessions',
        'Ne pas conserver d\'enregistrement local sauf nécessité',
        'Documenter les durées de conservation'
      ]
    }
  }
];

// Section 8: Accès à distance, sécurité & cyber (5 questions)
const pharmacySecurityQuestions: ConditionalQuestion[] = [
  {
    id: 'pharma-acces-distance',
    question: 'Existe-t-il des accès à distance au système (éditeur, maintenance, télétravail) ?',
    description: 'Réalité : une pharmacie est une cible, pas une exception.',
    type: 'boolean',
    category: 'Sécurité & cyber',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Inventorier les accès distants',
      description: 'Les accès à distance sont une porte d\'entrée pour les attaquants.',
      actions: [
        'Lister tous les accès distants existants',
        'Identifier qui les utilise : éditeur, maintenance, vous-même',
        'Évaluer la nécessité de chaque accès',
        'Supprimer les accès non utilisés'
      ]
    },
    followUpQuestions: [
      {
        id: 'pharma-acces-distance-types',
        question: 'Quels types d\'accès à distance existent ?',
        type: 'select',
        options: ['TeamViewer/AnyDesk', 'VPN', 'Bureau à distance RDP', 'Accès web éditeur', 'Plusieurs types'],
        category: 'Sécurité & cyber',
        showIf: { questionId: 'pharma-acces-distance', answer: true }
      }
    ]
  },
  {
    id: 'pharma-vpn-mfa',
    question: 'Ces accès sont-ils protégés par VPN, MFA (double authentification) ou équivalent ?',
    description: 'Un simple mot de passe ne suffit plus face aux attaques actuelles.',
    type: 'boolean',
    category: 'Sécurité & cyber',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Sécuriser les accès distants',
      description: 'La double authentification est devenue indispensable.',
      actions: [
        'Activer la MFA (authentification à deux facteurs) sur tous les accès',
        'Utiliser un VPN pour les connexions sensibles',
        'Éviter les outils grand public non sécurisés',
        'Former les utilisateurs à la sécurité des accès'
      ]
    }
  },
  {
    id: 'pharma-postes-securises',
    question: 'Les postes sont-ils chiffrés, protégés par mot de passe fort et verrouillage automatique ?',
    description: 'Un poste volé ou non verrouillé expose toutes vos données.',
    type: 'boolean',
    category: 'Sécurité & cyber',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécuriser les postes de travail',
      description: 'Chaque poste doit être protégé individuellement.',
      actions: [
        'Activer le chiffrement du disque (BitLocker, FileVault)',
        'Imposer des mots de passe complexes (12 caractères minimum)',
        'Configurer le verrouillage automatique (5 minutes max)',
        'Installer un antivirus à jour'
      ]
    }
  },
  {
    id: 'pharma-sauvegardes-testees',
    question: 'Avez-vous un plan de sauvegarde TESTÉ (pas juste "ça sauvegarde") ?',
    description: 'Une sauvegarde non testée est une fausse assurance.',
    type: 'boolean',
    category: 'Sécurité & cyber',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Tester les sauvegardes',
      description: 'Seul un test de restauration prouve que la sauvegarde fonctionne.',
      actions: [
        'Vérifier que les sauvegardes sont effectuées quotidiennement',
        'Tester une restauration au moins une fois par an',
        'Conserver des sauvegardes hors site (cloud ou autre local)',
        'Documenter les procédures de restauration'
      ]
    },
    followUpQuestions: [
      {
        id: 'pharma-sauvegarde-frequence',
        question: 'À quelle fréquence testez-vous la restauration ?',
        type: 'select',
        options: ['Jamais testé', 'Une fois par an', 'Plusieurs fois par an', 'Je ne sais pas'],
        category: 'Sécurité & cyber',
        showIf: { questionId: 'pharma-sauvegardes-testees', answer: true }
      }
    ]
  },
  {
    id: 'pharma-plan-cyberattaque',
    question: 'Savez-vous exactement qui fait quoi en cas de cyberattaque ?',
    description: 'Le jour de l\'attaque, il est trop tard pour improviser.',
    type: 'boolean',
    category: 'Sécurité & cyber',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Préparer la réponse aux incidents',
      description: 'Un plan de réponse permet de réagir efficacement.',
      actions: [
        'Rédiger une fiche réflexe "cyberattaque"',
        'Lister les contacts clés : prestataire IT, éditeur, CNIL, assurance',
        'Définir qui décide de déconnecter les systèmes',
        'Prévoir un mode dégradé pour continuer l\'activité',
        'Tester le plan une fois par an'
      ],
      resources: [
        { label: 'Guide ANSSI pour les PME', url: 'https://www.ssi.gouv.fr/entreprise/guide/la-cybersecurite-pour-les-tpe-pme-en-13-questions/' }
      ]
    }
  }
];

// ========================================
// Questions spécifiques assurances
// ========================================
const insuranceQuestions: ConditionalQuestion[] = [
  {
    id: 'lcb-ft',
    question: 'Appliquez-vous les obligations LCB-FT (lutte contre le blanchiment) ?',
    description: 'Vérification d\'identité et surveillance des opérations',
    type: 'boolean',
    category: 'Obligations légales',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Obligations LCB-FT',
      description: 'Les assureurs sont soumis aux obligations de vigilance.',
      actions: [
        'Mettre en place des procédures KYC (Know Your Customer)',
        'Former les équipes à la détection des opérations suspectes',
        'Déclarer les soupçons à TRACFIN',
        'Conserver les documents de vigilance'
      ]
    },
    followUpQuestions: [
      {
        id: 'lcb-formation',
        question: 'Les équipes sont-elles formées aux obligations LCB-FT ?',
        type: 'boolean',
        category: 'Obligations légales',
        showIf: { questionId: 'lcb-ft', answer: true }
      }
    ]
  },
  {
    id: 'profilage-decision',
    question: 'Utilisez-vous des systèmes de profilage ou de décision automatisée ?',
    description: 'Scoring, tarification automatique, détection de fraude...',
    type: 'boolean',
    category: 'Profilage',
    isCritical: true,
    riskIfNo: 'faible',
    guidance: {
      title: 'Encadrement du profilage',
      description: 'Le profilage doit être transparent et permettre une intervention humaine.',
      actions: [
        'Informer les assurés de l\'existence du profilage',
        'Permettre l\'intervention humaine dans les décisions',
        'Documenter la logique des algorithmes',
        'Réaliser une AIPD si profilage à grande échelle'
      ]
    },
    followUpQuestions: [
      {
        id: 'profilage-aipd',
        question: 'Avez-vous réalisé une AIPD pour ces traitements ?',
        type: 'boolean',
        category: 'Profilage',
        showIf: { questionId: 'profilage-decision', answer: true },
        isCritical: true,
        riskIfNo: 'eleve',
        guidance: {
          title: 'AIPD obligatoire',
          description: 'Une AIPD est obligatoire pour les traitements de profilage à grande échelle.',
          actions: [
            'Identifier les traitements nécessitant une AIPD',
            'Réaliser l\'analyse avec le DPO',
            'Consulter la CNIL si risques élevés résiduels',
            'Mettre en œuvre les mesures de mitigation'
          ]
        }
      },
      {
        id: 'profilage-transparence',
        question: 'Les assurés sont-ils informés des critères de profilage ?',
        type: 'boolean',
        category: 'Profilage',
        showIf: { questionId: 'profilage-decision', answer: true }
      }
    ]
  }
];

// ========================================
// Questions spécifiques médecins
// ========================================
// ========================================
// QUESTIONNAIRE AUDIT RGPD MÉDECIN - 40 QUESTIONS
// Structure : 8 sections opérationnelles
// ========================================

// Section 1: Gouvernance RGPD & responsabilités (5 questions)
const doctorGovernanceQuestions: ConditionalQuestion[] = [
  {
    id: 'med-responsable-traitement',
    question: 'Avez-vous formalisé votre rôle de responsable de traitement et identifié vos sous-traitants ?',
    description: 'Vous êtes responsable de tous les traitements de données patients dans votre cabinet.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser le rôle de responsable de traitement',
      description: 'En tant que médecin, vous êtes responsable de traitement au sens du RGPD pour toutes les données patients.',
      actions: [
        'Lister tous les sous-traitants : éditeur logiciel, hébergeur, labo d\'analyses, secrétariat externalisé',
        'Vérifier que des contrats de sous-traitance (DPA) existent avec chacun',
        'Documenter les flux de données vers chaque sous-traitant',
        'Tenir à jour cette cartographie annuellement'
      ],
      resources: [
        { label: 'Guide CNIL - Responsable de traitement', url: 'https://www.cnil.fr/fr/definition/responsable-de-traitement' }
      ]
    }
  },
  {
    id: 'med-registre-specifique',
    question: 'Tenez-vous un registre des traitements spécifique à votre cabinet (pas un modèle générique) ?',
    description: 'Le registre doit refléter vos traitements réels, pas un template standard.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Créer un registre personnalisé',
      description: 'Un registre générique ne reflète pas vos pratiques réelles et ne vous protège pas.',
      actions: [
        'Recenser VOS traitements : dossiers patients, comptabilité, RH, vidéosurveillance',
        'Pour chaque traitement : finalité, données, durée, destinataires, mesures de sécurité',
        'Inclure les traitements spécifiques : téléconsultation, correspondance confrères, labo',
        'Mettre à jour à chaque nouveau traitement ou changement significatif'
      ],
      resources: [
        { label: 'Modèle CNIL registre libéral', url: 'https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement' }
      ]
    },
    followUpQuestions: [
      {
        id: 'med-registre-maj',
        question: 'Le registre est-il mis à jour régulièrement (au moins annuellement) ?',
        type: 'boolean',
        category: 'Gouvernance RGPD',
        showIf: { questionId: 'med-registre-specifique', answer: true }
      }
    ]
  },
  {
    id: 'med-referent-rgpd',
    question: 'Avez-vous désigné un référent RGPD (vous-même ou un tiers) avec des missions écrites ?',
    description: 'Même sans DPO obligatoire, un référent doit être identifié.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Désigner un référent RGPD',
      description: 'Un cabinet libéral n\'a pas toujours l\'obligation de DPO, mais doit avoir un référent.',
      actions: [
        'Formaliser par écrit qui gère la conformité RGPD (souvent le praticien lui-même)',
        'Définir les missions : répondre aux droits, gérer les violations, former le personnel',
        'Si DPO externe : vérifier le contrat et la disponibilité',
        'Afficher les coordonnées du référent pour les patients'
      ]
    }
  },
  {
    id: 'med-formation-equipe',
    question: 'Votre équipe (secrétaire, assistant, remplaçant) a-t-elle reçu une sensibilisation RGPD traçable ?',
    description: 'Une formation non documentée n\'a pas de valeur probante.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Former et sensibiliser l\'équipe',
      description: 'Tout collaborateur manipulant des données patients doit être formé.',
      actions: [
        'Organiser une sensibilisation initiale (règles de confidentialité, mots de passe, incidents)',
        'Documenter : feuille d\'émargement, attestation de formation',
        'Rappeler les règles annuellement (réunion, email)',
        'Former spécifiquement les remplaçants avant leur prise de fonction'
      ]
    },
    followUpQuestions: [
      {
        id: 'med-formation-date',
        question: 'Quand a eu lieu la dernière formation ?',
        type: 'select',
        options: ['Moins de 1 an', '1 à 2 ans', 'Plus de 2 ans', 'Jamais'],
        category: 'Gouvernance RGPD',
        showIf: { questionId: 'med-formation-equipe', answer: true }
      }
    ]
  },
  {
    id: 'med-procedure-violation',
    question: 'Avez-vous une procédure écrite en cas de violation de données (vol PC, ransomware, mail erroné) ?',
    description: 'En cas de crise, il est trop tard pour improviser.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Préparer la gestion des violations',
      description: 'Une violation doit être notifiée à la CNIL sous 72h. Chaque minute compte.',
      actions: [
        'Rédiger une fiche réflexe : qui contacter, quoi faire, quoi ne pas faire',
        'Identifier les contacts d\'urgence : support IT, CNIL, Ordre',
        'Prévoir le modèle de notification CNIL et d\'information des patients',
        'Tester la procédure avec un scénario fictif'
      ],
      resources: [
        { label: 'Notification CNIL violation', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  }
];

// Section 2: Dossiers patients & pratiques médicales (8 questions)
const doctorPatientDataQuestions: ConditionalQuestion[] = [
  {
    id: 'med-donnees-collectees',
    question: 'Savez-vous exactement quelles données patients vous collectez (identité, santé, sociale, habitudes) ?',
    description: 'La première étape est de connaître précisément les données que vous traitez.',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Inventorier les données collectées',
      description: 'Vous devez pouvoir lister toutes les catégories de données que vous traitez.',
      actions: [
        'Lister : identité (nom, prénom, date naissance), coordonnées, NIR, données médicales',
        'Identifier les données sensibles : pathologies, traitements, allergies, données génétiques',
        'Vérifier les données collectées dans chaque formulaire et logiciel',
        'Supprimer les champs inutiles des formulaires'
      ]
    }
  },
  {
    id: 'med-minimisation',
    question: 'Toutes les données collectées sont-elles strictement nécessaires à la prise en charge médicale ?',
    description: 'Principe de minimisation : ne collecter que le nécessaire.',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Appliquer le principe de minimisation',
      description: 'Ne collectez que les données indispensables à votre exercice.',
      actions: [
        'Revoir vos formulaires d\'admission : supprimer les champs non essentiels',
        'Justifier chaque catégorie de données collectées',
        'Éviter de collecter des informations "au cas où"',
        'Adapter la collecte selon le type de consultation'
      ]
    }
  },
  {
    id: 'med-durees-conservation',
    question: 'Les durées de conservation des dossiers sont-elles définies et respectées ?',
    description: 'Dossier médical : 20 ans minimum après le dernier contact, mais des règles spécifiques existent.',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Appliquer les durées légales',
      description: 'Le dossier médical a des durées de conservation spécifiques et longues.',
      actions: [
        'Dossier médical adulte : 20 ans après le dernier passage',
        'Dossier patient mineur : jusqu\'à ses 28 ans minimum',
        'Documents comptables : 10 ans',
        'Mettre en place un calendrier de purge ou d\'archivage'
      ]
    }
  },
  {
    id: 'med-mineurs-regles',
    question: 'Appliquez-vous des règles spécifiques pour les données de patients mineurs ?',
    description: 'Les mineurs bénéficient de protections particulières (confidentialité vis-à-vis des parents, etc.).',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Protéger les données des mineurs',
      description: 'Les données de santé des mineurs nécessitent une attention particulière.',
      actions: [
        'Identifier les cas où le mineur peut demander la confidentialité (IVG, contraception)',
        'Adapter les durées de conservation (au moins jusqu\'à 28 ans)',
        'Gérer les accès des titulaires de l\'autorité parentale',
        'Documenter les demandes de confidentialité du mineur'
      ]
    }
  },
  {
    id: 'med-acces-dossier-patient',
    question: 'L\'accès aux dossiers patients est-il restreint aux seules personnes habilitées ?',
    description: 'Le personnel non médical ne doit pas pouvoir consulter les dossiers médicaux complets.',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Restreindre les accès aux dossiers',
      description: 'Seuls les professionnels de santé impliqués dans la prise en charge doivent accéder au dossier.',
      actions: [
        'Configurer des profils d\'accès différents (médecin / secrétaire)',
        'La secrétaire accède aux RDV et coordonnées, pas aux antécédents médicaux',
        'Tracer tous les accès aux dossiers (logs)',
        'Revoir les habilitations à chaque changement de personnel'
      ]
    }
  },
  {
    id: 'med-archivage-papier',
    question: 'Les dossiers papier (s\'il en existe) sont-ils sécurisés et leur destruction contrôlée ?',
    description: 'Un dossier papier non sécurisé est une fuite de données potentielle.',
    type: 'select',
    options: ['Pas de dossiers papier', 'Dossiers papier sécurisés (armoire fermée)', 'Dossiers papier non sécurisés'],
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Sécuriser les archives papier',
      description: 'Les dossiers papier restent soumis au RGPD et au secret médical.',
      actions: [
        'Stocker dans une armoire ou local fermé à clé',
        'Limiter les clés aux personnes habilitées',
        'Détruire par broyage sécurisé (pas à la poubelle)',
        'Conserver un registre des destructions'
      ]
    }
  },
  {
    id: 'med-confidentialite-cabinet',
    question: 'La confidentialité est-elle assurée au cabinet (écrans non visibles, conversations privées) ?',
    description: 'La salle d\'attente ne doit pas permettre d\'entendre les consultations.',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Assurer la confidentialité physique',
      description: 'Le secret médical s\'applique aussi à l\'aménagement du cabinet.',
      actions: [
        'Positionner les écrans hors de vue des patients en salle d\'attente',
        'Isoler phoniquement le bureau de consultation',
        'Éviter les appels téléphoniques nominatifs en salle d\'attente',
        'Former le personnel à la discrétion'
      ]
    }
  },
  {
    id: 'med-impressions-securisees',
    question: 'Les impressions contenant des données patients sont-elles sécurisées et détruites correctement ?',
    description: 'Une ordonnance oubliée sur l\'imprimante est une violation de données.',
    type: 'boolean',
    category: 'Dossiers patients',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Sécuriser les impressions',
      description: 'Les documents imprimés contiennent des données sensibles.',
      actions: [
        'Récupérer immédiatement les impressions',
        'Ne pas laisser de documents sur l\'imprimante',
        'Détruire par broyage (pas à la poubelle)',
        'Utiliser l\'impression sécurisée si disponible'
      ]
    }
  }
];

// Section 3: Logiciel métier & DMP (6 questions)
const doctorSoftwareQuestions: ConditionalQuestion[] = [
  {
    id: 'med-logiciel-hds',
    question: 'Votre logiciel médical est-il hébergé chez un hébergeur certifié HDS ?',
    description: 'L\'hébergement de données de santé par un tiers nécessite la certification HDS.',
    type: 'boolean',
    category: 'Logiciel métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Vérifier la certification HDS',
      description: 'Tout hébergement externalisé de données de santé doit être HDS.',
      actions: [
        'Demander le certificat HDS à votre éditeur ou hébergeur',
        'Vérifier la validité du certificat (date d\'expiration)',
        'Si logiciel local : l\'HDS ne s\'applique pas, mais la sécurité reste votre responsabilité',
        'En cas de cloud : l\'HDS est obligatoire'
      ],
      resources: [
        { label: 'Liste hébergeurs HDS - ANS', url: 'https://esante.gouv.fr/labels-certifications/hebergement-des-donnees-de-sante' }
      ]
    },
    followUpQuestions: [
      {
        id: 'med-logiciel-editeur',
        question: 'Quel est votre éditeur de logiciel médical ?',
        type: 'text',
        category: 'Logiciel métier',
        showIf: { questionId: 'med-logiciel-hds', answer: true }
      }
    ]
  },
  {
    id: 'med-contrat-editeur',
    question: 'Avez-vous un contrat de sous-traitance RGPD (DPA) signé avec l\'éditeur du logiciel ?',
    description: 'Sans contrat, l\'éditeur n\'a aucune obligation envers vous en cas de problème.',
    type: 'boolean',
    category: 'Logiciel métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contractualiser avec l\'éditeur',
      description: 'L\'article 28 RGPD impose un contrat écrit avec tout sous-traitant.',
      actions: [
        'Demander le DPA (Data Processing Agreement) à votre éditeur',
        'Vérifier qu\'il couvre : sécurité, confidentialité, notification des violations',
        'S\'assurer qu\'il mentionne les sous-traitants ultérieurs (cloud, maintenance)',
        'Archiver le contrat signé'
      ]
    }
  },
  {
    id: 'med-acces-nominatifs',
    question: 'Chaque utilisateur du logiciel a-t-il un compte personnel (pas de compte partagé) ?',
    description: 'Un compte partagé empêche toute traçabilité des actions.',
    type: 'boolean',
    category: 'Logiciel métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Individualiser les accès',
      description: 'Chaque personne doit avoir son propre identifiant.',
      actions: [
        'Créer un compte par utilisateur (médecin, secrétaire, remplaçant)',
        'Supprimer les comptes génériques ("accueil", "cabinet")',
        'Désactiver immédiatement les comptes des personnes parties',
        'Imposer des mots de passe forts et uniques'
      ]
    }
  },
  {
    id: 'med-mises-a-jour',
    question: 'Les mises à jour de sécurité du logiciel et du système sont-elles appliquées rapidement ?',
    description: 'Les failles non corrigées sont la porte d\'entrée des cyberattaques.',
    type: 'boolean',
    category: 'Logiciel métier',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Maintenir les systèmes à jour',
      description: 'Les mises à jour corrigent des vulnérabilités exploitées par les attaquants.',
      actions: [
        'Activer les mises à jour automatiques du logiciel métier',
        'Mettre à jour Windows/macOS dès que possible',
        'Mettre à jour l\'antivirus quotidiennement',
        'Documenter les mises à jour effectuées'
      ]
    }
  },
  {
    id: 'med-dmp-connexion',
    question: 'Êtes-vous connecté au Dossier Médical Partagé (DMP / Mon Espace Santé) ?',
    description: 'Le DMP facilite la coordination des soins et l\'accès à l\'historique patient.',
    type: 'boolean',
    category: 'Logiciel métier',
    isCritical: false,
    riskIfNo: 'faible',
    guidance: {
      title: 'Se connecter au DMP',
      description: 'Le DMP permet de partager les informations médicales avec le patient et les autres professionnels.',
      actions: [
        'Configurer l\'accès DMP dans votre logiciel métier',
        'Utiliser votre carte CPS pour l\'authentification',
        'Informer les patients de l\'alimentation de leur DMP',
        'Consulter le DMP avant chaque nouvelle prise en charge'
      ]
    }
  },
  {
    id: 'med-messagerie-securisee',
    question: 'Utilisez-vous une messagerie sécurisée de santé (MSSanté) pour les échanges entre confrères ?',
    description: 'Les échanges de données de santé par mail classique sont une violation du RGPD.',
    type: 'boolean',
    category: 'Logiciel métier',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Utiliser MSSanté',
      description: 'La messagerie sécurisée est obligatoire pour les échanges de données de santé.',
      actions: [
        'Activer MSSanté dans votre logiciel métier ou via le webmail',
        'Utiliser systématiquement MSSanté pour les correspondances médicales',
        'Ne jamais envoyer de données de santé par Gmail, Outlook ou Orange',
        'Former le secrétariat à l\'utilisation de MSSanté'
      ],
      resources: [
        { label: 'MSSanté - ANS', url: 'https://esante.gouv.fr/produits-services/mssante' }
      ]
    }
  }
];

// Section 4: Secrétariat & accueil patients (4 questions)
const doctorSecretaryQuestions: ConditionalQuestion[] = [
  {
    id: 'med-secretariat-formation',
    question: 'Le secrétariat (interne ou externalisé) est-il formé aux règles de confidentialité ?',
    description: 'Le secrétariat est le premier point de contact et manipule des données sensibles.',
    type: 'boolean',
    category: 'Secrétariat & accueil',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Former le secrétariat',
      description: 'Le personnel d\'accueil doit connaître les règles de confidentialité.',
      actions: [
        'Sensibiliser aux règles du secret médical',
        'Former à la gestion des appels (ne pas donner d\'information à des tiers)',
        'Expliquer les droits des patients (accès, rectification)',
        'Documenter la formation effectuée'
      ]
    }
  },
  {
    id: 'med-secretariat-externe-contrat',
    question: 'Si secrétariat externalisé : avez-vous un contrat de sous-traitance RGPD avec le prestataire ?',
    description: 'Un secrétariat téléphonique externe est un sous-traitant au sens du RGPD.',
    type: 'select',
    options: ['Secrétariat interne uniquement', 'Externe avec contrat RGPD', 'Externe sans contrat RGPD', 'Je ne sais pas'],
    category: 'Secrétariat & accueil',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Contractualiser avec le secrétariat externe',
      description: 'Les plateformes de secrétariat médical accèdent à des données de santé.',
      actions: [
        'Demander le contrat de sous-traitance RGPD au prestataire',
        'Vérifier que le prestataire est hébergeur HDS si nécessaire',
        'S\'assurer que les opérateurs sont formés et engagés à la confidentialité',
        'Prévoir une clause d\'audit'
      ]
    }
  },
  {
    id: 'med-rdv-en-ligne',
    question: 'Si prise de RDV en ligne : la plateforme est-elle conforme RGPD et HDS ?',
    description: 'Doctolib, Maiia, Keldoc... traitent des données de santé.',
    type: 'select',
    options: ['Pas de RDV en ligne', 'Plateforme conforme (Doctolib, Maiia...)', 'Autre plateforme - conformité vérifiée', 'Autre plateforme - conformité non vérifiée'],
    category: 'Secrétariat & accueil',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Vérifier la conformité de la plateforme RDV',
      description: 'Les plateformes de RDV traitent des données de santé et doivent être HDS.',
      actions: [
        'Vérifier la certification HDS de la plateforme',
        'Lire les conditions de sous-traitance proposées',
        'Configurer correctement les paramètres de confidentialité',
        'Informer les patients de l\'utilisation de la plateforme'
      ]
    }
  },
  {
    id: 'med-affichage-info-patients',
    question: 'L\'information RGPD est-elle affichée et/ou remise aux patients (mentions légales, droits) ?',
    description: 'Les patients doivent être informés du traitement de leurs données.',
    type: 'boolean',
    category: 'Secrétariat & accueil',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Informer les patients',
      description: 'L\'information est une obligation légale (articles 13-14 RGPD).',
      actions: [
        'Afficher une notice d\'information en salle d\'attente',
        'Intégrer les mentions sur le site web du cabinet',
        'Remettre une notice lors de la première consultation',
        'Inclure les mentions dans les formulaires de consentement'
      ]
    }
  }
];

// Section 5: Correspondants médicaux & laboratoires (5 questions)
const doctorPartnersQuestions: ConditionalQuestion[] = [
  {
    id: 'med-liste-correspondants',
    question: 'Avez-vous listé tous vos correspondants qui reçoivent des données patients (labos, spécialistes, hôpitaux) ?',
    description: 'Chaque destinataire de données est un maillon de la chaîne à sécuriser.',
    type: 'boolean',
    category: 'Correspondants & laboratoires',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Cartographier les flux de données',
      description: 'Vous devez savoir à qui vous transmettez des données patients.',
      actions: [
        'Lister : laboratoires d\'analyses, spécialistes, hôpitaux, centres d\'imagerie',
        'Identifier le mode de transmission (MSSanté, courrier, fax...)',
        'Vérifier que les correspondants utilisent des moyens sécurisés',
        'Mettre à jour la liste annuellement'
      ]
    }
  },
  {
    id: 'med-transmission-securisee',
    question: 'Les transmissions aux correspondants se font-elles via des canaux sécurisés (MSSanté, DMP) ?',
    description: 'Le fax et le mail classique ne sont pas sécurisés.',
    type: 'boolean',
    category: 'Correspondants & laboratoires',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécuriser les transmissions',
      description: 'Les données de santé ne doivent circuler que par des canaux sécurisés.',
      actions: [
        'Privilégier MSSanté pour les correspondances entre professionnels',
        'Utiliser le DMP pour le partage avec le patient et les autres PS',
        'Abandonner progressivement le fax (sauf obligation)',
        'Ne jamais envoyer de données de santé par mail classique'
      ]
    }
  },
  {
    id: 'med-labos-resultats',
    question: 'Les résultats de laboratoire sont-ils reçus de manière sécurisée (pas par mail classique) ?',
    description: 'Les résultats d\'analyses contiennent des données de santé très sensibles.',
    type: 'boolean',
    category: 'Correspondants & laboratoires',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Sécuriser la réception des résultats',
      description: 'Les résultats d\'analyses doivent être reçus via des canaux sécurisés.',
      actions: [
        'Demander aux laboratoires d\'utiliser MSSanté ou leur portail sécurisé',
        'Refuser les envois par mail classique non chiffré',
        'Configurer votre logiciel pour recevoir les résultats automatiquement',
        'Supprimer les résultats des boîtes mail non sécurisées après intégration'
      ]
    }
  },
  {
    id: 'med-interventions-techniques',
    question: 'Les interventions techniques (maintenance IT, support logiciel) sont-elles encadrées ?',
    description: 'Un technicien peut accéder à tous vos dossiers pendant une intervention.',
    type: 'boolean',
    category: 'Correspondants & laboratoires',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Encadrer les interventions techniques',
      description: 'Les prestataires techniques accèdent potentiellement à des données sensibles.',
      actions: [
        'Exiger un engagement de confidentialité signé',
        'Superviser les interventions sur site si possible',
        'Tracer les interventions (date, intervenant, actions réalisées)',
        'Limiter les accès à distance au strict nécessaire et les révoquer après'
      ]
    }
  },
  {
    id: 'med-sous-traitants-liste',
    question: 'Avez-vous une liste à jour de tous vos sous-traitants (IT, comptable, nettoyage si accès aux données) ?',
    description: 'Tout prestataire accédant à des données personnelles est un sous-traitant potentiel.',
    type: 'boolean',
    category: 'Correspondants & laboratoires',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Inventorier les sous-traitants',
      description: 'Vous devez connaître tous les tiers qui accèdent aux données.',
      actions: [
        'Lister : éditeur logiciel, hébergeur, maintenance IT, secrétariat externe, comptable',
        'Vérifier qu\'un contrat RGPD existe avec chacun',
        'Évaluer le niveau de risque de chaque prestataire',
        'Mettre à jour la liste à chaque changement de prestataire'
      ]
    }
  }
];

// Section 6: Expert-comptable & données sociales (4 questions)
const doctorAccountantQuestions: ConditionalQuestion[] = [
  {
    id: 'med-donnees-comptable',
    question: 'Savez-vous quelles données vous transmettez à l\'expert-comptable (salaires, RIB, identités) ?',
    description: 'L\'expert-comptable traite des données personnelles de vos employés.',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Inventorier les données transmises',
      description: 'L\'expert-comptable est un sous-traitant pour les données RH.',
      actions: [
        'Lister les données transmises : bulletins de paie, contrats, RIB, arrêts maladie',
        'Vérifier que seules les données nécessaires sont transmises',
        'S\'assurer que les données obsolètes sont supprimées',
        'Documenter les flux dans votre registre des traitements'
      ]
    }
  },
  {
    id: 'med-contrat-comptable',
    question: 'Avez-vous un contrat de sous-traitance RGPD avec votre cabinet comptable ?',
    description: 'L\'expert-comptable traite des données pour votre compte : un contrat est obligatoire.',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contractualiser avec le comptable',
      description: 'L\'article 28 RGPD impose un contrat écrit avec tout sous-traitant.',
      actions: [
        'Demander le contrat de sous-traitance RGPD à votre expert-comptable',
        'Vérifier les clauses : confidentialité, sécurité, restitution des données',
        'S\'assurer qu\'il couvre les données RH et comptables',
        'Archiver le contrat signé'
      ]
    }
  },
  {
    id: 'med-echanges-comptable-securises',
    question: 'Les échanges avec le comptable se font-ils via une plateforme sécurisée (pas de mail classique) ?',
    description: 'Les bulletins de paie et RIB ne doivent pas circuler par mail non sécurisé.',
    type: 'boolean',
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Sécuriser les échanges comptables',
      description: 'Les données RH sont des données personnelles sensibles.',
      actions: [
        'Utiliser la plateforme sécurisée du cabinet (la plupart en proposent)',
        'À défaut, chiffrer les pièces jointes sensibles',
        'Éviter l\'envoi de RIB et bulletins par mail classique',
        'Supprimer les données des boîtes mail après traitement'
      ]
    }
  },
  {
    id: 'med-acces-paie',
    question: 'Les accès au logiciel de paie (si géré en interne) sont-ils restreints et tracés ?',
    description: 'Le logiciel de paie contient des données très sensibles (salaires, NIR, RIB).',
    type: 'select',
    options: ['Paie gérée par le comptable', 'Paie interne - accès restreints et tracés', 'Paie interne - accès non contrôlés'],
    category: 'Expert-comptable',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Sécuriser l\'accès à la paie',
      description: 'Les données de paie sont parmi les plus sensibles.',
      actions: [
        'Limiter l\'accès aux seules personnes habilitées',
        'Utiliser des comptes nominatifs avec mots de passe forts',
        'Activer la traçabilité des accès si possible',
        'Revoir les habilitations annuellement'
      ]
    }
  }
];

// Section 7: Téléconsultation & e-santé (4 questions)
const doctorTeleconsultQuestions: ConditionalQuestion[] = [
  {
    id: 'med-teleconsultation',
    question: 'Pratiquez-vous la téléconsultation ?',
    description: 'La téléconsultation s\'est développée et pose des enjeux RGPD spécifiques.',
    type: 'boolean',
    category: 'Téléconsultation',
    isCritical: false,
    followUpQuestions: [
      {
        id: 'med-teleconsult-frequence',
        question: 'À quelle fréquence pratiquez-vous la téléconsultation ?',
        type: 'select',
        options: ['Occasionnellement', 'Régulièrement (plusieurs par semaine)', 'Quotidiennement'],
        category: 'Téléconsultation',
        showIf: { questionId: 'med-teleconsultation', answer: true }
      }
    ]
  },
  {
    id: 'med-teleconsult-plateforme',
    question: 'Si oui : la solution utilisée est-elle hébergée en France/UE et certifiée HDS ?',
    description: 'Doctolib Vidéo, Maiia, Qare... sont conformes. Zoom, Teams, WhatsApp ne le sont pas.',
    type: 'select',
    options: ['Pas de téléconsultation', 'Plateforme conforme (Doctolib, Maiia, Qare...)', 'Outil non conforme (Zoom, Teams, WhatsApp)', 'Je ne sais pas'],
    category: 'Téléconsultation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Utiliser une plateforme agréée',
      description: 'La téléconsultation doit être réalisée via des outils sécurisés et HDS.',
      actions: [
        'Utiliser uniquement des plateformes certifiées HDS',
        'Abandonner Zoom, Teams, WhatsApp, Skype pour les consultations',
        'Vérifier le chiffrement de bout en bout',
        'S\'assurer de l\'authentification du patient'
      ],
      resources: [
        { label: 'Téléconsultation - HAS', url: 'https://www.has-sante.fr/jcms/p_3118900/fr/teleconsultation' }
      ]
    }
  },
  {
    id: 'med-teleconsult-information',
    question: 'Les patients sont-ils informés du traitement de leurs données lors de la téléconsultation ?',
    description: 'L\'information doit être donnée avant la première téléconsultation.',
    type: 'boolean',
    category: 'Téléconsultation',
    isCritical: true,
    riskIfNo: 'moyen',
    guidance: {
      title: 'Informer les patients',
      description: 'L\'information est une obligation légale, y compris en téléconsultation.',
      actions: [
        'Remettre une notice d\'information spécifique à la téléconsultation',
        'Expliquer quelles données sont collectées et par qui',
        'Informer sur la conservation et les droits',
        'Recueillir le consentement si nécessaire'
      ]
    }
  },
  {
    id: 'med-teleconsult-conservation',
    question: 'Les enregistrements de téléconsultation (si effectués) sont-ils supprimés après usage ?',
    description: 'Conserver une vidéo de consultation pose des risques majeurs.',
    type: 'select',
    options: ['Pas d\'enregistrement', 'Enregistrements supprimés rapidement', 'Enregistrements conservés', 'Je ne sais pas'],
    category: 'Téléconsultation',
    isCritical: true,
    riskIfNo: 'eleve',
    guidance: {
      title: 'Gérer les enregistrements',
      description: 'Les enregistrements vidéo de consultations sont des données très sensibles.',
      actions: [
        'Éviter l\'enregistrement des téléconsultations sauf nécessité absolue',
        'Si enregistrement : informer le patient et obtenir son consentement',
        'Supprimer l\'enregistrement dès que possible',
        'Ne jamais stocker sur des clouds grand public'
      ]
    }
  }
];

// Section 8: Sécurité informatique & accès (5 questions)
const doctorSecurityQuestions: ConditionalQuestion[] = [
  {
    id: 'med-acces-distance',
    question: 'Existe-t-il des accès à distance à votre système (éditeur, maintenance, télétravail) ?',
    description: 'Un accès distant non contrôlé est une porte ouverte aux cyberattaques.',
    type: 'boolean',
    category: 'Sécurité informatique',
    isCritical: true,
    riskIfNo: 'eleve',
    followUpQuestions: [
      {
        id: 'med-acces-distance-qui',
        question: 'Qui dispose d\'un accès à distance ?',
        type: 'multiselect',
        options: ['Éditeur logiciel', 'Prestataire IT', 'Vous-même (télétravail)', 'Autre'],
        category: 'Sécurité informatique',
        showIf: { questionId: 'med-acces-distance', answer: true }
      }
    ],
    guidance: {
      title: 'Contrôler les accès à distance',
      description: 'Les accès distants doivent être sécurisés et tracés.',
      actions: [
        'Inventorier tous les accès à distance existants',
        'Vérifier qu\'ils sont protégés (VPN, MFA)',
        'Révoquer les accès non utilisés',
        'Tracer les connexions distantes'
      ]
    }
  },
  {
    id: 'med-vpn-mfa',
    question: 'Les accès à distance sont-ils protégés par VPN et/ou authentification forte (MFA) ?',
    description: 'Un simple mot de passe ne suffit pas pour sécuriser un accès distant.',
    type: 'boolean',
    category: 'Sécurité informatique',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécuriser les accès distants',
      description: 'VPN et MFA sont des protections essentielles.',
      actions: [
        'Mettre en place un VPN pour les accès à distance',
        'Activer l\'authentification à deux facteurs (MFA)',
        'Utiliser des mots de passe forts et uniques',
        'Changer les mots de passe après chaque départ de personnel'
      ]
    }
  },
  {
    id: 'med-postes-securises',
    question: 'Les postes de travail sont-ils chiffrés, protégés par mot de passe fort et verrouillage automatique ?',
    description: 'Un PC volé non chiffré = violation de données notifiable à la CNIL.',
    type: 'boolean',
    category: 'Sécurité informatique',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécuriser les postes de travail',
      description: 'Chaque poste doit être protégé contre le vol et l\'accès non autorisé.',
      actions: [
        'Activer le chiffrement du disque (BitLocker, FileVault)',
        'Imposer des mots de passe de session complexes',
        'Configurer le verrouillage automatique après 5 minutes',
        'Installer et maintenir un antivirus à jour'
      ]
    }
  },
  {
    id: 'med-sauvegardes-testees',
    question: 'Avez-vous un plan de sauvegarde testé (pas juste "ça sauvegarde") ?',
    description: 'Une sauvegarde non testée est une fausse sécurité.',
    type: 'boolean',
    category: 'Sécurité informatique',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Tester les sauvegardes',
      description: 'Une sauvegarde n\'a de valeur que si elle est restaurable.',
      actions: [
        'Vérifier que les sauvegardes s\'exécutent correctement',
        'Tester la restauration au moins une fois par an',
        'Conserver une copie hors site (cloud HDS ou site distant)',
        'Documenter la procédure de restauration'
      ]
    },
    followUpQuestions: [
      {
        id: 'med-sauvegarde-frequence',
        question: 'À quelle fréquence les sauvegardes sont-elles effectuées ?',
        type: 'select',
        options: ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Je ne sais pas'],
        category: 'Sécurité informatique',
        showIf: { questionId: 'med-sauvegardes-testees', answer: true }
      },
      {
        id: 'med-sauvegarde-test',
        question: 'Quand avez-vous testé une restauration pour la dernière fois ?',
        type: 'select',
        options: ['Moins de 6 mois', '6 mois à 1 an', 'Plus d\'1 an', 'Jamais'],
        category: 'Sécurité informatique',
        showIf: { questionId: 'med-sauvegardes-testees', answer: true }
      }
    ]
  },
  {
    id: 'med-plan-cyberattaque',
    question: 'Savez-vous exactement quoi faire en cas de cyberattaque (ransomware, intrusion) ?',
    description: 'En cas de crise, chaque minute compte. L\'improvisation coûte cher.',
    type: 'boolean',
    category: 'Sécurité informatique',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Préparer la réponse aux incidents',
      description: 'Un plan de réponse permet de réagir rapidement et efficacement.',
      actions: [
        'Rédiger une fiche réflexe : déconnecter les postes, appeler le support IT, ne pas payer',
        'Identifier les contacts d\'urgence (prestataire IT, CNIL, cybermalveillance.gouv.fr)',
        'Prévoir la notification CNIL sous 72h si données compromises',
        'Former l\'équipe aux bons réflexes'
      ],
      resources: [
        { label: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr/' },
        { label: 'Notification CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  }
];

// ========================================
// Questions spécifiques BIEN-ÊTRE - Audit RGPD complet (40 questions)
// ========================================

// Section 1: Gouvernance RGPD & Responsabilités (5 questions)
const wellnessGovernanceQuestions: ConditionalQuestion[] = [
  {
    id: 'be-responsable-traitement',
    question: 'Avez-vous conscience d\'être responsable de traitement pour les données de vos clients ?',
    description: 'Même en tant qu\'indépendant, vous êtes responsable des données que vous collectez.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Responsabilité RGPD du praticien',
      description: 'Tout professionnel du bien-être qui collecte des données est responsable de traitement.',
      actions: [
        'Comprendre vos obligations en tant que responsable de traitement',
        'Identifier toutes les données personnelles que vous collectez',
        'Documenter vos pratiques de traitement',
        'Désigner un point de contact pour les questions RGPD'
      ]
    }
  },
  {
    id: 'be-registre-traitements',
    question: 'Tenez-vous un registre des traitements adapté à votre activité ?',
    description: 'Liste des données collectées, finalités, durées de conservation.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Registre des traitements bien-être',
      description: 'Même simplifié, un registre est obligatoire pour tout professionnel.',
      actions: [
        'Lister les types de données collectées (identité, santé, préférences)',
        'Documenter les finalités (prise de RDV, suivi, facturation)',
        'Définir les durées de conservation',
        'Identifier les éventuels sous-traitants (logiciel RDV, comptable)'
      ],
      resources: [
        { label: 'Modèle CNIL registre simplifié', url: 'https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement' }
      ]
    }
  },
  {
    id: 'be-formation-rgpd',
    question: 'Vous êtes-vous formé aux bases du RGPD pour votre activité ?',
    description: 'Connaître les principes essentiels pour protéger vos clients.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formation RGPD praticien',
      description: 'Une formation de base vous permet de comprendre vos obligations.',
      actions: [
        'Suivre le MOOC CNIL "L\'atelier RGPD" (gratuit)',
        'Consulter les guides CNIL pour les TPE',
        'Rejoindre des groupes professionnels pour partager les bonnes pratiques',
        'Se tenir informé des évolutions réglementaires'
      ],
      resources: [
        { label: 'MOOC CNIL gratuit', url: 'https://atelier-rgpd.cnil.fr/' }
      ]
    }
  },
  {
    id: 'be-procedure-violation',
    question: 'Savez-vous quoi faire en cas de perte ou vol de données clients ?',
    description: 'Perte de téléphone, piratage : vous devez réagir rapidement.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Réaction aux violations de données',
      description: 'En cas de violation, vous avez 72h pour notifier la CNIL si risque pour les personnes.',
      actions: [
        'Connaître les signes d\'une violation (perte, vol, piratage)',
        'Savoir évaluer le risque pour vos clients',
        'Connaître la procédure de notification CNIL',
        'Informer les clients concernés si risque élevé'
      ],
      resources: [
        { label: 'Notification violations CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  },
  {
    id: 'be-assurance-cyber',
    question: 'Avez-vous une assurance couvrant les risques cyber et les données ?',
    description: 'Protection en cas de piratage, perte de données, réclamation client.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: false,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Assurance cyber praticien',
      description: 'Une assurance peut couvrir les conséquences d\'une violation de données.',
      actions: [
        'Vérifier si votre RC Pro couvre les risques numériques',
        'Considérer une assurance cyber spécifique',
        'Vérifier les garanties (notification, restauration, défense)',
        'Adapter la couverture à votre volume de données'
      ]
    }
  }
];

// Section 2: Données clients et fiches de suivi (6 questions)
const wellnessClientQuestions: ConditionalQuestion[] = [
  {
    id: 'be-types-donnees',
    question: 'Avez-vous identifié tous les types de données que vous collectez sur vos clients ?',
    description: 'Identité, coordonnées, historique de santé, préférences, contre-indications.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographie des données collectées',
      description: 'Identifiez précisément ce que vous collectez pour mieux le protéger.',
      actions: [
        'Lister toutes les informations demandées lors de la prise de RDV',
        'Identifier les données de la fiche de suivi/anamnèse',
        'Recenser les notes de séance',
        'Distinguer données administratives et données de santé'
      ]
    },
    followUpQuestions: [
      {
        id: 'be-donnees-sante',
        question: 'Collectez-vous des données de santé (pathologies, traitements, allergies) ?',
        type: 'boolean',
        category: 'Données clients',
        showIf: { questionId: 'be-types-donnees', answer: true },
        isCritical: true,
        riskIfNo: 'faible'
      }
    ]
  },
  {
    id: 'be-fiches-anamnese',
    question: 'Utilisez-vous des fiches d\'anamnèse ou questionnaires de santé ?',
    description: 'Questionnaire initial, bilan de première séance, antécédents.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Fiches d\'anamnèse et RGPD',
      description: 'Ces fiches contiennent souvent des données de santé sensibles.',
      actions: [
        'Limiter les questions au strict nécessaire pour la pratique',
        'Obtenir le consentement explicite pour les données de santé',
        'Sécuriser le stockage des fiches (papier ou numérique)',
        'Définir une durée de conservation adaptée'
      ]
    }
  },
  {
    id: 'be-minimisation',
    question: 'Limitez-vous la collecte aux données strictement nécessaires à votre pratique ?',
    description: 'Ne demandez pas plus que ce dont vous avez besoin.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Principe de minimisation',
      description: 'Collectez uniquement les données utiles à vos prestations.',
      actions: [
        'Revoir vos formulaires et supprimer les champs inutiles',
        'Justifier chaque donnée par une finalité précise',
        'Ne pas demander le numéro de sécurité sociale si non nécessaire',
        'Adapter la collecte selon le type de prestation'
      ]
    }
  },
  {
    id: 'be-conservation-durees',
    question: 'Avez-vous défini des durées de conservation pour les données clients ?',
    description: 'Les données ne doivent pas être gardées indéfiniment.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Durées de conservation bien-être',
      description: 'Définissez des durées proportionnées à vos besoins.',
      actions: [
        'Définir une durée pour les dossiers clients actifs',
        'Archiver ou supprimer après fin de la relation + délai (ex: 5 ans)',
        'Conserver les factures 10 ans (obligation comptable)',
        'Détruire ou anonymiser les données anciennes'
      ]
    }
  },
  {
    id: 'be-notes-seances',
    question: 'Les notes de séance sont-elles protégées et confidentielles ?',
    description: 'Observations, ressentis, évolutions : données sensibles.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Protection des notes de séance',
      description: 'Les notes peuvent contenir des informations très personnelles.',
      actions: [
        'Stocker les notes de manière sécurisée (armoire fermée, logiciel protégé)',
        'Limiter le contenu au strict nécessaire',
        'Ne pas inclure de jugements de valeur',
        'Permettre l\'accès du client à ses notes sur demande'
      ]
    }
  },
  {
    id: 'be-partage-donnees',
    question: 'Partagez-vous des données clients avec d\'autres praticiens ou professionnels ?',
    description: 'Réseau de praticiens, médecins traitants, autres thérapeutes.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Partage de données entre praticiens',
      description: 'Le partage de données de santé nécessite le consentement du client.',
      actions: [
        'Obtenir l\'accord explicite du client avant tout partage',
        'Limiter le partage aux informations nécessaires',
        'Sécuriser les transmissions (pas d\'email non chiffré)',
        'Documenter les partages effectués'
      ]
    }
  }
];

// Section 3: Consentement et information clients (5 questions)
const wellnessConsentQuestions: ConditionalQuestion[] = [
  {
    id: 'be-information-clients',
    question: 'Informez-vous vos clients sur l\'utilisation de leurs données ?',
    description: 'Information orale ou écrite sur ce que vous faites de leurs données.',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Information des clients',
      description: 'L\'information est obligatoire avant toute collecte de données.',
      actions: [
        'Rédiger une notice d\'information simple et claire',
        'L\'afficher dans votre cabinet ou la remettre aux clients',
        'Inclure : quelles données, pourquoi, combien de temps, leurs droits',
        'Mettre à disposition sur votre site web si vous en avez un'
      ]
    }
  },
  {
    id: 'be-consentement-sante',
    question: 'Recueillez-vous un consentement explicite pour les données de santé ?',
    description: 'Les données de santé nécessitent un consentement spécifique.',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Consentement données de santé',
      description: 'Le traitement de données de santé exige un consentement explicite.',
      actions: [
        'Créer un formulaire de consentement spécifique',
        'Expliquer clairement l\'utilisation des données de santé',
        'Faire signer le consentement (papier ou électronique)',
        'Conserver la preuve du consentement'
      ]
    }
  },
  {
    id: 'be-retrait-consentement',
    question: 'Vos clients peuvent-ils retirer leur consentement facilement ?',
    description: 'Le retrait doit être aussi simple que le don du consentement.',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Retrait du consentement',
      description: 'Le client doit pouvoir retirer son consentement à tout moment.',
      actions: [
        'Informer les clients de leur droit de retrait',
        'Prévoir un moyen simple de retirer le consentement',
        'Supprimer les données concernées en cas de retrait',
        'Ne pas pénaliser le client qui retire son consentement'
      ]
    }
  },
  {
    id: 'be-consentement-marketing',
    question: 'Si vous envoyez des communications marketing, avez-vous le consentement ?',
    description: 'Newsletters, offres promotionnelles, actualités.',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Consentement marketing',
      description: 'La prospection par email nécessite un consentement préalable (opt-in).',
      actions: [
        'Distinguer le consentement marketing du consentement pour les soins',
        'Proposer une case à cocher non pré-cochée',
        'Inclure un lien de désinscription dans chaque email',
        'Respecter les demandes de désinscription immédiatement'
      ]
    }
  },
  {
    id: 'be-mineurs',
    question: 'Si vous recevez des mineurs, recueillez-vous le consentement des parents ?',
    description: 'Autorisation parentale pour les moins de 15 ans.',
    type: 'boolean',
    category: 'Consentement',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Mineurs et consentement',
      description: 'Le consentement parental est requis pour les enfants de moins de 15 ans.',
      actions: [
        'Vérifier l\'âge des clients',
        'Recueillir l\'autorisation parentale pour les mineurs',
        'Adapter les formulaires pour les représentants légaux',
        'Conserver la preuve de l\'autorisation parentale'
      ]
    }
  }
];

// Section 4: Outils numériques et logiciels (5 questions)
const wellnessToolsQuestions: ConditionalQuestion[] = [
  {
    id: 'be-logiciel-rdv',
    question: 'Utilisez-vous un logiciel de prise de rendez-vous en ligne ?',
    description: 'Doctolib, Calendly, Planity, ou autre outil de réservation.',
    type: 'boolean',
    category: 'Outils numériques',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Logiciel de rendez-vous et RGPD',
      description: 'Ces logiciels sont des sous-traitants qui traitent les données de vos clients.',
      actions: [
        'Vérifier la conformité RGPD du logiciel choisi',
        'Lire les CGU et la politique de confidentialité',
        'S\'assurer que les données sont hébergées en Europe',
        'Informer vos clients de l\'utilisation de ce logiciel'
      ]
    },
    followUpQuestions: [
      {
        id: 'be-logiciel-contrat',
        question: 'Avez-vous vérifié les engagements RGPD de ce logiciel ?',
        type: 'boolean',
        category: 'Outils numériques',
        showIf: { questionId: 'be-logiciel-rdv', answer: true },
        isCritical: true,
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'be-logiciel-gestion',
    question: 'Utilisez-vous un logiciel de gestion de cabinet ou de fiches clients ?',
    description: 'CRM, logiciel métier, tableur avec données clients.',
    type: 'boolean',
    category: 'Outils numériques',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Logiciel de gestion et données',
      description: 'Votre logiciel de gestion contient des données sensibles sur vos clients.',
      actions: [
        'Choisir un logiciel conforme RGPD',
        'Sécuriser l\'accès par mot de passe fort',
        'Vérifier les options d\'export et de suppression',
        'S\'assurer des sauvegardes automatiques'
      ]
    }
  },
  {
    id: 'be-cloud-stockage',
    question: 'Stockez-vous des données clients dans le cloud (Google Drive, Dropbox, iCloud) ?',
    description: 'Fiches clients, photos, documents partagés.',
    type: 'boolean',
    category: 'Outils numériques',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Stockage cloud et RGPD',
      description: 'Le stockage cloud implique un transfert de données à un sous-traitant.',
      actions: [
        'Vérifier la localisation des serveurs (privilégier l\'Europe)',
        'Activer le chiffrement si disponible',
        'Utiliser un mot de passe fort et la double authentification',
        'Éviter les services non conformes pour les données de santé'
      ]
    }
  },
  {
    id: 'be-reseaux-sociaux',
    question: 'Utilisez-vous les réseaux sociaux pour votre activité professionnelle ?',
    description: 'Facebook, Instagram, LinkedIn pour promouvoir votre activité.',
    type: 'boolean',
    category: 'Outils numériques',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Réseaux sociaux et données clients',
      description: 'Attention à ne pas diffuser d\'informations sur vos clients.',
      actions: [
        'Ne jamais publier d\'informations identifiantes sur vos clients',
        'Obtenir un consentement écrit avant de publier des témoignages',
        'Ne pas discuter de cas clients en ligne',
        'Respecter le secret professionnel même en ligne'
      ]
    },
    followUpQuestions: [
      {
        id: 'be-temoignages',
        question: 'Si vous publiez des témoignages, avez-vous le consentement écrit ?',
        type: 'boolean',
        category: 'Outils numériques',
        showIf: { questionId: 'be-reseaux-sociaux', answer: true },
        isCritical: true,
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'be-site-web',
    question: 'Avez-vous un site web professionnel ?',
    description: 'Site vitrine, prise de RDV en ligne, formulaire de contact.',
    type: 'boolean',
    category: 'Outils numériques',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Site web et RGPD',
      description: 'Votre site web doit respecter les obligations RGPD.',
      actions: [
        'Publier une politique de confidentialité complète',
        'Afficher les mentions légales',
        'Mettre en place un bandeau cookies si nécessaire',
        'Sécuriser les formulaires de contact'
      ]
    }
  }
];

// Section 5: Sécurité des données (5 questions)
const wellnessSecurityQuestions: ConditionalQuestion[] = [
  {
    id: 'be-mots-de-passe',
    question: 'Utilisez-vous des mots de passe forts pour protéger vos données ?',
    description: 'Ordinateur, logiciels, email, cloud : tout doit être protégé.',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Mots de passe sécurisés',
      description: 'Les mots de passe sont la première ligne de défense.',
      actions: [
        'Utiliser des mots de passe d\'au moins 12 caractères',
        'Varier majuscules, minuscules, chiffres et symboles',
        'Utiliser un gestionnaire de mots de passe',
        'Activer la double authentification quand possible'
      ]
    }
  },
  {
    id: 'be-acces-ordinateur',
    question: 'Votre ordinateur et téléphone sont-ils verrouillés par mot de passe/code ?',
    description: 'Protection contre l\'accès non autorisé en cas de perte ou vol.',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Verrouillage des appareils',
      description: 'Vos appareils contiennent des données sensibles.',
      actions: [
        'Configurer un mot de passe ou code PIN',
        'Activer le verrouillage automatique après inactivité',
        'Activer la localisation/effacement à distance',
        'Chiffrer le disque dur si possible'
      ]
    }
  },
  {
    id: 'be-sauvegardes',
    question: 'Effectuez-vous des sauvegardes régulières de vos données clients ?',
    description: 'Protection contre la perte, le vol ou la panne.',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sauvegardes des données',
      description: 'Les sauvegardes vous protègent contre la perte de données.',
      actions: [
        'Sauvegarder régulièrement (au moins hebdomadaire)',
        'Stocker les sauvegardes dans un lieu différent',
        'Tester la restauration des sauvegardes',
        'Chiffrer les sauvegardes si elles contiennent des données sensibles'
      ]
    }
  },
  {
    id: 'be-antivirus',
    question: 'Votre ordinateur est-il protégé par un antivirus à jour ?',
    description: 'Protection contre les virus, ransomwares et logiciels malveillants.',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Protection antivirus',
      description: 'Un antivirus à jour protège contre les menaces courantes.',
      actions: [
        'Installer un antivirus reconnu (Windows Defender, Avast, etc.)',
        'Maintenir l\'antivirus à jour',
        'Effectuer des analyses régulières',
        'Ne pas désactiver les protections'
      ]
    }
  },
  {
    id: 'be-wifi-securise',
    question: 'Votre réseau WiFi est-il sécurisé par mot de passe ?',
    description: 'WiFi du cabinet ou de votre domicile si vous travaillez chez vous.',
    type: 'boolean',
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Sécurité WiFi',
      description: 'Un WiFi non sécurisé permet à des tiers d\'accéder à vos données.',
      actions: [
        'Configurer un mot de passe WiFi fort (WPA2 ou WPA3)',
        'Changer le mot de passe par défaut de la box',
        'Ne pas partager le mot de passe avec les clients',
        'Créer un réseau WiFi invité séparé si nécessaire'
      ]
    }
  }
];

// Section 6: Droits des clients (5 questions)
const wellnessRightsQuestions: ConditionalQuestion[] = [
  {
    id: 'be-droit-acces',
    question: 'Savez-vous répondre à une demande d\'accès aux données d\'un client ?',
    description: 'Le client peut demander une copie de toutes ses données.',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Droit d\'accès',
      description: 'Vous devez pouvoir fournir une copie des données dans un délai d\'un mois.',
      actions: [
        'Savoir où sont stockées toutes les données d\'un client',
        'Pouvoir extraire et transmettre ces données',
        'Répondre dans le délai d\'un mois',
        'Vérifier l\'identité du demandeur'
      ]
    }
  },
  {
    id: 'be-droit-rectification',
    question: 'Permettez-vous à vos clients de rectifier leurs données ?',
    description: 'Correction des erreurs, mise à jour des coordonnées.',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Droit de rectification',
      description: 'Les clients peuvent demander la correction de données inexactes.',
      actions: [
        'Informer les clients de leur droit de rectification',
        'Mettre à jour les données sur simple demande',
        'Corriger dans tous les systèmes où les données sont présentes',
        'Confirmer la rectification au client'
      ]
    }
  },
  {
    id: 'be-droit-effacement',
    question: 'Savez-vous comment supprimer les données d\'un client sur demande ?',
    description: 'Le "droit à l\'oubli" permet de demander l\'effacement de ses données.',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Droit à l\'effacement',
      description: 'Le client peut demander la suppression de ses données.',
      actions: [
        'Identifier toutes les données du client dans vos systèmes',
        'Supprimer les données (sauf obligations légales de conservation)',
        'Supprimer aussi chez vos sous-traitants',
        'Confirmer la suppression au client'
      ]
    }
  },
  {
    id: 'be-registre-demandes',
    question: 'Tenez-vous un registre des demandes d\'exercice des droits ?',
    description: 'Traçabilité des demandes et réponses apportées.',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Suivi des demandes',
      description: 'Un registre permet de prouver votre conformité.',
      actions: [
        'Noter chaque demande reçue (date, type, demandeur)',
        'Documenter la réponse apportée',
        'Respecter le délai d\'un mois',
        'Conserver ce registre pour démontrer votre conformité'
      ]
    }
  },
  {
    id: 'be-refus-justifie',
    question: 'Savez-vous dans quels cas vous pouvez refuser une demande ?',
    description: 'Certaines demandes peuvent être refusées pour motifs légitimes.',
    type: 'boolean',
    category: 'Droits des personnes',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Refus légitime',
      description: 'Certaines demandes peuvent être refusées (obligations légales, demandes excessives).',
      actions: [
        'Connaître les exceptions légales (obligations comptables, contentieux)',
        'Justifier le refus par écrit au demandeur',
        'Informer de la possibilité de réclamation auprès de la CNIL',
        'Documenter le refus dans votre registre'
      ]
    }
  }
];

// Section 7: Cabinet et confidentialité (5 questions)
const wellnessCabinetQuestions: ConditionalQuestion[] = [
  {
    id: 'be-confidentialite-cabinet',
    question: 'Votre cabinet garantit-il la confidentialité des échanges ?',
    description: 'Isolation phonique, attente séparée, discrétion à l\'accueil.',
    type: 'boolean',
    category: 'Confidentialité cabinet',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Confidentialité physique',
      description: 'L\'aménagement du cabinet doit préserver la confidentialité.',
      actions: [
        'Assurer une isolation phonique suffisante',
        'Éviter que les clients en attente entendent les échanges',
        'Ne pas laisser de dossiers clients visibles',
        'Organiser l\'accueil de manière discrète'
      ]
    }
  },
  {
    id: 'be-documents-papier',
    question: 'Les documents papier contenant des données clients sont-ils sécurisés ?',
    description: 'Fiches, factures, dossiers : stockage sécurisé.',
    type: 'boolean',
    category: 'Confidentialité cabinet',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécurité des documents papier',
      description: 'Les documents papier contenant des données doivent être protégés.',
      actions: [
        'Stocker les dossiers dans une armoire fermée à clé',
        'Ne pas laisser de documents sur le bureau après les séances',
        'Détruire les documents obsolètes (destructeur de documents)',
        'Limiter l\'accès aux personnes autorisées'
      ]
    }
  },
  {
    id: 'be-ecran-visible',
    question: 'Votre écran d\'ordinateur est-il protégé des regards indiscrets ?',
    description: 'Orientation de l\'écran, filtre de confidentialité.',
    type: 'boolean',
    category: 'Confidentialité cabinet',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Protection de l\'écran',
      description: 'Les données affichées ne doivent pas être visibles par les clients.',
      actions: [
        'Orienter l\'écran pour qu\'il ne soit pas visible par les clients',
        'Utiliser un filtre de confidentialité si nécessaire',
        'Verrouiller l\'écran quand vous vous éloignez',
        'Fermer les fenêtres contenant des données sensibles'
      ]
    }
  },
  {
    id: 'be-destruction-documents',
    question: 'Détruisez-vous correctement les documents contenant des données personnelles ?',
    description: 'Déchiquetage, destruction sécurisée.',
    type: 'boolean',
    category: 'Confidentialité cabinet',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Destruction sécurisée',
      description: 'Les documents ne doivent pas être jetés à la poubelle sans précaution.',
      actions: [
        'Utiliser un destructeur de documents (coupe croisée)',
        'Ne jamais jeter de documents intacts à la poubelle',
        'Détruire les supports numériques obsolètes de manière sécurisée',
        'Former le personnel à ces pratiques'
      ]
    }
  },
  {
    id: 'be-teletravail',
    question: 'Si vous travaillez à domicile, les données sont-elles protégées ?',
    description: 'Séparation vie privée/professionnelle, accès des proches.',
    type: 'boolean',
    category: 'Confidentialité cabinet',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Travail à domicile',
      description: 'Les données professionnelles doivent être protégées même à la maison.',
      actions: [
        'Séparer les données professionnelles des données personnelles',
        'Éviter que les proches accèdent aux données clients',
        'Verrouiller l\'ordinateur quand vous ne l\'utilisez pas',
        'Ranger les dossiers dans un espace dédié fermé'
      ]
    }
  }
];

// Section 8: Sous-traitants et partenaires (4 questions)
const wellnessPartnersQuestions: ConditionalQuestion[] = [
  {
    id: 'be-liste-sous-traitants',
    question: 'Avez-vous listé tous vos sous-traitants qui accèdent aux données ?',
    description: 'Logiciels, comptable, hébergeur web, plateforme RDV.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Identification des sous-traitants',
      description: 'Vous devez connaître tous ceux qui traitent des données pour vous.',
      actions: [
        'Lister tous les outils numériques utilisés',
        'Identifier votre comptable et ses accès aux données',
        'Recenser les plateformes de paiement en ligne',
        'Documenter cette liste dans votre registre'
      ]
    }
  },
  {
    id: 'be-comptable-rgpd',
    question: 'Votre expert-comptable respecte-t-il le RGPD pour vos données ?',
    description: 'Il accède à des données clients via les factures.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Comptable et RGPD',
      description: 'Votre comptable traite des données clients et doit être encadré.',
      actions: [
        'Vérifier que votre comptable a une politique RGPD',
        'Limiter les données transmises au strict nécessaire',
        'Sécuriser les échanges (portail sécurisé, pas d\'email non chiffré)',
        'S\'assurer qu\'il supprime les données après la mission'
      ]
    }
  },
  {
    id: 'be-hebergement-web',
    question: 'Si vous avez un site web, savez-vous où sont hébergées les données ?',
    description: 'Hébergeur, localisation des serveurs, sécurité.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Hébergement web',
      description: 'Les données collectées via votre site sont stockées chez votre hébergeur.',
      actions: [
        'Identifier votre hébergeur et la localisation des serveurs',
        'Privilégier un hébergeur européen',
        'Vérifier les engagements RGPD de l\'hébergeur',
        'Sécuriser l\'accès à l\'administration du site'
      ]
    }
  },
  {
    id: 'be-paiement-ligne',
    question: 'Si vous proposez le paiement en ligne, utilisez-vous un prestataire sécurisé ?',
    description: 'Stripe, PayPal, SumUp : ces outils traitent des données bancaires.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Paiement en ligne',
      description: 'Les prestataires de paiement traitent des données sensibles.',
      actions: [
        'Utiliser uniquement des prestataires reconnus et conformes PCI-DSS',
        'Ne jamais stocker vous-même les données bancaires',
        'Vérifier les engagements RGPD du prestataire',
        'Informer vos clients du prestataire utilisé'
      ]
    }
  }
];

// Variable vide pour compatibilité
const wellnessQuestions: ConditionalQuestion[] = [];

// ========================================
// Questions spécifiques TRANSPORT & LOGISTIQUE - Audit RGPD complet (40 questions)
// ========================================

// Section 1: Gouvernance RGPD & Responsabilités (5 questions)
const transportGovernanceQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-responsable-traitement',
    question: 'Avez-vous formalisé votre rôle de responsable de traitement et identifié vos partenaires ?',
    description: 'Donneurs d\'ordre, sous-traitants transport, affrétés : qui est responsable de quoi ?',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser les responsabilités RGPD',
      description: 'Dans le transport, la chaîne logistique implique de nombreux acteurs avec des responsabilités partagées.',
      actions: [
        'Documenter votre statut de responsable de traitement',
        'Clarifier les rôles avec donneurs d\'ordre et sous-traitants',
        'Distinguer données propres et données traitées pour le compte de clients',
        'Formaliser les relations contractuelles RGPD'
      ]
    }
  },
  {
    id: 'transp-registre-specifique',
    question: 'Tenez-vous un registre des traitements adapté au transport/logistique ?',
    description: 'Géolocalisation, chronotachygraphe, vidéosurveillance, données clients/marchandises.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Registre adapté au secteur transport',
      description: 'Le registre doit inclure les traitements spécifiques : géoloc, chrono, vidéo, TMS.',
      actions: [
        'Recenser tous les traitements métier (géoloc, TMS, WMS, chrono)',
        'Inclure les traitements RH spécifiques (permis, aptitude médicale)',
        'Documenter les bases légales (contrat, obligation légale, intérêt légitime)',
        'Mettre à jour lors de nouveaux équipements ou systèmes'
      ]
    }
  },
  {
    id: 'transp-referent-rgpd',
    question: 'Avez-vous désigné un référent ou DPO pour piloter la conformité RGPD ?',
    description: 'DPO obligatoire si surveillance systématique à grande échelle (géolocalisation).',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Référent ou DPO transport',
      description: 'Un DPO peut être obligatoire si vous géolocalisez systématiquement vos conducteurs.',
      actions: [
        'Évaluer si un DPO est obligatoire (géoloc à grande échelle)',
        'Désigner un référent RGPD au minimum',
        'Déclarer le DPO à la CNIL si désigné',
        'Associer le référent aux projets IT et RH'
      ]
    }
  },
  {
    id: 'transp-formation-personnel',
    question: 'Vos collaborateurs reçoivent-ils une formation RGPD adaptée à leurs fonctions ?',
    description: 'Exploitation, RH, commercial, IT : chaque métier a des besoins spécifiques.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formation RGPD métier',
      description: 'Conducteurs, exploitants et RH manipulent des données sensibles.',
      actions: [
        'Former les RH sur les données conducteurs (aptitude, permis)',
        'Sensibiliser l\'exploitation à la géolocalisation et ses limites',
        'Former le commercial sur les données clients',
        'Tracer les formations et prévoir des rappels annuels'
      ]
    }
  },
  {
    id: 'transp-procedure-violation',
    question: 'Avez-vous une procédure de notification des violations de données ?',
    description: 'Vol de données clients, cyberattaque, perte de terminal : réagir en 72h.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédure de notification des violations',
      description: 'En cas de violation, vous devez notifier la CNIL dans les 72h.',
      actions: [
        'Rédiger une procédure avec chaîne d\'alerte claire',
        'Inclure les scénarios transport (vol terminal, perte données client)',
        'Préparer des modèles de notification',
        'Former les exploitants à détecter et signaler les incidents'
      ]
    }
  }
];

// Section 2: Géolocalisation des véhicules et conducteurs (6 questions)
const transportGeolocQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-geoloc-existence',
    question: 'Utilisez-vous des systèmes de géolocalisation des véhicules ou conducteurs ?',
    description: 'GPS embarqué, tracking flotte, applications mobiles conducteurs.',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrement de la géolocalisation',
      description: 'La géolocalisation des salariés est strictement encadrée par la CNIL.',
      actions: [
        'Identifier tous les systèmes de géolocalisation en place',
        'Vérifier que les finalités sont légitimes',
        'S\'assurer du respect des droits des conducteurs',
        'Consulter les recommandations CNIL sur la géolocalisation'
      ],
      resources: [
        { label: 'Guide CNIL géolocalisation', url: 'https://www.cnil.fr/fr/la-geolocalisation-des-vehicules-de-salaries' }
      ]
    },
    followUpQuestions: [
      {
        id: 'transp-geoloc-types',
        question: 'Quels types de géolocalisation utilisez-vous ?',
        type: 'multiselect',
        options: ['GPS véhicule', 'Application mobile', 'Boîtier télématique', 'Chronotachygraphe connecté'],
        category: 'Géolocalisation',
        showIf: { questionId: 'transp-geoloc-existence', answer: true }
      }
    ]
  },
  {
    id: 'transp-geoloc-finalites',
    question: 'Les finalités de la géolocalisation sont-elles clairement définies et légitimes ?',
    description: 'Sécurité, optimisation tournées, facturation : pas de surveillance permanente du travail.',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Finalités légitimes de la géolocalisation',
      description: 'La CNIL n\'autorise que des finalités précises, pas la surveillance générale.',
      actions: [
        'Limiter aux finalités autorisées (sécurité, optimisation, preuve)',
        'Ne pas utiliser pour contrôler le temps de travail',
        'Documenter chaque finalité dans le registre',
        'Exclure le contrôle permanent des conducteurs'
      ]
    }
  },
  {
    id: 'transp-geoloc-information',
    question: 'Les conducteurs sont-ils informés individuellement de la géolocalisation ?',
    description: 'Information écrite préalable obligatoire, avec mentions RGPD complètes.',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Information obligatoire des conducteurs',
      description: 'Chaque conducteur doit être informé avant la mise en œuvre.',
      actions: [
        'Remettre une notice d\'information individuelle à chaque conducteur',
        'Inclure les mentions RGPD (finalités, droits, conservation)',
        'Faire signer un accusé de réception',
        'Informer les nouveaux embauchés dès l\'intégration'
      ]
    }
  },
  {
    id: 'transp-geoloc-cse',
    question: 'Avez-vous consulté le CSE avant la mise en place de la géolocalisation ?',
    description: 'Consultation obligatoire car dispositif de contrôle de l\'activité des salariés.',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Consultation du CSE',
      description: 'La géolocalisation est un dispositif de contrôle : le CSE doit être consulté.',
      actions: [
        'Organiser une réunion d\'information/consultation du CSE',
        'Présenter le dispositif, les finalités et les garanties',
        'Recueillir l\'avis du CSE (même s\'il n\'est pas contraignant)',
        'Conserver le PV de la réunion'
      ]
    }
  },
  {
    id: 'transp-geoloc-desactivation',
    question: 'Les conducteurs peuvent-ils désactiver la géolocalisation hors temps de travail ?',
    description: 'Véhicules de fonction utilisés à titre privé : la géoloc ne doit pas fonctionner.',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Désactivation hors travail',
      description: 'Si le véhicule est utilisé hors temps de travail, la géoloc doit pouvoir être coupée.',
      actions: [
        'Permettre la désactivation technique (bouton, application)',
        'Informer les conducteurs de cette possibilité',
        'Ne pas sanctionner l\'utilisation de cette fonction',
        'Vérifier que la désactivation est effective'
      ]
    }
  },
  {
    id: 'transp-geoloc-conservation',
    question: 'Les données de géolocalisation sont-elles conservées pour une durée limitée ?',
    description: 'Conservation maximale de 2 mois selon la CNIL, sauf obligations légales.',
    type: 'boolean',
    category: 'Géolocalisation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Durée de conservation géoloc',
      description: 'La CNIL recommande une conservation maximale de 2 mois pour les données brutes.',
      actions: [
        'Configurer le système pour purger après 2 mois',
        'Conserver plus longtemps uniquement si obligation légale ou litige',
        'Anonymiser les données pour les statistiques long terme',
        'Documenter les durées dans le registre'
      ]
    }
  }
];

// Section 3: Chronotachygraphe et temps de conduite (4 questions)
const transportChronoQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-chrono-telechargement',
    question: 'Téléchargez-vous régulièrement les données chronotachygraphe (véhicule et carte) ?',
    description: 'Obligation réglementaire : 90 jours max pour le véhicule, 28 jours pour la carte.',
    type: 'boolean',
    category: 'Chronotachygraphe',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Téléchargement des données chrono',
      description: 'Le téléchargement régulier est une obligation de la réglementation sociale.',
      actions: [
        'Organiser le téléchargement régulier des VU et cartes',
        'Respecter les délais : 90 jours véhicule, 28 jours carte',
        'Utiliser un logiciel de gestion agréé',
        'Former les exploitants au processus'
      ]
    }
  },
  {
    id: 'transp-chrono-conservation',
    question: 'Conservez-vous les données chronotachygraphe pendant les durées légales ?',
    description: 'Conservation obligatoire : 1 an minimum selon le règlement européen.',
    type: 'boolean',
    category: 'Chronotachygraphe',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Conservation des données chrono',
      description: 'Le règlement européen impose une conservation d\'un an minimum.',
      actions: [
        'Configurer l\'archivage pour au moins 1 an',
        'Sécuriser l\'accès aux données archivées',
        'Prévoir une conservation plus longue en cas de litige',
        'Supprimer les données au-delà des durées justifiées'
      ]
    }
  },
  {
    id: 'transp-chrono-acces',
    question: 'L\'accès aux données chronotachygraphe est-il limité aux personnes habilitées ?',
    description: 'Seuls les exploitants et RH concernés doivent y accéder.',
    type: 'boolean',
    category: 'Chronotachygraphe',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Accès restreint aux données chrono',
      description: 'Les données de temps de conduite sont sensibles et doivent être protégées.',
      actions: [
        'Définir les profils autorisés à accéder aux données',
        'Mettre en place des comptes nominatifs sur le logiciel',
        'Tracer les accès et consultations',
        'Révoquer les accès des personnes ne les nécessitant plus'
      ]
    }
  },
  {
    id: 'transp-chrono-droits',
    question: 'Les conducteurs peuvent-ils exercer leur droit d\'accès à leurs données chrono ?',
    description: 'Chaque conducteur a le droit d\'obtenir une copie de ses données.',
    type: 'boolean',
    category: 'Chronotachygraphe',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Droit d\'accès aux données chrono',
      description: 'Les conducteurs peuvent demander l\'accès à leurs propres données.',
      actions: [
        'Informer les conducteurs de leur droit d\'accès',
        'Mettre en place une procédure de demande simple',
        'Répondre dans le délai d\'un mois',
        'Fournir les données dans un format lisible'
      ]
    }
  }
];

// Section 4: Vidéosurveillance et caméras embarquées (5 questions)
const transportVideoQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-video-entrepots',
    question: 'Avez-vous de la vidéosurveillance dans vos entrepôts et locaux ?',
    description: 'Sécurité des marchandises, accès aux zones sensibles.',
    type: 'boolean',
    category: 'Vidéosurveillance',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Vidéosurveillance des locaux',
      description: 'La vidéosurveillance doit respecter les droits des salariés et visiteurs.',
      actions: [
        'Déclarer le dispositif à la préfecture si lieu ouvert au public',
        'Informer par affichage à l\'entrée des zones',
        'Consulter le CSE avant installation',
        'Ne pas filmer les zones de repos ou vestiaires'
      ]
    },
    followUpQuestions: [
      {
        id: 'transp-video-affichage',
        question: 'Un affichage informant de la vidéosurveillance est-il en place ?',
        type: 'boolean',
        category: 'Vidéosurveillance',
        showIf: { questionId: 'transp-video-entrepots', answer: true },
        isCritical: true,
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'transp-video-embarquee',
    question: 'Avez-vous des caméras embarquées dans les véhicules (dashcam, recul) ?',
    description: 'Caméras orientées vers l\'extérieur ou filmant l\'habitacle.',
    type: 'boolean',
    category: 'Vidéosurveillance',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Caméras embarquées',
      description: 'Les dashcams et caméras doivent respecter la vie privée des conducteurs.',
      actions: [
        'Définir une finalité précise (sécurité, preuve en cas d\'accident)',
        'Ne pas filmer en permanence le conducteur',
        'Informer le conducteur de la présence de caméra',
        'Limiter la conservation à quelques jours'
      ]
    },
    followUpQuestions: [
      {
        id: 'transp-video-habitacle',
        question: 'Les caméras filment-elles l\'habitacle et le conducteur ?',
        type: 'boolean',
        category: 'Vidéosurveillance',
        showIf: { questionId: 'transp-video-embarquee', answer: true },
        isCritical: true,
        riskIfNo: 'faible',
        guidance: {
          title: 'Caméra orientée conducteur',
          description: 'Filmer le conducteur est très encadré et rarement justifié.',
          actions: [
            'Éviter sauf raison de sécurité impérieuse',
            'Ne pas filmer en continu',
            'Informer le conducteur et le CSE',
            'Réaliser une AIPD'
          ]
        }
      }
    ]
  },
  {
    id: 'transp-video-conservation',
    question: 'Les images sont-elles conservées pour une durée limitée (30 jours max) ?',
    description: 'La CNIL recommande un mois maximum, sauf incident.',
    type: 'boolean',
    category: 'Vidéosurveillance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Conservation des images',
      description: 'Les images doivent être supprimées rapidement sauf incident.',
      actions: [
        'Configurer la suppression automatique après 30 jours',
        'Extraire et conserver uniquement en cas d\'incident',
        'Sécuriser l\'accès aux enregistrements',
        'Documenter les durées dans le registre'
      ]
    }
  },
  {
    id: 'transp-video-acces',
    question: 'L\'accès aux images est-il strictement limité aux personnes habilitées ?',
    description: 'Seules quelques personnes identifiées doivent pouvoir visionner.',
    type: 'boolean',
    category: 'Vidéosurveillance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Accès restreint aux images',
      description: 'Limiter l\'accès évite les abus et protège la vie privée.',
      actions: [
        'Définir une liste limitative de personnes habilitées',
        'Mettre en place des mots de passe individuels',
        'Tracer tous les accès au système',
        'Interdire la diffusion des images'
      ]
    }
  },
  {
    id: 'transp-video-cse',
    question: 'Le CSE a-t-il été consulté sur les dispositifs de vidéosurveillance ?',
    description: 'Consultation obligatoire car dispositif pouvant contrôler l\'activité.',
    type: 'boolean',
    category: 'Vidéosurveillance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Consultation CSE vidéosurveillance',
      description: 'Le CSE doit être consulté avant tout dispositif de contrôle.',
      actions: [
        'Présenter le dispositif au CSE avant installation',
        'Expliquer les finalités et les garanties',
        'Recueillir l\'avis (même non contraignant)',
        'Conserver le PV de réunion'
      ]
    }
  }
];

// Section 5: Données clients et marchandises (5 questions)
const transportClientQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-donnees-clients',
    question: 'Avez-vous cartographié les données clients/donneurs d\'ordre que vous traitez ?',
    description: 'Contacts, adresses livraison, informations marchandises, historique.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographie données clients',
      description: 'Identifiez toutes les données clients circulant dans vos systèmes.',
      actions: [
        'Recenser les données dans TMS, CRM, facturation',
        'Identifier les données des destinataires (livraison B2C)',
        'Documenter les sources et les flux de données',
        'Distinguer vos données propres et celles des donneurs d\'ordre'
      ]
    }
  },
  {
    id: 'transp-information-clients',
    question: 'Informez-vous les clients/destinataires sur le traitement de leurs données ?',
    description: 'Mentions sur devis, CGV, avis de passage, site web.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Information des clients',
      description: 'Les personnes dont vous traitez les données doivent être informées.',
      actions: [
        'Inclure une mention RGPD dans les CGV',
        'Publier une politique de confidentialité sur le site',
        'Informer les destinataires finaux (B2C) via avis de passage',
        'Mettre à disposition les coordonnées du référent RGPD'
      ]
    }
  },
  {
    id: 'transp-donnees-marchandises',
    question: 'Les informations sur les marchandises sont-elles traitées de manière sécurisée ?',
    description: 'Nature, valeur, caractéristiques : données commercialement sensibles.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Sécurité des données marchandises',
      description: 'Les informations sur les cargaisons peuvent être sensibles commercialement.',
      actions: [
        'Limiter l\'accès aux informations marchandises',
        'Sécuriser les échanges avec les clients (portail, emails)',
        'Ne pas divulguer les informations à des tiers non autorisés',
        'Respecter les clauses de confidentialité contractuelles'
      ]
    }
  },
  {
    id: 'transp-conservation-clients',
    question: 'Avez-vous défini des durées de conservation pour les données clients ?',
    description: 'Prescription commerciale, obligations comptables, litiges.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Durées de conservation clients',
      description: 'Les données ne doivent pas être conservées indéfiniment.',
      actions: [
        'Définir des durées par type de donnée',
        'Prendre en compte la prescription (5 ans commercial, 10 ans comptable)',
        'Archiver ou supprimer les données anciennes',
        'Documenter dans le registre des traitements'
      ]
    }
  },
  {
    id: 'transp-sous-traitance-donnees',
    question: 'Clarifiez-vous avec vos donneurs d\'ordre qui est responsable des données ?',
    description: 'Transport pour compte de tiers : êtes-vous sous-traitant ou responsable conjoint ?',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Responsabilité partagée',
      description: 'Clarifiez qui est responsable des données dans chaque relation.',
      actions: [
        'Analyser votre rôle pour chaque donneur d\'ordre',
        'Formaliser par contrat (sous-traitance art. 28 ou co-responsabilité)',
        'Définir les instructions de traitement',
        'Prévoir les obligations en cas de violation'
      ]
    }
  }
];

// Section 6: Données RH et conducteurs (5 questions)
const transportRHQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-dossiers-conducteurs',
    question: 'Les dossiers conducteurs sont-ils complets et sécurisés ?',
    description: 'Permis, FIMO/FCO, aptitude médicale, carte conducteur.',
    type: 'boolean',
    category: 'Données RH',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Dossiers conducteurs',
      description: 'Les dossiers contiennent des données réglementaires et parfois sensibles.',
      actions: [
        'Vérifier la complétude des dossiers (permis, formations, aptitude)',
        'Sécuriser l\'accès aux dossiers papier et numériques',
        'Mettre en place un suivi des échéances (renouvellement permis, visite médicale)',
        'Limiter l\'accès aux RH et responsables concernés'
      ]
    }
  },
  {
    id: 'transp-aptitude-medicale',
    question: 'Les données d\'aptitude médicale sont-elles traitées de manière confidentielle ?',
    description: 'Avis d\'aptitude uniquement, pas de diagnostic médical.',
    type: 'boolean',
    category: 'Données RH',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Confidentialité aptitude médicale',
      description: 'Vous ne devez connaître que l\'aptitude, pas les raisons médicales.',
      actions: [
        'Ne conserver que l\'avis d\'aptitude, pas les détails médicaux',
        'Sécuriser les documents médicaux (armoire fermée, accès restreint)',
        'Ne pas demander le diagnostic au médecin du travail',
        'Respecter le secret médical'
      ]
    }
  },
  {
    id: 'transp-infractions-permis',
    question: 'Comment gérez-vous les informations sur les infractions et retraits de points ?',
    description: 'Le solde de points est une donnée sensible que vous n\'avez pas à connaître.',
    type: 'boolean',
    category: 'Données RH',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Infractions et points',
      description: 'Vous pouvez demander la validité du permis, pas le solde de points.',
      actions: [
        'Ne pas demander le relevé intégral des points',
        'Vérifier uniquement la validité du permis',
        'Traiter les infractions professionnelles selon les procédures légales',
        'Ne pas sanctionner sur la base du solde de points'
      ]
    }
  },
  {
    id: 'transp-formation-tracabilite',
    question: 'Les formations obligatoires (FIMO/FCO, ADR, etc.) sont-elles tracées ?',
    description: 'Attestations, dates de validité, renouvellements à prévoir.',
    type: 'boolean',
    category: 'Données RH',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Suivi des formations obligatoires',
      description: 'Les formations réglementaires doivent être suivies et renouvelées.',
      actions: [
        'Tenir un tableau de bord des formations et échéances',
        'Conserver les attestations de formation',
        'Anticiper les renouvellements (FCO tous les 5 ans)',
        'Alerter les conducteurs et managers des échéances'
      ]
    }
  },
  {
    id: 'transp-droits-salaries',
    question: 'Les conducteurs peuvent-ils exercer leurs droits RGPD (accès, rectification) ?',
    description: 'Droit d\'accès à leur dossier, aux données de géoloc, au chrono.',
    type: 'boolean',
    category: 'Données RH',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Droits RGPD des conducteurs',
      description: 'Les salariés ont des droits sur leurs données personnelles.',
      actions: [
        'Informer les conducteurs de leurs droits (livret d\'accueil)',
        'Mettre en place une procédure de demande simple',
        'Répondre dans le délai d\'un mois',
        'Ne pas refuser l\'accès sauf exception légitime'
      ]
    }
  }
];

// Section 7: Sous-traitants et partenaires (5 questions)
const transportPartnersQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-cartographie-st',
    question: 'Avez-vous une liste complète de vos sous-traitants et partenaires ?',
    description: 'Affrétés, loueurs, éditeurs logiciels, prestataires IT, télématique.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographie des sous-traitants',
      description: 'Tous les prestataires accédant aux données doivent être identifiés.',
      actions: [
        'Recenser tous les sous-traitants transport (affrétés réguliers)',
        'Lister les prestataires IT (TMS, télématique, hébergeurs)',
        'Identifier les prestataires RH (paie, formation)',
        'Mettre à jour la liste régulièrement'
      ]
    }
  },
  {
    id: 'transp-contrats-st',
    question: 'Avez-vous des contrats RGPD avec vos principaux sous-traitants ?',
    description: 'Clauses obligatoires article 28 pour les prestataires accédant aux données.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrats de sous-traitance RGPD',
      description: 'Les sous-traitants doivent s\'engager contractuellement sur le RGPD.',
      actions: [
        'Vérifier les contrats existants et ajouter les clauses RGPD',
        'Inclure les 8 clauses obligatoires de l\'article 28',
        'Prévoir des audits possibles',
        'Traiter en priorité les sous-traitants critiques (TMS, télématique)'
      ]
    }
  },
  {
    id: 'transp-telematique-contrat',
    question: 'Le fournisseur de télématique/géolocalisation a-t-il un contrat RGPD ?',
    description: 'Il accède à des données sensibles (géoloc, chrono) : encadrement obligatoire.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrat fournisseur télématique',
      description: 'Le prestataire télématique traite des données sensibles pour votre compte.',
      actions: [
        'Vérifier que le contrat inclut les clauses RGPD',
        'S\'assurer de la localisation des données (hébergement)',
        'Prévoir la restitution/suppression des données en fin de contrat',
        'Vérifier la sécurité du système'
      ]
    }
  },
  {
    id: 'transp-affretés-donnees',
    question: 'Encadrez-vous les échanges de données avec vos affrétés/sous-traitants transport ?',
    description: 'Données de livraison, contacts destinataires, instructions.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Données partagées avec affrétés',
      description: 'Les sous-traitants transport reçoivent des données de vos clients.',
      actions: [
        'Limiter les données transmises au strict nécessaire',
        'Inclure des clauses de confidentialité dans les contrats',
        'Vérifier la suppression des données après la mission',
        'Sensibiliser les affrétés à la protection des données'
      ]
    }
  },
  {
    id: 'transp-bourses-fret',
    question: 'Si vous utilisez des bourses de fret, les données sont-elles protégées ?',
    description: 'Timocom, Teleroute, B2PWeb : informations sur les chargements et disponibilités.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Bourses de fret et données',
      description: 'Les bourses de fret impliquent le partage d\'informations.',
      actions: [
        'Vérifier les CGU et la politique de confidentialité des plateformes',
        'Limiter les informations partagées au nécessaire',
        'Ne pas divulguer de données clients sensibles',
        'Former les exploitants aux bonnes pratiques'
      ]
    }
  }
];

// Section 8: Sécurité IT et cybersécurité (5 questions)
const transportSecurityQuestions: ConditionalQuestion[] = [
  {
    id: 'transp-securite-tms',
    question: 'Votre TMS (Transport Management System) est-il sécurisé ?',
    description: 'Accès nominatifs, mots de passe forts, mises à jour régulières.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécurité du TMS',
      description: 'Le TMS contient des données clients, conducteurs et opérationnelles.',
      actions: [
        'Mettre en place des comptes nominatifs',
        'Appliquer une politique de mots de passe forts',
        'Maintenir le logiciel à jour',
        'Réaliser des sauvegardes régulières'
      ]
    }
  },
  {
    id: 'transp-terminaux-mobiles',
    question: 'Les terminaux mobiles des conducteurs sont-ils sécurisés ?',
    description: 'Smartphones, PDA, tablettes : code PIN, MDM, effacement à distance.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Sécurité des terminaux mobiles',
      description: 'Les terminaux peuvent contenir des données clients et être perdus ou volés.',
      actions: [
        'Imposer un code PIN ou verrouillage biométrique',
        'Mettre en place un MDM (Mobile Device Management)',
        'Permettre l\'effacement à distance en cas de perte',
        'Séparer données pro et perso si BYOD'
      ]
    }
  },
  {
    id: 'transp-sauvegardes',
    question: 'Effectuez-vous des sauvegardes régulières et testées de vos données ?',
    description: 'TMS, comptabilité, RH : les sauvegardes sont essentielles.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sauvegardes des données',
      description: 'Les sauvegardes protègent contre les ransomwares et les pannes.',
      actions: [
        'Sauvegarder quotidiennement les données critiques',
        'Conserver des sauvegardes hors site ou en cloud sécurisé',
        'Tester régulièrement la restauration',
        'Chiffrer les sauvegardes'
      ]
    }
  },
  {
    id: 'transp-sensibilisation-cyber',
    question: 'Les collaborateurs sont-ils sensibilisés aux risques cyber (phishing, ransomware) ?',
    description: 'Le facteur humain est le premier vecteur d\'attaque.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Sensibilisation cybersécurité',
      description: 'Les attaques par email sont très fréquentes dans le transport.',
      actions: [
        'Former les équipes aux risques phishing',
        'Alerter sur les arnaques au président et faux clients',
        'Tester avec des campagnes de faux phishing',
        'Mettre en place une procédure de signalement'
      ]
    }
  },
  {
    id: 'transp-plan-continuite',
    question: 'Avez-vous un plan de continuité en cas de cyberattaque ou panne majeure ?',
    description: 'Ransomware, panne TMS : comment continuer l\'exploitation ?',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Plan de continuité d\'activité',
      description: 'Une cyberattaque peut paralyser votre exploitation.',
      actions: [
        'Documenter les procédures dégradées (papier, téléphone)',
        'Identifier les fonctions critiques à maintenir',
        'Prévoir la restauration des systèmes',
        'Tester le plan au moins une fois par an'
      ]
    }
  }
];

// Variable vide pour compatibilité
const transportQuestions: ConditionalQuestion[] = [];

// ========================================
// Questions spécifiques MAGASIN & AIRE DE DÉPÔT SOUS DOUANE - 8 SECTIONS
// ========================================

// Section 1: Identification du site sous douane (5 questions)
const customsDepotIdentificationQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-raison-sociale',
    question: 'Avez-vous formalisé l\'identification complète de l\'exploitant du site sous douane ?',
    description: 'Raison sociale, adresse, type d\'installation (magasin, aire, zone franche, entrepôt).',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Identification de l\'exploitant',
      description: 'L\'identification claire est nécessaire pour les obligations douanières et RGPD.',
      actions: [
        'Documenter la raison sociale et l\'adresse du site',
        'Préciser le type d\'installation (magasin, aire de dépôt, zone franche)',
        'Tenir à jour les informations légales',
        'Intégrer ces informations dans le registre des traitements'
      ]
    }
  },
  {
    id: 'douane-agrement',
    question: 'Disposez-vous d\'un agrément douanier valide et à jour ?',
    description: 'Numéro et date de l\'agrément, autorité douanière de rattachement.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Agrément douanier',
      description: 'L\'agrément douanier est obligatoire pour exploiter un site sous douane.',
      actions: [
        'Conserver l\'agrément douanier original et ses copies',
        'Vérifier la date de validité et anticiper les renouvellements',
        'Documenter l\'autorité douanière de rattachement',
        'Mettre à jour l\'agrément en cas de modification du site'
      ]
    }
  },
  {
    id: 'douane-type-installation',
    question: 'Le type d\'installation est-il clairement défini et conforme à l\'agrément ?',
    description: 'Magasin, aire de dépôt, zone franche, entrepôt sous douane.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Type d\'installation',
      description: 'Chaque type d\'installation a des obligations spécifiques.',
      actions: [
        'Vérifier la cohérence entre l\'agrément et l\'utilisation réelle',
        'Documenter les zones de stockage sous douane',
        'S\'assurer de la conformité des aménagements',
        'Signaler tout changement à l\'administration douanière'
      ]
    }
  },
  {
    id: 'douane-autorite-rattachement',
    question: 'Les coordonnées de l\'autorité douanière de rattachement sont-elles à jour ?',
    description: 'Bureau de douane référent, contacts, procédures de communication.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Autorité douanière de rattachement',
      description: 'Une communication fluide avec la douane est essentielle.',
      actions: [
        'Documenter le bureau de douane de rattachement',
        'Tenir à jour les contacts des agents référents',
        'Établir des procédures de communication régulières',
        'Anticiper les inspections et contrôles'
      ]
    }
  },
  {
    id: 'douane-mise-a-jour-info',
    question: 'Les informations d\'identification sont-elles régulièrement mises à jour ?',
    description: 'Révision périodique des données administratives et de l\'agrément.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Mise à jour des informations',
      description: 'Les informations doivent refléter la situation actuelle.',
      actions: [
        'Planifier une révision annuelle des informations',
        'Signaler immédiatement tout changement à la douane',
        'Mettre à jour les documents internes',
        'Former le personnel aux procédures de mise à jour'
      ]
    }
  }
];

// Section 2: Organisation et responsabilités (5 questions)
const customsDepotOrganizationQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-responsable-magasin',
    question: 'Existe-t-il un responsable désigné pour le magasin sous douane ?',
    description: 'Responsable nommé, qualifié et habilité auprès de la douane.',
    type: 'boolean',
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Désignation du responsable',
      description: 'Un responsable doit être désigné pour les obligations douanières.',
      actions: [
        'Désigner un responsable qualifié et formé',
        'Formaliser la nomination par écrit',
        'Déclarer le responsable à l\'autorité douanière',
        'Prévoir un suppléant en cas d\'absence'
      ]
    }
  },
  {
    id: 'douane-roles-responsabilites',
    question: 'Les rôles et responsabilités sont-ils définis par écrit ?',
    description: 'Fiches de poste, organigramme, délégations de pouvoir.',
    type: 'boolean',
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Définition des rôles',
      description: 'Chaque collaborateur doit connaître ses responsabilités.',
      actions: [
        'Rédiger des fiches de poste détaillées',
        'Établir un organigramme clair',
        'Formaliser les délégations de pouvoir',
        'Communiquer les responsabilités à tous les collaborateurs'
      ]
    }
  },
  {
    id: 'douane-manuel-procedures',
    question: 'Disposez-vous d\'un manuel de procédures douanières ?',
    description: 'Documentation des processus, instructions de travail, modes opératoires.',
    type: 'boolean',
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Manuel de procédures',
      description: 'Un manuel assure la cohérence des opérations douanières.',
      actions: [
        'Rédiger un manuel de procédures complet',
        'Inclure les instructions pour chaque type d\'opération',
        'Mettre à jour le manuel régulièrement',
        'Rendre le manuel accessible à tous les collaborateurs'
      ]
    }
  },
  {
    id: 'douane-formation-personnel',
    question: 'Le personnel est-il formé aux obligations douanières ?',
    description: 'Formations initiales et continues, attestations, recyclages.',
    type: 'boolean',
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formation du personnel',
      description: 'La formation est essentielle pour la conformité douanière.',
      actions: [
        'Organiser des formations initiales pour les nouveaux arrivants',
        'Planifier des formations continues régulières',
        'Conserver les attestations de formation',
        'Évaluer les compétences périodiquement'
      ]
    }
  },
  {
    id: 'douane-gestion-absences',
    question: 'La gestion des remplacements et absences est-elle organisée ?',
    description: 'Continuité de service, suppléants formés, passation de consignes.',
    type: 'boolean',
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des absences',
      description: 'La continuité des opérations doit être assurée.',
      actions: [
        'Identifier et former des suppléants',
        'Établir des procédures de passation',
        'Documenter les consignes en cours',
        'Tester régulièrement les procédures de remplacement'
      ]
    }
  }
];

// Section 3: Réception, stockage et délivrance (5 questions)
const customsDepotReceptionQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-procedure-reception',
    question: 'Disposez-vous de procédures écrites de réception des marchandises ?',
    description: 'Vérification des documents, contrôle des quantités, état des marchandises.',
    type: 'boolean',
    category: 'Réception',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédures de réception',
      description: 'La réception doit être rigoureusement documentée.',
      actions: [
        'Rédiger des procédures de réception détaillées',
        'Lister les documents à vérifier à l\'entrée',
        'Définir les contrôles obligatoires',
        'Former le personnel aux procédures'
      ]
    }
  },
  {
    id: 'douane-controle-entree',
    question: 'Effectuez-vous un contrôle systématique des quantités, états et scellés à l\'entrée ?',
    description: 'Vérification des scellés, comptage, inspection visuelle de l\'état.',
    type: 'boolean',
    category: 'Réception',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrôle à l\'entrée',
      description: 'Les contrôles d\'entrée protègent votre responsabilité.',
      actions: [
        'Vérifier systématiquement les scellés douaniers',
        'Compter et peser les marchandises',
        'Inspecter l\'état des colis et emballages',
        'Documenter toute anomalie constatée'
      ]
    }
  },
  {
    id: 'douane-zones-stockage',
    question: 'Les zones de stockage sont-elles clairement délimitées et identifiées ?',
    description: 'Séparation des zones, signalétique, plan de stockage.',
    type: 'boolean',
    category: 'Stockage',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Organisation du stockage',
      description: 'Une bonne organisation facilite les contrôles douaniers.',
      actions: [
        'Délimiter clairement les zones sous douane',
        'Installer une signalétique appropriée',
        'Établir un plan de stockage',
        'Séparer les marchandises par statut douanier'
      ]
    }
  },
  {
    id: 'douane-procedure-delivrance',
    question: 'Les procédures de délivrance des marchandises sont-elles formalisées ?',
    description: 'Contrôle des documents de sortie, vérification des autorisations.',
    type: 'boolean',
    category: 'Délivrance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédures de délivrance',
      description: 'La sortie des marchandises doit être rigoureusement contrôlée.',
      actions: [
        'Rédiger des procédures de délivrance',
        'Vérifier les autorisations de sortie',
        'Contrôler les documents avant libération',
        'Tracer toutes les sorties de marchandises'
      ]
    }
  },
  {
    id: 'douane-anomalies-reception',
    question: 'Existe-t-il une procédure de gestion des anomalies à la réception ?',
    description: 'Écarts de quantité, dommages, scellés brisés, documents manquants.',
    type: 'boolean',
    category: 'Réception',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des anomalies',
      description: 'Les anomalies doivent être traitées selon des procédures définies.',
      actions: [
        'Définir les types d\'anomalies possibles',
        'Établir la procédure de signalement',
        'Documenter les anomalies dans un registre',
        'Informer l\'administration douanière si nécessaire'
      ]
    }
  }
];

// Section 4: Registres, inventaires et traçabilité (5 questions)
const customsDepotRegistersQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-registres-reglementaires',
    question: 'Tenez-vous les registres réglementaires exigés par la douane ?',
    description: 'Registre d\'entrées/sorties, comptabilité matières, journaux.',
    type: 'boolean',
    category: 'Registres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Registres réglementaires',
      description: 'Les registres douaniers sont obligatoires et contrôlés.',
      actions: [
        'Identifier tous les registres obligatoires',
        'Tenir les registres à jour quotidiennement',
        'Conserver les registres pendant la durée légale',
        'Les présenter sur demande de la douane'
      ]
    }
  },
  {
    id: 'douane-maj-quotidienne',
    question: 'Les entrées et sorties sont-elles mises à jour quotidiennement ?',
    description: 'Enregistrement en temps réel ou en fin de journée.',
    type: 'boolean',
    category: 'Registres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Mise à jour quotidienne',
      description: 'La mise à jour rapide est essentielle pour la traçabilité.',
      actions: [
        'Enregistrer chaque mouvement le jour même',
        'Vérifier la cohérence des écritures',
        'Former le personnel à l\'enregistrement immédiat',
        'Contrôler régulièrement les retards d\'enregistrement'
      ]
    }
  },
  {
    id: 'douane-inventaires-periodiques',
    question: 'Réalisez-vous des inventaires physiques périodiques ?',
    description: 'Inventaire complet, rapprochement avec les registres, analyse des écarts.',
    type: 'boolean',
    category: 'Inventaires',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Inventaires périodiques',
      description: 'Les inventaires permettent de détecter les écarts.',
      actions: [
        'Planifier des inventaires réguliers (mensuels, trimestriels)',
        'Comparer les résultats avec les registres',
        'Analyser et expliquer les écarts',
        'Documenter les résultats et actions correctives'
      ]
    }
  },
  {
    id: 'douane-traitement-ecarts',
    question: 'Existe-t-il une procédure de traitement des écarts d\'inventaire ?',
    description: 'Analyse des causes, actions correctives, signalement à la douane.',
    type: 'boolean',
    category: 'Inventaires',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Traitement des écarts',
      description: 'Les écarts doivent être analysés et signalés.',
      actions: [
        'Définir des seuils d\'alerte pour les écarts',
        'Analyser les causes de chaque écart significatif',
        'Mettre en place des actions correctives',
        'Signaler les écarts importants à la douane'
      ]
    }
  },
  {
    id: 'douane-archivage-documents',
    question: 'Les documents douaniers sont-ils archivés correctement ?',
    description: 'Conservation, classement, durée légale, accessibilité.',
    type: 'boolean',
    category: 'Archivage',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Archivage des documents',
      description: 'Les documents doivent être conservés et accessibles.',
      actions: [
        'Respecter les durées légales de conservation',
        'Organiser un système de classement efficace',
        'Sécuriser les archives contre les risques',
        'Permettre une consultation rapide en cas de contrôle'
      ]
    }
  }
];

// Section 5: Sécurité physique et prévention (5 questions)
const customsDepotSecurityQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-cloture-acces',
    question: 'Le site dispose-t-il d\'une clôture et d\'un contrôle des accès ?',
    description: 'Périmètre sécurisé, barrières, contrôle d\'entrée.',
    type: 'boolean',
    category: 'Sécurité physique',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrôle des accès',
      description: 'La sécurité physique est une exigence pour les sites sous douane.',
      actions: [
        'Installer une clôture périphérique complète',
        'Mettre en place un contrôle d\'entrée',
        'Limiter les points d\'accès',
        'Vérifier régulièrement l\'intégrité de la clôture'
      ]
    }
  },
  {
    id: 'douane-surveillance',
    question: 'Disposez-vous de dispositifs de surveillance (gardiennage, caméras) ?',
    description: 'Vidéosurveillance, rondes, alarmes, télésurveillance.',
    type: 'boolean',
    category: 'Sécurité physique',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Dispositifs de surveillance',
      description: 'La surveillance renforce la sécurité du site.',
      actions: [
        'Installer un système de vidéosurveillance',
        'Organiser des rondes de gardiennage si nécessaire',
        'Mettre en place des alarmes intrusion',
        'Déclarer la vidéosurveillance à la CNIL si nécessaire'
      ]
    },
    followUpQuestions: [
      {
        id: 'douane-cnil-video',
        question: 'La vidéosurveillance est-elle déclarée/conforme RGPD ?',
        type: 'boolean',
        category: 'Sécurité physique',
        showIf: { questionId: 'douane-surveillance', answer: true },
        guidance: {
          title: 'Conformité RGPD de la vidéosurveillance',
          description: 'La vidéosurveillance est un traitement de données personnelles.',
          actions: [
            'Informer les personnes filmées (panneaux)',
            'Limiter la durée de conservation des images',
            'Restreindre l\'accès aux images',
            'Documenter dans le registre des traitements'
          ]
        }
      }
    ]
  },
  {
    id: 'douane-gestion-cles',
    question: 'La gestion des clés, badges et autorisations d\'accès est-elle formalisée ?',
    description: 'Registre des clés, badges nominatifs, révocation des accès.',
    type: 'boolean',
    category: 'Sécurité physique',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des accès',
      description: 'Les accès doivent être nominatifs et tracés.',
      actions: [
        'Tenir un registre des clés et badges',
        'Attribuer des accès nominatifs',
        'Révoquer immédiatement les accès des partants',
        'Réaliser des audits réguliers des accès'
      ]
    }
  },
  {
    id: 'douane-prevention-incendie',
    question: 'Les mesures de prévention incendie sont-elles en place ?',
    description: 'Extincteurs, détection, plan d\'évacuation, formation.',
    type: 'boolean',
    category: 'Sécurité physique',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Prévention incendie',
      description: 'La protection contre l\'incendie est obligatoire.',
      actions: [
        'Installer et vérifier les extincteurs',
        'Mettre en place une détection incendie',
        'Afficher les plans d\'évacuation',
        'Former le personnel aux gestes de premiers secours'
      ]
    }
  },
  {
    id: 'douane-plan-incidents',
    question: 'Disposez-vous d\'un plan de gestion des incidents et vols ?',
    description: 'Procédures d\'alerte, enquête interne, signalement aux autorités.',
    type: 'boolean',
    category: 'Sécurité physique',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des incidents',
      description: 'Les incidents doivent être gérés selon des procédures définies.',
      actions: [
        'Rédiger une procédure de gestion des incidents',
        'Définir la chaîne d\'alerte',
        'Prévoir les signalements aux autorités',
        'Documenter tous les incidents dans un registre'
      ]
    }
  }
];

// Section 6: Conformité douanière (5 questions)
const customsDepotComplianceQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-respect-agrement',
    question: 'Respectez-vous les conditions de votre agrément douanier ?',
    description: 'Obligations, limites, types de marchandises autorisées.',
    type: 'boolean',
    category: 'Conformité douanière',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Respect de l\'agrément',
      description: 'L\'agrément définit vos obligations et limites d\'activité.',
      actions: [
        'Relire régulièrement les termes de l\'agrément',
        'Vérifier que vos activités restent dans le cadre autorisé',
        'Signaler tout changement à la douane',
        'Anticiper le renouvellement de l\'agrément'
      ]
    }
  },
  {
    id: 'douane-communication-douanes',
    question: 'Maintenez-vous une communication régulière avec l\'administration des douanes ?',
    description: 'Réunions, échanges, questions préalables, relations de confiance.',
    type: 'boolean',
    category: 'Conformité douanière',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Relations avec la douane',
      description: 'Une bonne communication facilite les opérations.',
      actions: [
        'Organiser des réunions régulières avec le bureau référent',
        'Poser des questions préalables en cas de doute',
        'Informer proactivement de tout changement',
        'Construire une relation de confiance'
      ]
    }
  },
  {
    id: 'douane-gestion-controles',
    question: 'Êtes-vous préparé à la gestion des contrôles douaniers ?',
    description: 'Disponibilité des documents, accueil des agents, coopération.',
    type: 'boolean',
    category: 'Conformité douanière',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des contrôles',
      description: 'Les contrôles doivent être anticipés et bien gérés.',
      actions: [
        'Préparer un dossier de contrôle toujours à jour',
        'Désigner un interlocuteur pour les contrôles',
        'Former le personnel à l\'accueil des agents',
        'Coopérer pleinement lors des contrôles'
      ]
    }
  },
  {
    id: 'douane-procedure-infractions',
    question: 'Disposez-vous d\'une procédure en cas d\'infraction ou anomalie ?',
    description: 'Signalement, correction, suivi des contentieux.',
    type: 'boolean',
    category: 'Conformité douanière',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des infractions',
      description: 'Les anomalies doivent être signalées et corrigées rapidement.',
      actions: [
        'Rédiger une procédure de signalement des anomalies',
        'Informer la douane des anomalies détectées',
        'Mettre en place des actions correctives',
        'Documenter les infractions et leur traitement'
      ]
    }
  },
  {
    id: 'douane-veille-reglementaire',
    question: 'Effectuez-vous une veille sur les évolutions réglementaires douanières ?',
    description: 'Nouvelles réglementations, modifications des procédures, alertes.',
    type: 'boolean',
    category: 'Conformité douanière',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Veille réglementaire',
      description: 'La réglementation douanière évolue régulièrement.',
      actions: [
        'S\'abonner aux communications de la douane',
        'Suivre l\'actualité réglementaire du secteur',
        'Participer aux réunions d\'information',
        'Mettre à jour les procédures en conséquence'
      ]
    }
  }
];

// Section 7: Assurance et gestion des sinistres (5 questions)
const customsDepotInsuranceQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-assurance-marchandises',
    question: 'Disposez-vous d\'une assurance couvrant les marchandises sous douane ?',
    description: 'Garanties adaptées, montants suffisants, exclusions connues.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Assurance des marchandises',
      description: 'Une assurance adaptée est essentielle pour couvrir les risques.',
      actions: [
        'Vérifier l\'étendue des garanties',
        'S\'assurer que les montants sont suffisants',
        'Connaître les exclusions de garantie',
        'Mettre à jour le contrat régulièrement'
      ]
    }
  },
  {
    id: 'douane-responsabilites-sinistre',
    question: 'Les responsabilités en cas de sinistre sont-elles clairement définies ?',
    description: 'Répartition des responsabilités, conventions, clauses contractuelles.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Responsabilités en cas de sinistre',
      description: 'La répartition des responsabilités doit être claire.',
      actions: [
        'Définir les responsabilités dans les contrats',
        'Clarifier les conventions avec les déposants',
        'Documenter les procédures de gestion des sinistres',
        'Former le personnel aux responsabilités'
      ]
    }
  },
  {
    id: 'douane-procedure-declaration',
    question: 'Disposez-vous d\'une procédure écrite de déclaration des sinistres ?',
    description: 'Délais, formulaires, documents à fournir, chaîne d\'alerte.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Déclaration des sinistres',
      description: 'Les sinistres doivent être déclarés dans les délais.',
      actions: [
        'Rédiger une procédure de déclaration de sinistre',
        'Définir les délais de déclaration',
        'Préparer les formulaires et documents nécessaires',
        'Former le personnel à la procédure'
      ]
    }
  },
  {
    id: 'douane-gestion-expertises',
    question: 'La gestion des expertises et constats est-elle organisée ?',
    description: 'Accès aux experts, documentation, conservation des preuves.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des expertises',
      description: 'Les expertises doivent être facilitées et documentées.',
      actions: [
        'Faciliter l\'accès des experts au site',
        'Conserver les preuves et documents',
        'Photographier les dommages',
        'Documenter le déroulement des expertises'
      ]
    }
  },
  {
    id: 'douane-historique-sinistres',
    question: 'Tenez-vous un historique des sinistres ?',
    description: 'Registre des sinistres, analyse des causes, prévention.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Historique des sinistres',
      description: 'L\'historique permet d\'améliorer la prévention.',
      actions: [
        'Tenir un registre des sinistres',
        'Analyser les causes de chaque sinistre',
        'Identifier les mesures de prévention',
        'Partager les retours d\'expérience'
      ]
    }
  }
];

// Section 8: Amélioration continue et contrôle interne (5 questions)
const customsDepotImprovementQuestions: ConditionalQuestion[] = [
  {
    id: 'douane-controles-internes',
    question: 'Réalisez-vous des contrôles internes périodiques ?',
    description: 'Audits internes, vérifications, tests de conformité.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Contrôles internes',
      description: 'Les contrôles internes permettent de détecter les dysfonctionnements.',
      actions: [
        'Planifier des contrôles internes réguliers',
        'Définir les points de contrôle',
        'Documenter les résultats des contrôles',
        'Suivre les actions correctives'
      ]
    }
  },
  {
    id: 'douane-analyse-incidents',
    question: 'Analysez-vous les incidents et non-conformités ?',
    description: 'Recherche des causes, actions correctives, capitalisation.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Analyse des incidents',
      description: 'L\'analyse permet d\'éviter la répétition des problèmes.',
      actions: [
        'Analyser chaque incident significatif',
        'Rechercher les causes profondes',
        'Définir des actions correctives',
        'Capitaliser sur les retours d\'expérience'
      ]
    }
  },
  {
    id: 'douane-actions-correctives',
    question: 'Les actions correctives sont-elles formalisées et suivies ?',
    description: 'Plan d\'action, responsables, délais, vérification de l\'efficacité.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Suivi des actions correctives',
      description: 'Les actions correctives doivent être suivies jusqu\'à leur clôture.',
      actions: [
        'Formaliser les actions correctives par écrit',
        'Désigner des responsables et fixer des délais',
        'Suivre l\'avancement des actions',
        'Vérifier l\'efficacité des actions mises en place'
      ]
    }
  },
  {
    id: 'douane-maj-procedures',
    question: 'Les procédures sont-elles mises à jour régulièrement ?',
    description: 'Révision périodique, intégration des évolutions, diffusion.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Mise à jour des procédures',
      description: 'Les procédures doivent refléter les pratiques actuelles.',
      actions: [
        'Planifier une révision annuelle des procédures',
        'Intégrer les évolutions réglementaires',
        'Diffuser les mises à jour au personnel',
        'Archiver les versions précédentes'
      ]
    }
  },
  {
    id: 'douane-plan-amelioration',
    question: 'Disposez-vous d\'un plan d\'amélioration continue ?',
    description: 'Objectifs, indicateurs, suivi des progrès, revue de direction.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Plan d\'amélioration continue',
      description: 'Un plan structuré favorise l\'amélioration durable.',
      actions: [
        'Définir des objectifs d\'amélioration',
        'Mettre en place des indicateurs de suivi',
        'Organiser des revues de direction régulières',
        'Célébrer les progrès réalisés'
      ]
    }
  }
];

// ========================================
// SECTIONS QUESTIONNAIRE MAGASIN & AIRE DE DÉPÔT SOUS DOUANE - 8 SECTIONS
// ========================================
const customsDepotSections: QuestionnaireSection[] = [
  {
    id: 'douane-identification',
    title: '1. Identification du site sous douane',
    description: 'Raison sociale, agrément, type d\'installation, autorité de rattachement',
    icon: 'building-2',
    questions: customsDepotIdentificationQuestions
  },
  {
    id: 'douane-organisation',
    title: '2. Organisation et responsabilités',
    description: 'Responsable, rôles, manuel de procédures, formation, absences',
    icon: 'users',
    questions: customsDepotOrganizationQuestions
  },
  {
    id: 'douane-reception',
    title: '3. Réception, stockage et délivrance',
    description: 'Procédures de réception, contrôles, zones de stockage, délivrance',
    icon: 'package',
    questions: customsDepotReceptionQuestions
  },
  {
    id: 'douane-registres',
    title: '4. Registres, inventaires et traçabilité',
    description: 'Registres douaniers, inventaires, écarts, archivage',
    icon: 'file-text',
    questions: customsDepotRegistersQuestions
  },
  {
    id: 'douane-securite',
    title: '5. Sécurité physique et prévention',
    description: 'Clôture, surveillance, gestion des accès, incendie, incidents',
    icon: 'shield',
    questions: customsDepotSecurityQuestions
  },
  {
    id: 'douane-conformite',
    title: '6. Conformité douanière',
    description: 'Respect de l\'agrément, communication, contrôles, veille réglementaire',
    icon: 'check-circle',
    questions: customsDepotComplianceQuestions
  },
  {
    id: 'douane-assurance',
    title: '7. Assurance et gestion des sinistres',
    description: 'Assurance marchandises, responsabilités, déclarations, expertises',
    icon: 'shield-check',
    questions: customsDepotInsuranceQuestions
  },
  {
    id: 'douane-amelioration',
    title: '8. Amélioration continue et contrôle interne',
    description: 'Contrôles internes, analyse des incidents, actions correctives',
    icon: 'trending-up',
    questions: customsDepotImprovementQuestions
  }
];

// ========================================
// Questions spécifiques TRANSPORTEUR MULTIMODAL - 8 SECTIONS (40 questions)
// ========================================

// Section 1: Identification du transporteur (5 questions)
const multimodalIdentificationQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-raison-sociale',
    question: 'L\'identification complète du transporteur est-elle formalisée ?',
    description: 'Raison sociale, forme juridique, pays d\'implantation, zones d\'opération.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Identification du transporteur',
      description: 'Une identification claire est essentielle pour les responsabilités contractuelles.',
      actions: [
        'Documenter la raison sociale et forme juridique',
        'Préciser les pays d\'implantation et zones d\'opération',
        'Tenir à jour les informations légales',
        'Communiquer ces informations aux partenaires'
      ]
    }
  },
  {
    id: 'multi-modes-transport',
    question: 'Les modes de transport exploités sont-ils clairement identifiés ?',
    description: 'Route, mer, air, rail : chaque mode a ses réglementations spécifiques.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Modes de transport',
      description: 'Chaque mode implique des conventions et responsabilités différentes.',
      actions: [
        'Lister les modes de transport utilisés',
        'Identifier les conventions applicables par mode',
        'Former le personnel aux spécificités de chaque mode',
        'Adapter les procédures à chaque mode'
      ]
    }
  },
  {
    id: 'multi-statut-juridique',
    question: 'Votre statut est-il clairement défini (transporteur contractuel, OTM, commissionnaire) ?',
    description: 'Le statut détermine vos responsabilités légales et contractuelles.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Statut juridique',
      description: 'Le statut impacte directement votre responsabilité et vos obligations.',
      actions: [
        'Clarifier votre statut : transporteur, OTM ou commissionnaire',
        'Documenter ce statut dans vos CGV',
        'Adapter vos contrats au statut choisi',
        'Former le personnel aux implications du statut'
      ]
    }
  },
  {
    id: 'multi-responsable-operations',
    question: 'Un responsable est-il désigné pour les opérations multimodales ?',
    description: 'Coordination des différents modes, suivi global, gestion des incidents.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Responsable opérations',
      description: 'Un responsable dédié assure la coordination entre les modes.',
      actions: [
        'Désigner un responsable des opérations multimodales',
        'Définir ses responsabilités par écrit',
        'Lui donner les moyens de coordonner les modes',
        'Prévoir un suppléant'
      ]
    }
  },
  {
    id: 'multi-licences-autorisations',
    question: 'Disposez-vous des licences et autorisations nécessaires pour chaque mode ?',
    description: 'Licence de transport, agrément OEA, autorisations spécifiques.',
    type: 'boolean',
    category: 'Identification',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Licences et autorisations',
      description: 'L\'exercice du transport requiert des autorisations spécifiques.',
      actions: [
        'Vérifier les licences requises pour chaque mode',
        'Maintenir les autorisations à jour',
        'Anticiper les renouvellements',
        'Archiver les documents d\'autorisation'
      ]
    }
  }
];

// Section 2: Organisation des opérations multimodales (5 questions)
const multimodalOperationsQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-procedures-operations',
    question: 'Disposez-vous de procédures écrites pour les opérations multimodales ?',
    description: 'Documentation des processus, instructions de travail, modes opératoires.',
    type: 'boolean',
    category: 'Opérations',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédures opérationnelles',
      description: 'Les procédures assurent la cohérence et la traçabilité des opérations.',
      actions: [
        'Rédiger des procédures pour chaque type d\'opération',
        'Inclure les spécificités de chaque mode',
        'Former le personnel aux procédures',
        'Mettre à jour régulièrement'
      ]
    }
  },
  {
    id: 'multi-ruptures-charge',
    question: 'La gestion des ruptures de charge est-elle formalisée ?',
    description: 'Transfert entre modes, contrôles intermédiaires, documentation.',
    type: 'boolean',
    category: 'Opérations',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Ruptures de charge',
      description: 'Les ruptures de charge sont des points critiques de risque.',
      actions: [
        'Identifier tous les points de rupture de charge',
        'Définir les contrôles à effectuer',
        'Documenter les transferts entre modes',
        'Former le personnel aux procédures de transfert'
      ]
    }
  },
  {
    id: 'multi-suivi-bout-en-bout',
    question: 'Disposez-vous d\'un suivi opérationnel de bout en bout ?',
    description: 'Tracking, visibilité temps réel, alertes, reporting.',
    type: 'boolean',
    category: 'Opérations',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Suivi de bout en bout',
      description: 'La visibilité sur l\'ensemble du transport est essentielle.',
      actions: [
        'Mettre en place un système de tracking unifié',
        'Permettre le suivi par le client',
        'Configurer des alertes en cas d\'anomalie',
        'Générer des rapports de performance'
      ]
    }
  },
  {
    id: 'multi-coordination-modes',
    question: 'La coordination entre les différents modes de transport est-elle assurée ?',
    description: 'Communication, planification, synchronisation des opérations.',
    type: 'boolean',
    category: 'Opérations',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Coordination intermodale',
      description: 'La coordination évite les retards et les erreurs.',
      actions: [
        'Établir des procédures de communication entre modes',
        'Planifier les connexions avec des marges suffisantes',
        'Prévoir des alternatives en cas de retard',
        'Former les équipes à la coordination'
      ]
    }
  },
  {
    id: 'multi-gestion-incidents',
    question: 'Existe-t-il une procédure de gestion des incidents opérationnels ?',
    description: 'Alertes, escalade, résolution, communication client.',
    type: 'boolean',
    category: 'Opérations',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des incidents',
      description: 'Les incidents doivent être gérés rapidement et efficacement.',
      actions: [
        'Définir les types d\'incidents et leur criticité',
        'Établir une procédure d\'escalade',
        'Communiquer proactivement avec les clients',
        'Documenter les incidents pour l\'amélioration continue'
      ]
    }
  }
];

// Section 3: Contrats et documents de transport (5 questions)
const multimodalContractsQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-contrats-types',
    question: 'Utilisez-vous des contrats types adaptés à chaque mode de transport ?',
    description: 'CMR pour la route, connaissement maritime, LTA aérien, lettre de voiture ferroviaire.',
    type: 'boolean',
    category: 'Contrats',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrats par mode',
      description: 'Chaque mode a ses documents et contrats spécifiques.',
      actions: [
        'Utiliser les documents adaptés à chaque mode',
        'Former le personnel à la rédaction des documents',
        'Vérifier la conformité des documents émis',
        'Archiver tous les documents de transport'
      ]
    }
  },
  {
    id: 'multi-conventions-applicables',
    question: 'Maîtrisez-vous les conventions applicables (CMR, La Haye-Visby, Montréal, CIM) ?',
    description: 'Chaque convention définit les responsabilités et limites d\'indemnisation.',
    type: 'boolean',
    category: 'Contrats',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Conventions de transport',
      description: 'La connaissance des conventions est essentielle pour gérer les responsabilités.',
      actions: [
        'Former le personnel aux conventions applicables',
        'Identifier la convention applicable à chaque transport',
        'Connaître les limites d\'indemnisation',
        'Adapter les CGV aux conventions'
      ],
      resources: [
        { label: 'Convention CMR', url: 'https://www.unece.org/trans/conventn/cmr_f.html' }
      ]
    }
  },
  {
    id: 'multi-reserves',
    question: 'Les réserves sont-elles formalisées à la prise en charge et à la livraison ?',
    description: 'Émission de réserves écrites, photos, documentation des anomalies.',
    type: 'boolean',
    category: 'Contrats',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Gestion des réserves',
      description: 'Les réserves protègent votre responsabilité.',
      actions: [
        'Former le personnel à l\'émission des réserves',
        'Utiliser des formulations précises et motivées',
        'Photographier les anomalies constatées',
        'Transmettre les réserves dans les délais'
      ]
    }
  },
  {
    id: 'multi-archivage-documents',
    question: 'Les documents de transport sont-ils archivés conformément aux obligations ?',
    description: 'Durée de conservation, accessibilité, sécurité des archives.',
    type: 'boolean',
    category: 'Contrats',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Archivage des documents',
      description: 'Les documents doivent être conservés pendant les délais légaux.',
      actions: [
        'Respecter les durées de conservation légales',
        'Organiser un système d\'archivage accessible',
        'Sécuriser les archives',
        'Permettre une consultation rapide en cas de litige'
      ]
    }
  },
  {
    id: 'multi-gestion-delais',
    question: 'La gestion contractuelle des délais est-elle formalisée ?',
    description: 'Délais de transit, pénalités, force majeure, exonérations.',
    type: 'boolean',
    category: 'Contrats',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Gestion des délais',
      description: 'Les délais engagent votre responsabilité.',
      actions: [
        'Définir clairement les délais dans les contrats',
        'Prévoir les cas de force majeure',
        'Documenter les causes de retard',
        'Communiquer proactivement en cas de retard'
      ]
    }
  }
];

// Section 4: Sous-traitance (5 questions)
const multimodalSubcontractingQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-recours-st',
    question: 'Le recours aux sous-traitants est-il encadré ?',
    description: 'Identification des sous-traitants, critères de sélection, suivi.',
    type: 'boolean',
    category: 'Sous-traitance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Encadrement de la sous-traitance',
      description: 'La sous-traitance doit être maîtrisée.',
      actions: [
        'Identifier tous les sous-traitants utilisés',
        'Définir des critères de sélection',
        'Suivre la performance des sous-traitants',
        'Prévoir des audits réguliers'
      ]
    }
  },
  {
    id: 'multi-contrats-st',
    question: 'Disposez-vous de contrats écrits avec tous vos sous-traitants ?',
    description: 'Conditions, responsabilités, assurances, RGPD.',
    type: 'boolean',
    category: 'Sous-traitance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrats de sous-traitance',
      description: 'Les contrats écrits sécurisent la relation.',
      actions: [
        'Rédiger des contrats complets avec chaque sous-traitant',
        'Inclure les clauses de responsabilité',
        'Exiger des garanties d\'assurance',
        'Intégrer les clauses RGPD obligatoires'
      ]
    }
  },
  {
    id: 'multi-assurances-st',
    question: 'Vérifiez-vous les assurances de vos sous-traitants ?',
    description: 'Attestations d\'assurance, montants de garantie, validité.',
    type: 'boolean',
    category: 'Sous-traitance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Vérification des assurances',
      description: 'Les sous-traitants doivent être correctement assurés.',
      actions: [
        'Demander les attestations d\'assurance',
        'Vérifier les montants de garantie',
        'Contrôler la validité des attestations',
        'Renouveler les vérifications annuellement'
      ]
    }
  },
  {
    id: 'multi-repartition-responsabilites',
    question: 'La répartition des responsabilités avec les sous-traitants est-elle claire ?',
    description: 'Points de transfert de risque, responsabilités respectives.',
    type: 'boolean',
    category: 'Sous-traitance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Répartition des responsabilités',
      description: 'La clarté évite les litiges.',
      actions: [
        'Définir les points de transfert de responsabilité',
        'Documenter les responsabilités dans les contrats',
        'Former le personnel aux points de vigilance',
        'Prévoir les recours en cas de sinistre'
      ]
    }
  },
  {
    id: 'multi-selection-evaluation',
    question: 'Avez-vous une procédure de sélection et d\'évaluation des sous-traitants ?',
    description: 'Critères de sélection, évaluation périodique, notation.',
    type: 'boolean',
    category: 'Sous-traitance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Sélection et évaluation',
      description: 'Une évaluation régulière assure la qualité.',
      actions: [
        'Définir des critères de sélection objectifs',
        'Évaluer périodiquement les performances',
        'Mettre en place un système de notation',
        'Prévoir des actions en cas de sous-performance'
      ]
    }
  }
];

// Section 5: Marchandises et risques (5 questions)
const multimodalGoodsRisksQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-typologie-marchandises',
    question: 'La typologie des marchandises transportées est-elle documentée ?',
    description: 'Nature, valeur, conditions de transport, restrictions.',
    type: 'boolean',
    category: 'Marchandises',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Typologie des marchandises',
      description: 'Connaître les marchandises permet d\'adapter les mesures.',
      actions: [
        'Catégoriser les types de marchandises transportées',
        'Identifier les marchandises sensibles ou de valeur',
        'Adapter les procédures selon la nature',
        'Documenter les conditions de transport requises'
      ]
    }
  },
  {
    id: 'multi-marchandises-dangereuses',
    question: 'Les procédures pour marchandises sensibles ou dangereuses sont-elles en place ?',
    description: 'ADR, IMDG, IATA DGR : réglementations spécifiques.',
    type: 'boolean',
    category: 'Marchandises',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Marchandises dangereuses',
      description: 'Le transport de MD est strictement réglementé.',
      actions: [
        'Identifier les réglementations applicables (ADR, IMDG, IATA)',
        'Former le personnel aux procédures MD',
        'Vérifier les autorisations et certifications',
        'Documenter tous les transports de MD'
      ],
      resources: [
        { label: 'Réglementation ADR', url: 'https://unece.org/transport/dangerous-goods' }
      ]
    }
  },
  {
    id: 'multi-instructions-chargeur',
    question: 'Les instructions du chargeur sont-elles systématiquement documentées ?',
    description: 'Instructions de manutention, température, positionnement.',
    type: 'boolean',
    category: 'Marchandises',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Instructions du chargeur',
      description: 'Les instructions protègent votre responsabilité.',
      actions: [
        'Demander les instructions par écrit',
        'Vérifier la faisabilité des instructions',
        'Transmettre les instructions aux opérateurs',
        'Documenter le respect des instructions'
      ]
    }
  },
  {
    id: 'multi-analyse-risques',
    question: 'Réalisez-vous une analyse des risques (vol, avarie, retard, perte) ?',
    description: 'Identification, évaluation, mesures de prévention.',
    type: 'boolean',
    category: 'Risques',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Analyse des risques',
      description: 'L\'analyse des risques permet d\'adapter les mesures.',
      actions: [
        'Identifier les risques par type de transport',
        'Évaluer la probabilité et l\'impact',
        'Définir des mesures de prévention',
        'Mettre à jour l\'analyse régulièrement'
      ]
    }
  },
  {
    id: 'multi-mesures-prevention',
    question: 'Des mesures de prévention sont-elles mises en place ?',
    description: 'Sécurisation, surveillance, conditionnement, traçabilité.',
    type: 'boolean',
    category: 'Risques',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Mesures de prévention',
      description: 'La prévention réduit la sinistralité.',
      actions: [
        'Mettre en place des mesures de sécurisation',
        'Adapter le conditionnement aux risques',
        'Tracer les marchandises tout au long du transport',
        'Sensibiliser le personnel aux risques'
      ]
    }
  }
];

// Section 6: Assurance et couverture des risques (5 questions)
const multimodalInsuranceQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-assurance-rc',
    question: 'Disposez-vous d\'une assurance RC transporteur multimodal ?',
    description: 'Couverture adaptée au transport multimodal, tous modes inclus.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Assurance RC multimodal',
      description: 'L\'assurance doit couvrir tous les modes utilisés.',
      actions: [
        'Vérifier que l\'assurance couvre tous les modes',
        'S\'assurer de la couverture géographique',
        'Adapter les garanties aux types de marchandises',
        'Mettre à jour le contrat annuellement'
      ]
    }
  },
  {
    id: 'multi-plafonds-garantie',
    question: 'Les plafonds de garantie sont-ils adaptés à votre activité ?',
    description: 'Montants suffisants, valeurs des marchandises, risques couverts.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Plafonds de garantie',
      description: 'Les plafonds doivent couvrir les risques réels.',
      actions: [
        'Évaluer les valeurs des marchandises transportées',
        'Vérifier l\'adéquation des plafonds',
        'Envisager des garanties complémentaires si nécessaire',
        'Réviser les plafonds annuellement'
      ]
    }
  },
  {
    id: 'multi-exclusions-garantie',
    question: 'Connaissez-vous les exclusions de garantie de votre assurance ?',
    description: 'Marchandises exclues, conditions non couvertes, limitations.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Exclusions de garantie',
      description: 'Connaître les exclusions évite les mauvaises surprises.',
      actions: [
        'Relire attentivement les conditions d\'assurance',
        'Lister les exclusions applicables',
        'Adapter les procédures pour éviter les exclusions',
        'Négocier des extensions si nécessaire'
      ]
    }
  },
  {
    id: 'multi-declaration-sinistres',
    question: 'Les sinistres sont-ils déclarés dans les délais contractuels ?',
    description: 'Délais de déclaration, documents à fournir, procédure.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Déclaration des sinistres',
      description: 'Le respect des délais conditionne l\'indemnisation.',
      actions: [
        'Connaître les délais de déclaration',
        'Préparer les documents requis',
        'Former le personnel à la procédure',
        'Suivre les dossiers jusqu\'à leur clôture'
      ]
    }
  },
  {
    id: 'multi-suivi-sinistres',
    question: 'Effectuez-vous un suivi statistique des sinistres ?',
    description: 'Analyse de la sinistralité, indicateurs, tendances.',
    type: 'boolean',
    category: 'Assurance',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Suivi statistique',
      description: 'L\'analyse permet d\'améliorer la prévention.',
      actions: [
        'Mettre en place des indicateurs de sinistralité',
        'Analyser les tendances périodiquement',
        'Identifier les causes récurrentes',
        'Adapter les mesures de prévention'
      ]
    }
  }
];

// Section 7: Gestion des sinistres et réclamations (5 questions)
const multimodalClaimsQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-procedure-sinistres',
    question: 'Disposez-vous d\'une procédure écrite de gestion des sinistres ?',
    description: 'Étapes, responsabilités, délais, documentation.',
    type: 'boolean',
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Procédure de gestion des sinistres',
      description: 'Une procédure claire accélère le traitement.',
      actions: [
        'Rédiger une procédure complète',
        'Définir les responsabilités de chaque acteur',
        'Fixer des délais pour chaque étape',
        'Former le personnel à la procédure'
      ]
    }
  },
  {
    id: 'multi-collecte-preuves',
    question: 'La collecte des preuves est-elle systématique ?',
    description: 'Photos, documents, témoignages, constats.',
    type: 'boolean',
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Collecte des preuves',
      description: 'Les preuves sont essentielles pour les recours.',
      actions: [
        'Photographier systématiquement les dommages',
        'Conserver tous les documents de transport',
        'Recueillir les témoignages si possible',
        'Établir des constats écrits'
      ]
    }
  },
  {
    id: 'multi-reclamations-clients',
    question: 'Le traitement des réclamations clients est-il organisé ?',
    description: 'Réception, analyse, réponse, suivi.',
    type: 'boolean',
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Traitement des réclamations',
      description: 'Un bon traitement préserve la relation client.',
      actions: [
        'Accuser réception des réclamations rapidement',
        'Analyser objectivement les réclamations',
        'Répondre dans des délais raisonnables',
        'Suivre la satisfaction post-traitement'
      ]
    }
  },
  {
    id: 'multi-recours-st',
    question: 'Exercez-vous les recours contre vos sous-traitants ?',
    description: 'Mise en cause, subrogation, délais de prescription.',
    type: 'boolean',
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Recours contre sous-traitants',
      description: 'Les recours permettent de limiter vos pertes.',
      actions: [
        'Identifier les sous-traitants responsables',
        'Respecter les délais de prescription',
        'Constituer des dossiers de recours complets',
        'Suivre les procédures jusqu\'à leur terme'
      ]
    }
  },
  {
    id: 'multi-archivage-sinistres',
    question: 'Les dossiers sinistres sont-ils archivés correctement ?',
    description: 'Conservation, accessibilité, durée légale.',
    type: 'boolean',
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Archivage des sinistres',
      description: 'L\'archivage est essentiel pour les recours et l\'analyse.',
      actions: [
        'Conserver les dossiers complets',
        'Respecter les durées de prescription',
        'Organiser un système de classement efficace',
        'Permettre une consultation rapide'
      ]
    }
  }
];

// Section 8: Amélioration continue et conformité (5 questions)
const multimodalImprovementQuestions: ConditionalQuestion[] = [
  {
    id: 'multi-veille-reglementaire',
    question: 'Effectuez-vous une veille réglementaire transport ?',
    description: 'Évolutions des conventions, nouvelles réglementations, jurisprudence.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Veille réglementaire',
      description: 'Le transport est un secteur très réglementé.',
      actions: [
        'S\'abonner aux publications officielles',
        'Suivre les évolutions des conventions',
        'Participer aux formations et colloques',
        'Adapter les procédures aux évolutions'
      ]
    }
  },
  {
    id: 'multi-formation-personnel',
    question: 'Le personnel reçoit-il une formation continue ?',
    description: 'Réglementations, procédures, sécurité, qualité.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formation continue',
      description: 'La formation maintient les compétences à jour.',
      actions: [
        'Identifier les besoins en formation',
        'Planifier des formations régulières',
        'Évaluer l\'efficacité des formations',
        'Documenter les formations suivies'
      ]
    }
  },
  {
    id: 'multi-analyse-incidents',
    question: 'Analysez-vous les incidents récurrents ?',
    description: 'Recherche des causes, tendances, actions préventives.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Analyse des incidents',
      description: 'L\'analyse permet d\'éviter la répétition.',
      actions: [
        'Recenser tous les incidents',
        'Identifier les causes récurrentes',
        'Définir des actions préventives',
        'Mesurer l\'efficacité des actions'
      ]
    }
  },
  {
    id: 'multi-actions-correctives',
    question: 'Les actions correctives sont-elles mises en œuvre et suivies ?',
    description: 'Plan d\'action, responsables, délais, vérification.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Actions correctives',
      description: 'Les actions correctives doivent être suivies.',
      actions: [
        'Formaliser les actions correctives',
        'Désigner des responsables et fixer des délais',
        'Suivre l\'avancement',
        'Vérifier l\'efficacité'
      ]
    }
  },
  {
    id: 'multi-plan-amelioration',
    question: 'Disposez-vous d\'un plan d\'amélioration continue ?',
    description: 'Objectifs, indicateurs, revue périodique, capitalisation.',
    type: 'boolean',
    category: 'Amélioration continue',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Plan d\'amélioration continue',
      description: 'Un plan structuré favorise le progrès.',
      actions: [
        'Définir des objectifs mesurables',
        'Mettre en place des indicateurs de suivi',
        'Organiser des revues périodiques',
        'Capitaliser sur les bonnes pratiques'
      ]
    }
  }
];

// ========================================
// SECTIONS QUESTIONNAIRE TRANSPORTEUR MULTIMODAL - 8 SECTIONS
// ========================================
const multimodalTransportSections: QuestionnaireSection[] = [
  {
    id: 'multi-identification',
    title: '1. Identification du transporteur',
    description: 'Raison sociale, modes exploités, statut juridique, licences',
    icon: 'building-2',
    questions: multimodalIdentificationQuestions
  },
  {
    id: 'multi-operations',
    title: '2. Organisation des opérations multimodales',
    description: 'Procédures, ruptures de charge, suivi, coordination, incidents',
    icon: 'route',
    questions: multimodalOperationsQuestions
  },
  {
    id: 'multi-contrats',
    title: '3. Contrats et documents de transport',
    description: 'Contrats types, conventions, réserves, archivage, délais',
    icon: 'file-text',
    questions: multimodalContractsQuestions
  },
  {
    id: 'multi-sous-traitance',
    title: '4. Sous-traitance',
    description: 'Encadrement, contrats, assurances, responsabilités, évaluation',
    icon: 'share-2',
    questions: multimodalSubcontractingQuestions
  },
  {
    id: 'multi-marchandises',
    title: '5. Marchandises et risques',
    description: 'Typologie, marchandises dangereuses, instructions, analyse des risques',
    icon: 'package',
    questions: multimodalGoodsRisksQuestions
  },
  {
    id: 'multi-assurance',
    title: '6. Assurance et couverture des risques',
    description: 'RC transporteur, plafonds, exclusions, déclarations, suivi',
    icon: 'shield-check',
    questions: multimodalInsuranceQuestions
  },
  {
    id: 'multi-sinistres',
    title: '7. Gestion des sinistres et réclamations',
    description: 'Procédures, preuves, réclamations, recours, archivage',
    icon: 'alert-triangle',
    questions: multimodalClaimsQuestions
  },
  {
    id: 'multi-amelioration',
    title: '8. Amélioration continue et conformité',
    description: 'Veille réglementaire, formation, analyse, actions correctives',
    icon: 'trending-up',
    questions: multimodalImprovementQuestions
  }
];

// ========================================
// Questions spécifiques ASSURANCE - Audit RGPD complet (40 questions)
// ========================================
const insuranceGovernanceQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-responsable-traitement',
    question: 'Avez-vous formalisé votre rôle de responsable de traitement et identifié vos co-responsables ?',
    description: 'Courtiers, délégataires de gestion, réassureurs peuvent être co-responsables ou sous-traitants.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser les responsabilités RGPD',
      description: 'En assurance, la chaîne de valeur est complexe. Clarifiez qui est responsable de quoi.',
      actions: [
        'Documenter votre statut de responsable de traitement',
        'Identifier les co-responsables (courtiers mandataires, délégataires)',
        'Distinguer sous-traitants et co-responsables selon le niveau d\'autonomie',
        'Formaliser les relations contractuelles RGPD avec chaque acteur'
      ],
      resources: [
        { label: 'Recommandation ACPR - Gouvernance données', url: 'https://acpr.banque-france.fr/' }
      ]
    }
  },
  {
    id: 'assur-registre-specifique',
    question: 'Tenez-vous un registre des traitements SPÉCIFIQUE à vos activités d\'assurance ?',
    description: 'Souscription, tarification, gestion sinistres, LCB-FT, marketing, fichiers mutualisés.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Registre adapté au secteur assurance',
      description: 'Le registre doit refléter les traitements réels : souscription, profilage, sinistres, LCB-FT.',
      actions: [
        'Recenser tous les traitements par branche (vie, IARD, santé)',
        'Documenter les fichiers sectoriels utilisés (AGIRA, FVA)',
        'Inclure les traitements LCB-FT et anti-fraude',
        'Préciser les bases légales spécifiques (contrat, obligation légale, intérêt légitime)'
      ]
    }
  },
  {
    id: 'assur-dpo-designe',
    question: 'Avez-vous désigné un DPO formellement déclaré à la CNIL ?',
    description: 'Obligatoire pour les traitements à grande échelle et le profilage systématique.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Désignation du DPO en assurance',
      description: 'Le DPO est obligatoire pour les assureurs traitant des données à grande échelle ou sensibles.',
      actions: [
        'Désigner un DPO interne ou externe avec l\'expertise requise',
        'Le déclarer à la CNIL via le formulaire en ligne',
        'Lui fournir les moyens nécessaires à ses missions',
        'Associer le DPO aux projets impliquant des données personnelles'
      ],
      resources: [
        { label: 'Formulaire désignation CNIL', url: 'https://www.cnil.fr/fr/designation-dpo' }
      ]
    }
  },
  {
    id: 'assur-formation-personnel',
    question: 'Vos collaborateurs reçoivent-ils une formation RGPD adaptée à leurs fonctions ?',
    description: 'Commerciaux, gestionnaires sinistres, IT, conformité ont des besoins différents.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formation RGPD par métier',
      description: 'Chaque fonction a des risques spécifiques : adaptez la formation.',
      actions: [
        'Former le réseau commercial sur le consentement et l\'information',
        'Sensibiliser les gestionnaires sinistres à la minimisation',
        'Former la conformité aux obligations LCB-FT et RGPD',
        'Tracer les formations et prévoir des rappels annuels'
      ]
    }
  },
  {
    id: 'assur-procedure-violation',
    question: 'Avez-vous une procédure écrite de gestion des violations de données ?',
    description: 'Ransomware, fuite de données clients, intrusion système : vous devez réagir en 72h.',
    type: 'boolean',
    category: 'Gouvernance RGPD',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédure de notification des violations',
      description: 'En cas de violation, vous devez notifier la CNIL dans les 72h et potentiellement les assurés.',
      actions: [
        'Rédiger une procédure avec chaîne d\'alerte claire',
        'Définir les critères de notification CNIL et aux personnes',
        'Préparer des modèles de notification',
        'Tester la procédure avec des exercices de crise'
      ],
      resources: [
        { label: 'Notification violations CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  }
];

// Section 2: Données clients & souscription (7 questions)
const insuranceClientQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-donnees-collectees',
    question: 'Avez-vous cartographié toutes les catégories de données collectées en souscription ?',
    description: 'Identité, patrimoine, santé, profession, habitudes de vie, données bancaires.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographie des données collectées',
      description: 'La souscription implique de nombreuses données. Assurez-vous de les connaître toutes.',
      actions: [
        'Recenser par produit toutes les données demandées',
        'Identifier les données sensibles (santé, infractions)',
        'Vérifier la pertinence de chaque donnée collectée',
        'Documenter les sources de données (déclarations, fichiers externes)'
      ]
    }
  },
  {
    id: 'assur-minimisation',
    question: 'Limitez-vous strictement la collecte aux données nécessaires à la souscription et tarification ?',
    description: 'Ne collectez pas "au cas où" : chaque donnée doit avoir une finalité précise.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Principe de minimisation',
      description: 'Ne collectez que les données strictement nécessaires à la finalité.',
      actions: [
        'Revoir les formulaires de souscription et supprimer les champs inutiles',
        'Justifier chaque donnée par une finalité précise',
        'Ne pas collecter de données "de précaution"',
        'Sensibiliser les commerciaux à ne pas surcollecter'
      ]
    }
  },
  {
    id: 'assur-donnees-sensibles',
    question: 'Pour les données sensibles (santé, infractions), avez-vous une base légale spécifique ?',
    description: 'Données de santé pour l\'assurance vie, antécédents pénaux pour l\'assurance auto.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Base légale pour données sensibles',
      description: 'Les données sensibles nécessitent une exception à l\'interdiction de traitement.',
      actions: [
        'Identifier toutes les données sensibles traitées',
        'Vérifier l\'exception applicable (consentement, exécution du contrat, intérêt public)',
        'Renforcer les mesures de sécurité pour ces données',
        'Limiter strictement l\'accès aux personnes habilitées'
      ]
    }
  },
  {
    id: 'assur-questionnaires-medicaux',
    question: 'Les questionnaires de santé respectent-ils la convention AERAS et le droit à l\'oubli ?',
    description: 'Assurance emprunteur : limitations strictes des questions médicales.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Convention AERAS et droit à l\'oubli',
      description: 'En assurance emprunteur, des règles strictes limitent les questions médicales.',
      actions: [
        'Appliquer le droit à l\'oubli pour les pathologies concernées',
        'Respecter les grilles de référence AERAS',
        'Ne pas demander d\'informations sur les pathologies "oubliables"',
        'Informer les candidats de leurs droits AERAS'
      ],
      resources: [
        { label: 'Convention AERAS', url: 'https://www.aeras-infos.fr/' }
      ]
    }
  },
  {
    id: 'assur-durees-conservation',
    question: 'Avez-vous défini des durées de conservation précises selon les types de contrats ?',
    description: 'Prescription biennale, décennale, trentenaire : les durées varient.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Durées de conservation en assurance',
      description: 'Les délais de prescription varient selon les risques et les sinistres.',
      actions: [
        'Définir les durées par type de contrat et de sinistre',
        'Prendre en compte les prescriptions légales (2, 10, 30 ans)',
        'Archiver ou détruire les données en fin de conservation',
        'Documenter les durées dans le registre des traitements'
      ]
    }
  },
  {
    id: 'assur-consentement-marketing',
    question: 'Recueillez-vous un consentement explicite pour la prospection commerciale ?',
    description: 'Le démarchage par email/SMS nécessite un consentement préalable (B2C).',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Consentement marketing',
      description: 'En B2C, le consentement préalable est requis pour le démarchage électronique.',
      actions: [
        'Distinguer le consentement marketing du contrat d\'assurance',
        'Proposer une case à cocher non pré-cochée',
        'Permettre le retrait facile du consentement',
        'Respecter les listes d\'opposition (Bloctel pour le téléphone)'
      ]
    }
  },
  {
    id: 'assur-information-clients',
    question: 'Informez-vous clairement les assurés sur le traitement de leurs données ?',
    description: 'Notice d\'information, conditions générales, site web : l\'information doit être accessible.',
    type: 'boolean',
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Information des assurés',
      description: 'L\'information doit être claire, concise et facilement accessible.',
      actions: [
        'Inclure une mention RGPD complète dans les conditions générales',
        'Publier une politique de confidentialité sur le site web',
        'Informer sur les fichiers sectoriels (AGIRA, anti-fraude)',
        'Préciser les droits et comment les exercer'
      ]
    }
  }
];

// Section 3: Profilage, scoring & décision automatisée (6 questions)
const insuranceProfilingQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-profilage-existence',
    question: 'Utilisez-vous des systèmes de profilage ou de scoring pour la tarification ?',
    description: 'Algorithmes de tarification, scoring risque, segmentation clients.',
    type: 'boolean',
    category: 'Profilage & scoring',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Identification du profilage',
      description: 'Le profilage doit être identifié et encadré. Il génère des obligations spécifiques.',
      actions: [
        'Recenser tous les systèmes de scoring et profilage',
        'Documenter les critères utilisés par les algorithmes',
        'Identifier les décisions produisant des effets significatifs',
        'Vérifier si une AIPD est nécessaire'
      ]
    },
    followUpQuestions: [
      {
        id: 'assur-profilage-types',
        question: 'Quels types de profilage utilisez-vous ?',
        type: 'multiselect',
        options: ['Scoring tarification', 'Scoring fraude', 'Segmentation marketing', 'Détection sinistres atypiques', 'Autre'],
        category: 'Profilage & scoring',
        showIf: { questionId: 'assur-profilage-existence', answer: true }
      }
    ]
  },
  {
    id: 'assur-aipd-profilage',
    question: 'Avez-vous réalisé une AIPD pour les traitements de profilage à grande échelle ?',
    description: 'Le profilage systématique avec effets significatifs impose une AIPD.',
    type: 'boolean',
    category: 'Profilage & scoring',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'AIPD obligatoire pour le profilage',
      description: 'Une analyse d\'impact est requise pour le profilage produisant des effets juridiques.',
      actions: [
        'Réaliser une AIPD pour chaque système de scoring impactant les assurés',
        'Évaluer la nécessité et la proportionnalité du traitement',
        'Identifier et atténuer les risques pour les droits des personnes',
        'Consulter le DPO et éventuellement la CNIL si risque résiduel élevé'
      ],
      resources: [
        { label: 'Guide AIPD CNIL', url: 'https://www.cnil.fr/fr/RGPD-analyse-impact-protection-des-donnees-aipd' }
      ]
    }
  },
  {
    id: 'assur-transparence-algorithmes',
    question: 'Informez-vous les assurés sur les critères utilisés pour le profilage et la tarification ?',
    description: 'Droit à l\'explication des décisions automatisées (article 22 RGPD).',
    type: 'boolean',
    category: 'Profilage & scoring',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Transparence algorithmique',
      description: 'Les assurés ont le droit de comprendre comment leurs données sont utilisées pour les décisions.',
      actions: [
        'Expliquer les catégories de données utilisées pour la tarification',
        'Indiquer les conséquences prévues du profilage',
        'Fournir une information accessible sur demande',
        'Ne pas invoquer le secret des affaires de manière abusive'
      ]
    }
  },
  {
    id: 'assur-intervention-humaine',
    question: 'Garantissez-vous une intervention humaine pour les décisions défavorables automatisées ?',
    description: 'Refus de souscription, résiliation, majoration : l\'assuré peut demander un réexamen humain.',
    type: 'boolean',
    category: 'Profilage & scoring',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Droit à l\'intervention humaine',
      description: 'Pour les décisions automatisées produisant des effets significatifs, un réexamen humain doit être possible.',
      actions: [
        'Identifier les décisions entièrement automatisées impactant les assurés',
        'Mettre en place un processus de réexamen humain sur demande',
        'Informer les assurés de ce droit dans les notices',
        'Former les équipes au traitement des contestations'
      ]
    }
  },
  {
    id: 'assur-detection-fraude',
    question: 'Utilisez-vous des systèmes de détection de fraude (scoring anti-fraude, fichiers mutualisés) ?',
    description: 'ALFA (assurance auto), fichiers internes de vigilance, algorithmes de détection.',
    type: 'boolean',
    category: 'Profilage & scoring',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrement de la lutte anti-fraude',
      description: 'Les fichiers anti-fraude sont soumis à des règles strictes d\'information et de droits.',
      actions: [
        'Vérifier les autorisations pour les fichiers mutualisés',
        'Informer les assurés de l\'inscription possible',
        'Permettre l\'exercice du droit d\'accès et de rectification',
        'Respecter les durées de conservation réglementaires'
      ]
    },
    followUpQuestions: [
      {
        id: 'assur-fraude-information',
        question: 'Les assurés sont-ils informés de l\'utilisation de ces systèmes anti-fraude ?',
        type: 'boolean',
        category: 'Profilage & scoring',
        showIf: { questionId: 'assur-detection-fraude', answer: true },
        isCritical: true,
        riskIfNo: 'moyen'
      }
    ]
  },
  {
    id: 'assur-fichiers-sectoriels',
    question: 'Utilisez-vous les fichiers sectoriels réglementés (AGIRA, FVA, fichiers sinistres) ?',
    description: 'Fichier des Véhicules Assurés, AGIRA résiliation, fichiers de sinistres corporels.',
    type: 'boolean',
    category: 'Profilage & scoring',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'partiellement_conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Fichiers sectoriels de l\'assurance',
      description: 'Ces fichiers mutualisés sont autorisés mais encadrés strictement.',
      actions: [
        'Vérifier votre adhésion aux conventions régissant ces fichiers',
        'Informer les assurés de l\'inscription et de leurs droits',
        'Former les équipes sur l\'utilisation licite de ces fichiers',
        'Documenter les consultations dans le registre'
      ],
      resources: [
        { label: 'AGIRA - Fichiers assurance', url: 'https://www.agira.asso.fr/' }
      ]
    }
  }
];

// Section 4: Réseau de distribution & intermédiaires (5 questions)
const insuranceDistributionQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-liste-intermediaires',
    question: 'Avez-vous une liste complète de vos intermédiaires (courtiers, agents, comparateurs) ?',
    description: 'Agents généraux, courtiers, mandataires, comparateurs en ligne, bancassureurs.',
    type: 'boolean',
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographie du réseau de distribution',
      description: 'Tous les intermédiaires accédant aux données doivent être identifiés et encadrés.',
      actions: [
        'Recenser tous les intermédiaires avec accès aux données clients',
        'Vérifier leur immatriculation ORIAS',
        'Classifier selon leur rôle RGPD (sous-traitant, co-responsable)',
        'Mettre à jour la liste régulièrement'
      ],
      resources: [
        { label: 'Registre ORIAS', url: 'https://www.orias.fr/' }
      ]
    }
  },
  {
    id: 'assur-contrats-intermediaires',
    question: 'Avez-vous des contrats RGPD (article 28 ou co-responsabilité) avec chaque intermédiaire ?',
    description: 'Le contrat doit préciser les obligations respectives en matière de données.',
    type: 'boolean',
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrats RGPD avec les intermédiaires',
      description: 'Selon le niveau d\'autonomie, un contrat de sous-traitance ou de co-responsabilité est requis.',
      actions: [
        'Analyser le rôle réel de chaque intermédiaire (autonomie décisionnelle)',
        'Rédiger des contrats adaptés (sous-traitance ou co-responsabilité)',
        'Inclure toutes les clauses obligatoires de l\'article 28',
        'Prévoir des audits et des pénalités en cas de non-conformité'
      ]
    }
  },
  {
    id: 'assur-courtiers-acces',
    question: 'Contrôlez-vous les accès des courtiers à vos systèmes et données clients ?',
    description: 'Portails extranet, API, accès aux outils de tarification et gestion.',
    type: 'boolean',
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrôle des accès intermédiaires',
      description: 'Les courtiers ne doivent accéder qu\'aux données nécessaires à leur mission.',
      actions: [
        'Mettre en place des comptes nominatifs pour chaque utilisateur courtier',
        'Limiter les accès au périmètre clients concernés',
        'Tracer tous les accès et les auditer régulièrement',
        'Révoquer les accès en fin de mandat ou de collaboration'
      ]
    }
  },
  {
    id: 'assur-delegataires-gestion',
    question: 'Encadrez-vous contractuellement les délégataires de gestion (TPA) sur le plan RGPD ?',
    description: 'Délégation de souscription, gestion sinistres, assistance : les TPA sont des sous-traitants.',
    type: 'boolean',
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Encadrement des délégataires',
      description: 'Les TPA (Third Party Administrators) traitent des données pour votre compte : ils sont sous-traitants.',
      actions: [
        'Vérifier l\'existence d\'un contrat de sous-traitance RGPD complet',
        'Auditer leurs pratiques de sécurité et de confidentialité',
        'S\'assurer qu\'ils ne sous-traitent pas sans autorisation',
        'Inclure des clauses de réversibilité et de suppression des données'
      ]
    }
  },
  {
    id: 'assur-comparateurs-donnees',
    question: 'Maîtrisez-vous les données transmises aux comparateurs en ligne ?',
    description: 'LesFurets, Assurland, LeLynx : quelles données partagez-vous et dans quel cadre ?',
    type: 'boolean',
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Comparateurs et données',
      description: 'Les comparateurs collectent des données qu\'ils vous transmettent : clarifiez les responsabilités.',
      actions: [
        'Vérifier les contrats avec les comparateurs (responsabilités respectives)',
        'S\'assurer que le comparateur informe correctement les prospects',
        'Limiter les données reçues au strict nécessaire',
        'Ne pas réutiliser les données à d\'autres fins sans base légale'
      ]
    }
  }
];

// Section 5: Gestion des sinistres & experts (5 questions)
const insuranceClaimsQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-sinistres-donnees',
    question: 'Avez-vous cartographié les données collectées lors de la gestion des sinistres ?',
    description: 'Données médicales, expertises, témoignages, photos, constats amiables.',
    type: 'boolean',
    category: 'Gestion sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Données en gestion sinistres',
      description: 'La gestion des sinistres implique de nombreuses données, parfois sensibles.',
      actions: [
        'Recenser par type de sinistre les données collectées',
        'Identifier les données sensibles (médicales, infractions)',
        'Appliquer le principe de minimisation',
        'Définir des durées de conservation adaptées'
      ]
    }
  },
  {
    id: 'assur-experts-contrats',
    question: 'Avez-vous des contrats RGPD avec tous vos experts (auto, habitation, médical) ?',
    description: 'Experts d\'assurance, médecins conseils, enquêteurs : ce sont des sous-traitants.',
    type: 'boolean',
    category: 'Gestion sinistres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrats avec les experts',
      description: 'Les experts traitent des données pour votre compte et doivent être encadrés.',
      actions: [
        'Vérifier l\'existence de contrats de sous-traitance avec chaque expert',
        'Inclure les clauses de confidentialité et de sécurité',
        'S\'assurer de leur conformité RGPD (politique de sécurité, formations)',
        'Auditer régulièrement leurs pratiques'
      ]
    }
  },
  {
    id: 'assur-transmission-securisee',
    question: 'Les pièces de sinistres sont-elles transmises de manière sécurisée ?',
    description: 'Portail sécurisé, chiffrement des emails, éviter les envois en clair.',
    type: 'boolean',
    category: 'Gestion sinistres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécurisation des échanges sinistres',
      description: 'Les documents de sinistres contiennent souvent des données sensibles.',
      actions: [
        'Mettre en place un portail sécurisé pour les dépôts de pièces',
        'Chiffrer les emails contenant des données personnelles',
        'Éviter les envois de données sensibles par email non sécurisé',
        'Former les gestionnaires aux bonnes pratiques'
      ]
    }
  },
  {
    id: 'assur-tiers-victimes',
    question: 'Informez-vous correctement les tiers (victimes, témoins) sur le traitement de leurs données ?',
    description: 'Les tiers non-clients ont aussi des droits RGPD.',
    type: 'boolean',
    category: 'Gestion sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Information des tiers',
      description: 'Victimes et témoins doivent être informés même s\'ils ne sont pas vos clients.',
      actions: [
        'Inclure une mention RGPD dans les courriers aux tiers',
        'Informer sur les finalités et la durée de conservation',
        'Préciser les droits et comment les exercer',
        'Adapter l\'information au contexte (sinistre corporel, matériel)'
      ]
    }
  },
  {
    id: 'assur-contentieux-conservation',
    question: 'Respectez-vous les durées de conservation spécifiques pour les dossiers contentieux ?',
    description: 'Prescription trentenaire pour le corporel, décennale pour le matériel.',
    type: 'boolean',
    category: 'Gestion sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Conservation des dossiers contentieux',
      description: 'Les délais de prescription varient selon la nature du sinistre et du contentieux.',
      actions: [
        'Définir des durées par type de contentieux',
        'Prendre en compte les prescriptions (2, 10, 30 ans)',
        'Archiver les dossiers clos selon ces durées',
        'Détruire ou anonymiser en fin de conservation'
      ]
    }
  }
];

// Section 6: Sous-traitants & partenaires (4 questions)
const insuranceSubcontractorsQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-cartographie-sous-traitants',
    question: 'Avez-vous une cartographie complète de vos sous-traitants (IT, call centers, hébergeurs) ?',
    description: 'Éditeurs logiciels, hébergeurs cloud, centres d\'appels, prestataires maintenance.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographie des sous-traitants',
      description: 'Tous les prestataires accédant aux données doivent être identifiés et contractualisés.',
      actions: [
        'Recenser tous les prestataires techniques et métiers',
        'Identifier ceux qui accèdent aux données personnelles',
        'Classifier par criticité et volume de données',
        'Mettre à jour la cartographie annuellement'
      ]
    }
  },
  {
    id: 'assur-contrats-sous-traitance',
    question: 'Tous vos sous-traitants ont-ils signé un contrat conforme à l\'article 28 du RGPD ?',
    description: 'Clauses obligatoires : instructions, confidentialité, sécurité, sous-traitance ultérieure.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Contrats de sous-traitance RGPD',
      description: 'L\'article 28 impose des clauses obligatoires dans les contrats avec les sous-traitants.',
      actions: [
        'Vérifier tous les contrats existants et les compléter si nécessaire',
        'Inclure les 8 clauses obligatoires de l\'article 28',
        'Prévoir des audits et des pénalités',
        'Gérer la chaîne de sous-traitance (sous-traitants de sous-traitants)'
      ]
    }
  },
  {
    id: 'assur-reassureurs-transferts',
    question: 'Encadrez-vous les transferts de données aux réassureurs, notamment hors UE ?',
    description: 'Les réassureurs reçoivent des données détaillées, parfois vers des pays tiers.',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Transferts aux réassureurs',
      description: 'Les réassureurs sont souvent co-responsables et peuvent être hors UE.',
      actions: [
        'Identifier tous les réassureurs et leur localisation',
        'Analyser leur rôle RGPD (co-responsable probable)',
        'Pour les transferts hors UE, mettre en place des garanties (CCT, BCR)',
        'Limiter les données transférées au strict nécessaire'
      ]
    }
  },
  {
    id: 'assur-prestataires-offshore',
    question: 'Maîtrisez-vous les prestataires offshore (call centers, back-office délocalisé) ?',
    description: 'Délocalisation de la gestion : quelles données sont traitées et où ?',
    type: 'boolean',
    category: 'Sous-traitants',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Prestataires offshore',
      description: 'La délocalisation de traitements implique des obligations de transfert hors UE.',
      actions: [
        'Identifier tous les prestataires offshore et les pays concernés',
        'Évaluer l\'adéquation du pays ou mettre en place des CCT',
        'Renforcer les mesures de sécurité contractuelles',
        'Auditer régulièrement ces prestataires'
      ]
    }
  }
];

// Section 7: LCB-FT & obligations réglementaires (4 questions)
const insuranceLcbFtQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-lcb-ft-procedures',
    question: 'Avez-vous des procédures KYC (Know Your Customer) formalisées et conformes RGPD ?',
    description: 'Identification, vérification d\'identité, connaissance client : obligations LCB-FT.',
    type: 'boolean',
    category: 'LCB-FT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Procédures KYC et RGPD',
      description: 'Les obligations LCB-FT imposent de collecter des données mais le RGPD s\'applique.',
      actions: [
        'Documenter les procédures KYC avec les bases légales RGPD',
        'Limiter la collecte au strict nécessaire réglementaire',
        'Distinguer les données LCB-FT des données commerciales',
        'Former les équipes aux deux réglementations'
      ]
    }
  },
  {
    id: 'assur-pep-filtrage',
    question: 'Effectuez-vous le filtrage des Personnes Politiquement Exposées (PEP) et des sanctions ?',
    description: 'Listes de sanctions, PEP, gel des avoirs : obligations de vigilance renforcée.',
    type: 'boolean',
    category: 'LCB-FT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Filtrage PEP et sanctions',
      description: 'Le filtrage est obligatoire mais doit respecter les droits RGPD.',
      actions: [
        'Utiliser des outils de filtrage certifiés et à jour',
        'Documenter les consultations et les résultats',
        'Former les équipes au traitement des alertes',
        'Informer les personnes concernées de ce traitement'
      ]
    }
  },
  {
    id: 'assur-conservation-vigilance',
    question: 'Conservez-vous les documents de vigilance 5 ans après la fin de la relation ?',
    description: 'Obligation légale de conservation des pièces KYC pendant 5 ans post-relation.',
    type: 'boolean',
    category: 'LCB-FT',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Conservation des documents de vigilance',
      description: 'Les pièces d\'identité et documents KYC doivent être conservés 5 ans après la fin de la relation.',
      actions: [
        'Mettre en place un système d\'archivage sécurisé',
        'Calculer automatiquement la date de fin de conservation',
        'Détruire les documents à l\'échéance',
        'Distinguer cette conservation de celle des contrats'
      ]
    }
  },
  {
    id: 'assur-declaration-tracfin',
    question: 'Avez-vous formalisé la procédure de déclaration de soupçon à TRACFIN ?',
    description: 'La déclaration est confidentielle : l\'assuré ne doit pas en être informé.',
    type: 'boolean',
    category: 'LCB-FT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Déclaration TRACFIN et RGPD',
      description: 'La déclaration de soupçon est une exception au droit d\'information et d\'accès.',
      actions: [
        'Formaliser la procédure de déclaration de soupçon',
        'Limiter l\'accès aux dossiers TRACFIN aux personnes habilitées',
        'Ne jamais informer le client qu\'une déclaration a été faite',
        'Documenter les bases légales excluant les droits RGPD'
      ]
    }
  }
];

// Section 8: Sécurité IT & cybersécurité (4 questions)
const insuranceSecurityQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-acces-si',
    question: 'Contrôlez-vous strictement les accès au système d\'information (habilitations, revue annuelle) ?',
    description: 'Comptes nominatifs, droits selon le besoin d\'en connaître, revue régulière.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Gestion des habilitations',
      description: 'L\'accès aux données doit être limité au strict nécessaire et régulièrement revu.',
      actions: [
        'Mettre en place des comptes nominatifs pour tous les utilisateurs',
        'Définir des profils d\'accès par fonction',
        'Révoquer les accès dès le départ d\'un collaborateur',
        'Réaliser une revue annuelle des habilitations'
      ]
    }
  },
  {
    id: 'assur-chiffrement-donnees',
    question: 'Les données sensibles sont-elles chiffrées au repos et en transit ?',
    description: 'Bases de données, fichiers, emails : le chiffrement protège en cas de fuite.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Chiffrement des données',
      description: 'Le chiffrement est une mesure de sécurité essentielle, surtout pour les données sensibles.',
      actions: [
        'Chiffrer les bases de données contenant des données sensibles',
        'Utiliser TLS pour tous les échanges',
        'Chiffrer les postes de travail et supports amovibles',
        'Gérer les clés de chiffrement de manière sécurisée'
      ]
    }
  },
  {
    id: 'assur-plan-continuite',
    question: 'Disposez-vous d\'un plan de continuité et de reprise d\'activité (PCA/PRA) testé ?',
    description: 'En cas de sinistre majeur, pouvez-vous continuer à servir vos assurés ?',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Plan de continuité d\'activité',
      description: 'Le PCA/PRA garantit la disponibilité des données et services en cas de sinistre.',
      actions: [
        'Documenter le PCA/PRA incluant les systèmes critiques',
        'Réaliser des sauvegardes régulières et les tester',
        'Définir des RTO/RPO adaptés aux besoins métiers',
        'Tester le PRA au moins une fois par an'
      ]
    }
  },
  {
    id: 'assur-gestion-incidents',
    question: 'Avez-vous une procédure de gestion des incidents de sécurité avec notification CNIL ?',
    description: 'Détection, qualification, notification : vous avez 72h pour notifier à la CNIL.',
    type: 'boolean',
    category: 'Sécurité IT',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Gestion des incidents cyber',
      description: 'La gestion des incidents doit intégrer les obligations de notification RGPD.',
      actions: [
        'Formaliser la procédure de détection et qualification des incidents',
        'Intégrer le DPO dans la chaîne d\'alerte',
        'Préparer les modèles de notification CNIL et aux personnes',
        'Réaliser des exercices de crise cyber'
      ],
      resources: [
        { label: 'Notification violations CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  }
];

// ========================================
// QUESTIONNAIRE RGPD DIAGNOSTIC GLOBAL - ASSURANCE
// 8 Modules, 38 questions - Auto-évaluation structurée
// ========================================

// Module 1 - Organisation et pilotage des données (6 questions)
const insuranceDiagOrganisationQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-responsable-traitement',
    question: 'Avez-vous identifié un responsable des données personnelles pour vos principales activités ?',
    description: 'Le responsable de traitement doit être clairement identifié pour chaque activité.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Identifier le responsable de traitement',
      description: 'Le responsable détermine les finalités et moyens du traitement.',
      actions: [
        'Identifier formellement le responsable pour chaque traitement',
        'Documenter cette identification dans le registre',
        'Clarifier les co-responsabilités éventuelles (courtiers, délégataires)',
        'Informer les parties prenantes de cette organisation'
      ]
    }
  },
  {
    id: 'assur-diag-dpo-referent',
    question: 'Avez-vous désigné un DPO ou un référent RGPD ?',
    description: 'Le DPO est obligatoire pour les organismes traitant des données sensibles à grande échelle.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Désignation du DPO',
      description: 'Le DPO conseille, contrôle et coopère avec l\'autorité de contrôle.',
      actions: [
        'Évaluer l\'obligation de désigner un DPO',
        'Choisir un DPO interne, externe ou mutualisé',
        'Déclarer le DPO auprès de la CNIL',
        'Lui fournir les moyens d\'exercer ses missions'
      ],
      resources: [
        { label: 'Guide CNIL - Désigner un DPO', url: 'https://www.cnil.fr/fr/designer-un-dpo' }
      ]
    }
  },
  {
    id: 'assur-diag-procedures-ecrites',
    question: 'Disposez-vous de procédures écrites RGPD (politique, charte, modes opératoires) ?',
    description: 'La documentation écrite formalise les règles et facilite la conformité.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formaliser les procédures RGPD',
      description: 'Des procédures écrites assurent la cohérence et la traçabilité.',
      actions: [
        'Rédiger une politique de protection des données',
        'Créer des modes opératoires pour les traitements courants',
        'Établir une charte d\'utilisation des données',
        'Former le personnel à ces procédures'
      ]
    }
  },
  {
    id: 'assur-diag-procedure-violation',
    question: 'Avez-vous une procédure de gestion des violations de données (détection, analyse, notification, registre) ?',
    description: 'Les violations doivent être notifiées à la CNIL dans les 72h si risque pour les personnes.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Gérer les violations de données',
      description: 'Une procédure claire permet de réagir rapidement et correctement.',
      actions: [
        'Définir la chaîne d\'alerte interne',
        'Établir les critères de notification CNIL',
        'Préparer des modèles de notification',
        'Tenir un registre des violations'
      ],
      resources: [
        { label: 'Notification violations CNIL', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' }
      ]
    }
  },
  {
    id: 'assur-diag-registre-jour',
    question: 'Disposez-vous d\'un registre des activités de traitement à jour ?',
    description: 'Le registre est obligatoire et doit être maintenu à jour.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Organisation',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Tenir le registre des traitements',
      description: 'Le registre recense tous les traitements de données personnelles.',
      actions: [
        'Lister tous les traitements existants',
        'Documenter finalités, catégories de données, destinataires',
        'Préciser les durées de conservation',
        'Mettre à jour le registre régulièrement'
      ],
      resources: [
        { label: 'Modèle CNIL de registre', url: 'https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement' }
      ]
    }
  },
  {
    id: 'assur-diag-roles-formalises',
    question: 'Les rôles et responsabilités en matière de protection des données sont-ils formalisés (direction, DPO, métiers, IT) ?',
    description: 'Chaque acteur doit connaître son rôle dans la protection des données.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Organisation',
    isCritical: false,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Formaliser les rôles',
      description: 'Une organisation claire évite les lacunes et doublons.',
      actions: [
        'Définir les responsabilités de chaque fonction',
        'Formaliser dans une matrice RACI',
        'Communiquer les rôles à tous les collaborateurs',
        'Réviser l\'organisation régulièrement'
      ]
    }
  }
];

// Module 2 - Données clients et prospects (6 questions)
const insuranceDiagClientsQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-collecte-clients',
    question: 'Collectez-vous des données clients ou prospects ?',
    description: 'Toute collecte de données personnelles doit être encadrée.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données clients',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer la collecte',
      description: 'La collecte doit être loyale, licite et transparente.',
      actions: [
        'Identifier tous les points de collecte',
        'Vérifier la légitimité de chaque collecte',
        'Documenter les sources de données',
        'Informer les personnes concernées'
      ]
    }
  },
  {
    id: 'assur-diag-minimisation',
    question: 'Limitez-vous la collecte aux données nécessaires aux finalités poursuivies ?',
    description: 'Le principe de minimisation impose de ne collecter que le nécessaire.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Appliquer la minimisation',
      description: 'Ne collectez que les données strictement nécessaires.',
      actions: [
        'Revoir les formulaires de collecte',
        'Supprimer les champs non nécessaires',
        'Justifier chaque donnée par une finalité',
        'Sensibiliser les équipes commerciales'
      ]
    }
  },
  {
    id: 'assur-diag-information-clients',
    question: 'Informez-vous clairement les clients et prospects (mentions d\'information complètes) ?',
    description: 'L\'information doit être claire, accessible et complète.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Informer les personnes',
      description: 'L\'information est un droit fondamental des personnes.',
      actions: [
        'Rédiger des mentions d\'information complètes',
        'Les afficher sur tous les points de collecte',
        'Adapter le niveau de détail au contexte',
        'Vérifier l\'accessibilité de l\'information'
      ]
    }
  },
  {
    id: 'assur-diag-prospection',
    question: 'Réalisez-vous des actions de prospection commerciale ?',
    description: 'La prospection est encadrée par le RGPD et le Code des postes et communications.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données clients',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer la prospection',
      description: 'La prospection B2C nécessite généralement le consentement.',
      actions: [
        'Distinguer prospection B2B et B2C',
        'Recueillir le consentement pour la prospection électronique',
        'Gérer les listes d\'opposition',
        'Documenter les bases légales utilisées'
      ]
    }
  },
  {
    id: 'assur-diag-base-legale',
    question: 'Avez-vous défini la base légale pour chaque traitement (contrat, obligation légale, consentement, intérêt légitime) ?',
    description: 'Chaque traitement doit reposer sur une base légale valide.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Définir les bases légales',
      description: 'La base légale conditionne les droits des personnes.',
      actions: [
        'Identifier la base légale appropriée pour chaque traitement',
        'Documenter le choix dans le registre',
        'Adapter l\'information aux personnes',
        'Réviser les bases légales si les traitements évoluent'
      ]
    }
  },
  {
    id: 'assur-diag-droits-opposition',
    question: 'Gérez-vous les droits d\'opposition et de retrait du consentement (désinscription, refus de prospection) ?',
    description: 'Les personnes peuvent s\'opposer au traitement ou retirer leur consentement.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données clients',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Gérer les droits',
      description: 'Les demandes doivent être traitées dans le délai d\'un mois.',
      actions: [
        'Mettre en place un processus de traitement des demandes',
        'Former les équipes à la gestion des droits',
        'Prévoir un lien de désinscription dans les communications',
        'Tenir un registre des demandes traitées'
      ]
    }
  }
];

// Module 3 - Données sensibles et conservation (5 questions)
const insuranceDiagSensiblesQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-donnees-sensibles',
    question: 'Traitez-vous des données sensibles (santé, infractions, données biométriques, opinions, etc.) ?',
    description: 'Les données sensibles bénéficient d\'une protection renforcée.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données sensibles',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Identifier les données sensibles',
      description: 'Les données sensibles sont listées à l\'article 9 du RGPD.',
      actions: [
        'Recenser les données sensibles traitées',
        'Vérifier les exceptions applicables',
        'Renforcer la sécurité de ces données',
        'Limiter strictement les accès'
      ]
    }
  },
  {
    id: 'assur-diag-base-legale-sensibles',
    question: 'Avez-vous une base légale pour ces données (consentement explicite, obligation légale, etc.) ?',
    description: 'Le traitement de données sensibles est interdit sauf exception.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données sensibles',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Base légale pour données sensibles',
      description: 'L\'exception doit être documentée et justifiée.',
      actions: [
        'Identifier l\'exception applicable pour chaque traitement',
        'Recueillir le consentement explicite si nécessaire',
        'Documenter la justification',
        'Revoir régulièrement les bases légales'
      ]
    }
  },
  {
    id: 'assur-diag-durees-conservation',
    question: 'Avez-vous défini des durées de conservation par type de données et par finalité ?',
    description: 'Les données ne peuvent être conservées indéfiniment.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données sensibles',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Définir les durées de conservation',
      description: 'Les durées doivent être proportionnées aux finalités.',
      actions: [
        'Établir un référentiel des durées de conservation',
        'Distinguer archive courante, intermédiaire, définitive',
        'Documenter les durées dans le registre',
        'Prévoir des processus d\'archivage et de purge'
      ]
    }
  },
  {
    id: 'assur-diag-suppression-anonymisation',
    question: 'Supprimez-vous ou anonymisez-vous les données à l\'issue des durées de conservation ?',
    description: 'L\'effacement ou l\'anonymisation doit être effectif.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données sensibles',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Purger les données',
      description: 'L\'effacement doit être irréversible.',
      actions: [
        'Mettre en place des processus de purge automatique',
        'Vérifier l\'effectivité de la suppression',
        'Documenter les opérations de purge',
        'Former les équipes à l\'importance de la purge'
      ]
    }
  },
  {
    id: 'assur-diag-securite-renforcee',
    question: 'Les mesures de sécurité sont-elles renforcées pour ces données (accès restreints, chiffrement, etc.) ?',
    description: 'Les données sensibles nécessitent des mesures de sécurité spécifiques.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Données sensibles',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Renforcer la sécurité',
      description: 'La protection doit être proportionnée à la sensibilité.',
      actions: [
        'Chiffrer les données sensibles',
        'Limiter les accès aux seules personnes habilitées',
        'Mettre en place une traçabilité des accès',
        'Auditer régulièrement les mesures de sécurité'
      ]
    }
  }
];

// Module 4 - Décisions automatisées, scoring et fraude (5 questions)
const insuranceDiagDecisionsQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-scoring',
    question: 'Utilisez-vous des outils de scoring ou tarification automatisée ?',
    description: 'Le profilage et les décisions automatisées sont encadrés par le RGPD.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Décisions automatisées',
    isCritical: true,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer le scoring',
      description: 'Le scoring doit être transparent et non discriminatoire.',
      actions: [
        'Identifier tous les outils de scoring utilisés',
        'Documenter les critères et la logique utilisés',
        'Vérifier l\'absence de discrimination',
        'Informer les personnes concernées'
      ]
    }
  },
  {
    id: 'assur-diag-information-decisions',
    question: 'Informez-vous les personnes concernées de l\'existence de décisions automatisées les concernant ?',
    description: 'L\'information sur les décisions automatisées est obligatoire.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Décisions automatisées',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Informer sur les décisions automatisées',
      description: 'Les personnes doivent comprendre la logique sous-jacente.',
      actions: [
        'Mentionner l\'existence de décisions automatisées',
        'Expliquer la logique utilisée de manière compréhensible',
        'Indiquer les conséquences pour la personne',
        'Prévoir un contact pour les questions'
      ]
    }
  },
  {
    id: 'assur-diag-intervention-humaine',
    question: 'Une intervention humaine est-elle possible sur ces décisions (revue, recours, explications) ?',
    description: 'Le droit à l\'intervention humaine permet de contester les décisions automatisées.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Décisions automatisées',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Garantir l\'intervention humaine',
      description: 'Les personnes peuvent demander une revue humaine.',
      actions: [
        'Prévoir une procédure de recours',
        'Former les équipes à expliquer les décisions',
        'Documenter les demandes d\'intervention humaine',
        'Réviser les décisions contestées'
      ]
    }
  },
  {
    id: 'assur-diag-outils-fraude',
    question: 'Utilisez-vous des outils ou fichiers anti-fraude ?',
    description: 'Les traitements anti-fraude sont légitimes mais encadrés.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Décisions automatisées',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer l\'anti-fraude',
      description: 'L\'anti-fraude doit respecter les droits des personnes.',
      actions: [
        'Documenter les outils anti-fraude utilisés',
        'Vérifier la base légale du traitement',
        'Informer les personnes de l\'existence de ces traitements',
        'Prévoir des garanties pour les personnes injustement signalées'
      ]
    }
  },
  {
    id: 'assur-diag-aipd-decisions',
    question: 'Avez-vous évalué les impacts de ces traitements automatisés sur les droits et libertés des personnes (AIPD si nécessaire) ?',
    description: 'Une AIPD peut être obligatoire pour le profilage à grande échelle.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Décisions automatisées',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Réaliser une AIPD',
      description: 'L\'AIPD est obligatoire pour les traitements à risque élevé.',
      actions: [
        'Évaluer la nécessité d\'une AIPD',
        'Analyser les risques pour les personnes',
        'Identifier les mesures d\'atténuation',
        'Consulter la CNIL si risque résiduel élevé'
      ],
      resources: [
        { label: 'Guide AIPD CNIL', url: 'https://www.cnil.fr/fr/RGPD-analyse-impact-protection-des-donnees-aipd' }
      ]
    }
  }
];

// Module 5 - Réseau de distribution et intermédiaires (5 questions)
const insuranceDiagDistributionQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-courtiers-partenaires',
    question: 'Travaillez-vous avec des courtiers, partenaires ou intermédiaires qui accèdent à des données personnelles ?',
    description: 'Les partenaires accédant aux données doivent être encadrés contractuellement.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Distribution',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Identifier les partenaires',
      description: 'Tous les accès aux données doivent être recensés.',
      actions: [
        'Lister tous les partenaires accédant aux données',
        'Qualifier leur statut (co-responsable, sous-traitant)',
        'Documenter les flux de données',
        'Réviser régulièrement la liste des partenaires'
      ]
    }
  },
  {
    id: 'assur-diag-acces-partenaires',
    question: 'Ces partenaires ont-ils accès à vos données ?',
    description: 'L\'accès aux données doit être limité au strict nécessaire.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Distribution',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Contrôler les accès',
      description: 'Chaque accès doit être justifié et tracé.',
      actions: [
        'Définir les accès nécessaires pour chaque partenaire',
        'Limiter les accès au strict nécessaire',
        'Mettre en place une traçabilité',
        'Réviser les accès régulièrement'
      ]
    }
  },
  {
    id: 'assur-diag-responsabilites-contractuelles',
    question: 'Les responsabilités (responsable conjoint, sous-traitant) sont-elles définies contractuellement ?',
    description: 'Le contrat doit clarifier les rôles et responsabilités RGPD.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser les responsabilités',
      description: 'Les contrats doivent inclure les clauses RGPD obligatoires.',
      actions: [
        'Qualifier chaque relation (responsable, co-responsable, sous-traitant)',
        'Rédiger les clauses adaptées au statut',
        'Mettre à jour les contrats existants',
        'Suivre les engagements contractuels'
      ]
    }
  },
  {
    id: 'assur-diag-clauses-protection',
    question: 'Les clauses de protection des données (confidentialité, sécurité, sous-traitance, assistance) sont-elles intégrées aux contrats ?',
    description: 'Les clauses doivent couvrir toutes les obligations du RGPD.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Clauses contractuelles',
      description: 'Les clauses doivent être complètes et à jour.',
      actions: [
        'Intégrer les clauses de confidentialité',
        'Prévoir les mesures de sécurité attendues',
        'Encadrer la sous-traitance ultérieure',
        'Prévoir l\'assistance en cas de contrôle ou de demande de droits'
      ]
    }
  },
  {
    id: 'assur-diag-acces-techniques',
    question: 'Les accès techniques (portails, interfaces, partages de fichiers) sont-ils contrôlés et tracés ?',
    description: 'Les accès techniques doivent être sécurisés et audités.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Distribution',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Sécuriser les accès techniques',
      description: 'Les accès doivent être authentifiés, autorisés et tracés.',
      actions: [
        'Mettre en place une authentification forte',
        'Gérer les habilitations par profil',
        'Tracer tous les accès et actions',
        'Auditer régulièrement les journaux'
      ]
    }
  }
];

// Module 6 - Gestion des sinistres et experts (5 questions)
const insuranceDiagSinistresQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-donnees-sinistres',
    question: 'Collectez-vous des données lors de la gestion des sinistres ?',
    description: 'La gestion des sinistres implique souvent des données sensibles.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sinistres',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer la gestion des sinistres',
      description: 'Les données collectées doivent être proportionnées.',
      actions: [
        'Recenser les catégories de données collectées',
        'Vérifier la proportionnalité de la collecte',
        'Limiter l\'accès aux gestionnaires concernés',
        'Définir les durées de conservation'
      ]
    }
  },
  {
    id: 'assur-diag-experts-enqueteurs',
    question: 'Travaillez-vous avec des experts ou enquêteurs ou prestataires externes dans ce cadre ?',
    description: 'Les tiers intervenant sur les sinistres doivent être encadrés.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sinistres',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer les experts',
      description: 'Les experts doivent respecter les règles de confidentialité.',
      actions: [
        'Identifier tous les experts et prestataires',
        'Vérifier leurs engagements de confidentialité',
        'Limiter les informations transmises au nécessaire',
        'Suivre les accès aux dossiers sinistres'
      ]
    }
  },
  {
    id: 'assur-diag-echanges-securises',
    question: 'Les échanges de données avec ces tiers sont-ils sécurisés (canaux chiffrés, accès restreints, mots de passe) ?',
    description: 'La sécurité des échanges est essentielle pour les données sensibles.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Sécuriser les échanges',
      description: 'Les données doivent être protégées en transit.',
      actions: [
        'Utiliser des canaux chiffrés pour les échanges',
        'Protéger les fichiers par mot de passe',
        'Éviter les envois par email non sécurisé',
        'Privilégier les plateformes sécurisées d\'échange'
      ]
    }
  },
  {
    id: 'assur-diag-information-sinistres',
    question: 'Informez-vous les assurés et les tiers concernés de ces traitements et de ces partages de données ?',
    description: 'L\'information doit couvrir les transmissions à des tiers.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Informer sur les partages',
      description: 'Les personnes doivent savoir à qui leurs données sont transmises.',
      actions: [
        'Mentionner les catégories de destinataires',
        'Expliquer les finalités des transmissions',
        'Actualiser les mentions d\'information',
        'Informer lors de la déclaration de sinistre'
      ]
    }
  },
  {
    id: 'assur-diag-engagements-tiers',
    question: 'Les conventions ou contrats prévoient-ils des engagements de confidentialité et de sécurité pour ces tiers ?',
    description: 'Les engagements contractuels sont la garantie du respect des règles.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sinistres',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Formaliser les engagements',
      description: 'Les contrats doivent inclure les clauses de protection des données.',
      actions: [
        'Vérifier les clauses de confidentialité',
        'Exiger des mesures de sécurité appropriées',
        'Prévoir des audits si nécessaire',
        'Actualiser les contrats existants'
      ]
    }
  }
];

// Module 7 - Ressources humaines et recrutement (5 questions)
const insuranceDiagRHQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-dossiers-salaries',
    question: 'Gérez-vous des dossiers salariés (contrats, paie, évaluations, disciplinaire, etc.) ?',
    description: 'Les données RH sont sensibles et protégées.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Ressources humaines',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Gérer les données RH',
      description: 'Les données des salariés nécessitent une attention particulière.',
      actions: [
        'Recenser les catégories de données RH traitées',
        'Définir les accès par fonction',
        'Sécuriser les dossiers papier et numériques',
        'Informer les salariés de leurs droits'
      ]
    }
  },
  {
    id: 'assur-diag-cv-candidatures',
    question: 'Conservez-vous des CV et candidatures (spontanées ou réponses à annonces) ?',
    description: 'La conservation des candidatures est limitée dans le temps.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Ressources humaines',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Gérer les candidatures',
      description: 'Les CV ne doivent pas être conservés indéfiniment.',
      actions: [
        'Définir une durée de conservation (max 2 ans recommandé)',
        'Informer les candidats de la conservation',
        'Supprimer les candidatures non retenues',
        'Obtenir le consentement pour une conservation prolongée'
      ]
    }
  },
  {
    id: 'assur-diag-durees-rh',
    question: 'Avez-vous défini des durées de conservation pour les dossiers RH et les candidatures ?',
    description: 'Les durées doivent être proportionnées et respectées.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Ressources humaines',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Définir les durées RH',
      description: 'Certaines durées sont imposées par le droit du travail.',
      actions: [
        'Respecter les durées légales (paie : 5 ans, contrat : 5 ans après départ)',
        'Définir les durées pour les autres documents',
        'Mettre en place des processus de purge',
        'Archiver les dossiers selon les règles'
      ]
    }
  },
  {
    id: 'assur-diag-acces-rh',
    question: 'Les accès aux dossiers RH (papier et numérique) sont-ils limités aux seules personnes habilitées ?',
    description: 'Les données RH sont confidentielles.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Ressources humaines',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Restreindre les accès RH',
      description: 'Seuls les RH et managers concernés doivent accéder aux dossiers.',
      actions: [
        'Définir les profils d\'accès',
        'Sécuriser les armoires et bureaux',
        'Gérer les droits d\'accès informatiques',
        'Auditer régulièrement les accès'
      ]
    }
  },
  {
    id: 'assur-diag-information-salaries',
    question: 'Les salariés sont-ils informés de l\'utilisation de leurs données (mentions, notes d\'information, règlement intérieur) ?',
    description: 'L\'information des salariés est obligatoire.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Ressources humaines',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Informer les salariés',
      description: 'Les salariés doivent connaître les traitements les concernant.',
      actions: [
        'Rédiger une note d\'information RH',
        'Intégrer les mentions dans le règlement intérieur',
        'Informer sur les outils de surveillance éventuels',
        'Préciser les droits des salariés'
      ]
    }
  }
];

// Module 8 - Locaux, sécurité et systèmes informatiques (5 questions)
const insuranceDiagSecuriteQuestions: ConditionalQuestion[] = [
  {
    id: 'assur-diag-videosurveillance',
    question: 'Utilisez-vous des caméras de surveillance (vidéoprotection) dans ou autour des locaux ?',
    description: 'La vidéosurveillance est encadrée par le RGPD et le Code de la sécurité intérieure.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sécurité',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer la vidéosurveillance',
      description: 'L\'information et les formalités sont obligatoires.',
      actions: [
        'Informer par affichage visible',
        'Déclarer à la préfecture si espaces publics',
        'Limiter la conservation (30 jours max généralement)',
        'Consulter le CSE si applicable'
      ]
    }
  },
  {
    id: 'assur-diag-badges-visiteurs',
    question: 'Gérez-vous des badges, registres visiteurs ou autres dispositifs de contrôle d\'accès physique ?',
    description: 'Les dispositifs de contrôle d\'accès traitent des données personnelles.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sécurité',
    isCritical: false,
    riskIfNo: 'faible',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'conforme' },
    guidance: {
      title: 'Encadrer le contrôle d\'accès',
      description: 'Les données de badgeage sont des données personnelles.',
      actions: [
        'Informer les personnes concernées',
        'Définir les durées de conservation',
        'Limiter l\'accès aux données de badgeage',
        'Sécuriser les registres visiteurs'
      ]
    }
  },
  {
    id: 'assur-diag-hebergement',
    question: 'Savez-vous où sont hébergées les données (pays, type d\'hébergement, cloud, sous-traitants) ?',
    description: 'La localisation des données est essentielle pour la conformité.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'moyen',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'partiellement_conforme' },
    guidance: {
      title: 'Cartographier l\'hébergement',
      description: 'Les transferts hors UE nécessitent des garanties spécifiques.',
      actions: [
        'Recenser tous les lieux d\'hébergement',
        'Identifier les transferts hors UE',
        'Vérifier les garanties (clauses contractuelles, décisions d\'adéquation)',
        'Documenter dans le registre'
      ]
    }
  },
  {
    id: 'assur-diag-cybersecurite',
    question: 'Avez-vous mis en place des mesures de cybersécurité (antivirus, pare-feu, mots de passe robustes, mises à jour, sauvegardes) ?',
    description: 'La sécurité des systèmes est une obligation du RGPD.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Renforcer la cybersécurité',
      description: 'Des mesures techniques adaptées sont obligatoires.',
      actions: [
        'Installer et maintenir antivirus et pare-feu',
        'Imposer des mots de passe robustes',
        'Appliquer les mises à jour de sécurité',
        'Réaliser des sauvegardes régulières testées'
      ]
    }
  },
  {
    id: 'assur-diag-droits-acces-revises',
    question: 'Les droits d\'accès aux systèmes sont-ils gérés et révisés régulièrement (entrées/sorties, changements de poste) ?',
    description: 'La gestion des habilitations est essentielle pour la sécurité.',
    type: 'select',
    options: ['Oui', 'Partiellement', 'Non'],
    category: 'Sécurité',
    isCritical: true,
    riskIfNo: 'eleve',
    suggestedStatus: { ifYes: 'conforme', ifNo: 'non_conforme' },
    guidance: {
      title: 'Gérer les habilitations',
      description: 'Les droits doivent être proportionnés et à jour.',
      actions: [
        'Définir les profils de droits par fonction',
        'Créer/supprimer les comptes aux entrées/sorties',
        'Réviser les droits lors des changements de poste',
        'Auditer régulièrement les habilitations'
      ]
    }
  }
];

// ========================================
// Sections du questionnaire diagnostic global assurance
// ========================================
const insuranceDiagnosticSections: QuestionnaireSection[] = [
  {
    id: 'assur-diag-organisation',
    title: '1. Organisation et pilotage des données',
    description: 'Responsable, DPO, procédures, registre, rôles et responsabilités',
    icon: 'building-2',
    questions: insuranceDiagOrganisationQuestions
  },
  {
    id: 'assur-diag-clients',
    title: '2. Données clients et prospects',
    description: 'Collecte, minimisation, information, prospection, bases légales, droits',
    icon: 'users',
    questions: insuranceDiagClientsQuestions
  },
  {
    id: 'assur-diag-sensibles',
    title: '3. Données sensibles et conservation',
    description: 'Identification, base légale, durées, purge, sécurité renforcée',
    icon: 'shield-alert',
    questions: insuranceDiagSensiblesQuestions
  },
  {
    id: 'assur-diag-decisions',
    title: '4. Décisions automatisées, scoring et fraude',
    description: 'Scoring, information, intervention humaine, anti-fraude, AIPD',
    icon: 'brain',
    questions: insuranceDiagDecisionsQuestions
  },
  {
    id: 'assur-diag-distribution',
    title: '5. Réseau de distribution et intermédiaires',
    description: 'Courtiers, partenaires, responsabilités, clauses, accès techniques',
    icon: 'share-2',
    questions: insuranceDiagDistributionQuestions
  },
  {
    id: 'assur-diag-sinistres',
    title: '6. Gestion des sinistres et experts',
    description: 'Données sinistres, experts, échanges sécurisés, information, contrats',
    icon: 'file-warning',
    questions: insuranceDiagSinistresQuestions
  },
  {
    id: 'assur-diag-rh',
    title: '7. Ressources humaines et recrutement',
    description: 'Dossiers salariés, candidatures, durées, accès, information',
    icon: 'user-cog',
    questions: insuranceDiagRHQuestions
  },
  {
    id: 'assur-diag-securite',
    title: '8. Locaux, sécurité et systèmes informatiques',
    description: 'Vidéosurveillance, contrôle accès, hébergement, cybersécurité, habilitations',
    icon: 'lock',
    questions: insuranceDiagSecuriteQuestions
  }
];

// Variables vides pour compatibilité (les anciennes questions sont remplacées)
const lifeInsuranceQuestions: ConditionalQuestion[] = [];
const nonLifeInsuranceQuestions: ConditionalQuestion[] = [];

// ========================================
// Construction des questionnaires par secteur
// ========================================
const commonSections: QuestionnaireSection[] = [
  {
    id: 'gouvernance',
    title: 'Gouvernance RGPD',
    description: 'Questions sur l\'organisation de la conformité',
    icon: 'shield',
    questions: commonCriticalQuestions.filter(q => q.category === 'Gouvernance RGPD')
  },
  {
    id: 'documentation',
    title: 'Documentation obligatoire',
    description: 'Registres et politiques requis par le RGPD',
    icon: 'file-text',
    questions: commonCriticalQuestions.filter(q => q.category === 'Documentation' || q.category === 'Transparence')
  },
  {
    id: 'droits',
    title: 'Droits des personnes',
    description: 'Gestion des demandes d\'exercice des droits',
    icon: 'users',
    questions: commonCriticalQuestions.filter(q => q.category === 'Droits des personnes')
  },
  {
    id: 'securite',
    title: 'Sécurité des données',
    description: 'Mesures de protection des données',
    icon: 'lock',
    questions: commonCriticalQuestions.filter(q => q.category === 'Sécurité' || q.category === 'Violations de données')
  }
];

const healthSections: QuestionnaireSection[] = [
  {
    id: 'sante-specifique',
    title: 'Données de santé',
    description: 'Questions spécifiques au secteur de la santé',
    icon: 'heart',
    questions: healthSectorQuestions
  }
];

// ========================================
// SECTIONS QUESTIONNAIRE MÉDECIN - 8 SECTIONS
// ========================================
const doctorSections: QuestionnaireSection[] = [
  {
    id: 'med-gouvernance',
    title: '1. Gouvernance RGPD & responsabilités',
    description: 'Rôle de responsable de traitement, registre, référent, formation, violations',
    icon: 'shield-check',
    questions: doctorGovernanceQuestions
  },
  {
    id: 'med-dossiers-patients',
    title: '2. Dossiers patients & pratiques médicales',
    description: 'Données collectées, conservation, accès, confidentialité cabinet',
    icon: 'folder-heart',
    questions: doctorPatientDataQuestions
  },
  {
    id: 'med-logiciel',
    title: '3. Logiciel métier & DMP',
    description: 'HDS, contrats éditeur, accès nominatifs, MSSanté',
    icon: 'laptop-medical',
    questions: doctorSoftwareQuestions
  },
  {
    id: 'med-secretariat',
    title: '4. Secrétariat & accueil patients',
    description: 'Formation, sous-traitance, RDV en ligne, information patients',
    icon: 'users',
    questions: doctorSecretaryQuestions
  },
  {
    id: 'med-correspondants',
    title: '5. Correspondants médicaux & laboratoires',
    description: 'Transmissions sécurisées, labos, sous-traitants techniques',
    icon: 'share-2',
    questions: doctorPartnersQuestions
  },
  {
    id: 'med-comptable',
    title: '6. Expert-comptable & données sociales',
    description: 'Données RH, contrats, échanges sécurisés, accès paie',
    icon: 'calculator',
    questions: doctorAccountantQuestions
  },
  {
    id: 'med-teleconsultation',
    title: '7. Téléconsultation & e-santé',
    description: 'Plateformes conformes, information patients, enregistrements',
    icon: 'video',
    questions: doctorTeleconsultQuestions
  },
  {
    id: 'med-securite',
    title: '8. Sécurité informatique & accès',
    description: 'Accès distants, VPN/MFA, postes, sauvegardes, cyberattaques',
    icon: 'lock',
    questions: doctorSecurityQuestions
  }
];

const pharmacySections: QuestionnaireSection[] = [
  {
    id: 'pharma-gouvernance',
    title: '1. Gouvernance RGPD & Responsabilités',
    description: 'Formalisation des rôles, registre spécifique, procédures',
    icon: 'shield',
    questions: pharmacyGovernanceQuestions
  },
  {
    id: 'pharma-donnees-patients',
    title: '2. Données patients & pratiques officinales',
    description: 'Collecte, conservation, confidentialité au comptoir',
    icon: 'users',
    questions: pharmacyPatientDataQuestions
  },
  {
    id: 'pharma-logiciels',
    title: '3. Logiciels métier & éditeurs',
    description: 'LGO, contrats, accès nominatifs, exports',
    icon: 'laptop',
    questions: pharmacySoftwareQuestions
  },
  {
    id: 'pharma-fournisseurs',
    title: '4. Fournisseurs, grossistes, partenaires',
    description: 'Sous-traitants, clauses RGPD, accès techniques',
    icon: 'building',
    questions: pharmacyPartnersQuestions
  },
  {
    id: 'pharma-comptable',
    title: '5. Expert-comptable & données sociales',
    description: 'Données RH, contrats, échanges sécurisés',
    icon: 'calculator',
    questions: pharmacyAccountantQuestions
  },
  {
    id: 'pharma-mails',
    title: '6. Mails patients & communication',
    description: 'Réception de données de santé, messagerie sécurisée',
    icon: 'mail',
    questions: pharmacyEmailQuestions
  },
  {
    id: 'pharma-teleconsultation',
    title: '7. Téléconsultation & services numériques',
    description: 'Hébergement, information patients, conservation',
    icon: 'video',
    questions: pharmacyTeleconsultQuestions
  },
  {
    id: 'pharma-securite',
    title: '8. Accès à distance, sécurité & cyber',
    description: 'VPN, chiffrement, sauvegardes, plan de réponse',
    icon: 'lock',
    questions: pharmacySecurityQuestions
  }
];

// ========================================
// SECTIONS QUESTIONNAIRE BIEN-ÊTRE - 8 SECTIONS
// ========================================
const wellnessSections: QuestionnaireSection[] = [
  {
    id: 'be-gouvernance',
    title: '1. Gouvernance RGPD & responsabilités',
    description: 'Rôle de responsable, registre, formation, violations, assurance',
    icon: 'shield-check',
    questions: wellnessGovernanceQuestions
  },
  {
    id: 'be-clients',
    title: '2. Données clients et fiches de suivi',
    description: 'Types de données, anamnèse, minimisation, conservation, partage',
    icon: 'users',
    questions: wellnessClientQuestions
  },
  {
    id: 'be-consentement',
    title: '3. Consentement et information clients',
    description: 'Information, consentement santé, marketing, mineurs',
    icon: 'check-circle',
    questions: wellnessConsentQuestions
  },
  {
    id: 'be-outils',
    title: '4. Outils numériques et logiciels',
    description: 'Logiciel RDV, gestion, cloud, réseaux sociaux, site web',
    icon: 'laptop',
    questions: wellnessToolsQuestions
  },
  {
    id: 'be-securite',
    title: '5. Sécurité des données',
    description: 'Mots de passe, verrouillage, sauvegardes, antivirus, WiFi',
    icon: 'lock',
    questions: wellnessSecurityQuestions
  },
  {
    id: 'be-droits',
    title: '6. Droits des clients',
    description: 'Accès, rectification, effacement, registre demandes',
    icon: 'user-check',
    questions: wellnessRightsQuestions
  },
  {
    id: 'be-cabinet',
    title: '7. Cabinet et confidentialité',
    description: 'Confidentialité physique, documents, écran, destruction, domicile',
    icon: 'home',
    questions: wellnessCabinetQuestions
  },
  {
    id: 'be-partenaires',
    title: '8. Sous-traitants et partenaires',
    description: 'Comptable, hébergeur, paiement en ligne',
    icon: 'share-2',
    questions: wellnessPartnersQuestions
  }
];

// ========================================
// SECTIONS QUESTIONNAIRE ASSURANCE - 8 SECTIONS
// ========================================
const insuranceSections: QuestionnaireSection[] = [
  {
    id: 'assur-gouvernance',
    title: '1. Gouvernance RGPD & responsabilités',
    description: 'Rôle de responsable, registre, DPO, formation, violations',
    icon: 'shield-check',
    questions: insuranceGovernanceQuestions
  },
  {
    id: 'assur-clients',
    title: '2. Données clients & souscription',
    description: 'Collecte, minimisation, données sensibles, conservation, marketing',
    icon: 'users',
    questions: insuranceClientQuestions
  },
  {
    id: 'assur-profilage',
    title: '3. Profilage, scoring & décision automatisée',
    description: 'AIPD, transparence, intervention humaine, fichiers anti-fraude',
    icon: 'brain',
    questions: insuranceProfilingQuestions
  },
  {
    id: 'assur-distribution',
    title: '4. Réseau de distribution & intermédiaires',
    description: 'Courtiers, agents, comparateurs, délégataires',
    icon: 'share-2',
    questions: insuranceDistributionQuestions
  },
  {
    id: 'assur-sinistres',
    title: '5. Gestion des sinistres & experts',
    description: 'Données sinistres, experts, transmissions, tiers victimes',
    icon: 'file-warning',
    questions: insuranceClaimsQuestions
  },
  {
    id: 'assur-sous-traitants',
    title: '6. Sous-traitants & partenaires',
    description: 'Cartographie, contrats, réassureurs, offshore',
    icon: 'building',
    questions: insuranceSubcontractorsQuestions
  },
  {
    id: 'assur-lcb-ft',
    title: '7. LCB-FT & obligations réglementaires',
    description: 'KYC, PEP, conservation vigilance, TRACFIN',
    icon: 'scale',
    questions: insuranceLcbFtQuestions
  },
  {
    id: 'assur-securite',
    title: '8. Sécurité IT & cybersécurité',
    description: 'Accès SI, chiffrement, PCA/PRA, incidents',
    icon: 'lock',
    questions: insuranceSecurityQuestions
  }
];

const lifeInsuranceSections: QuestionnaireSection[] = [...insuranceDiagnosticSections];
const nonLifeInsuranceSections: QuestionnaireSection[] = [...insuranceDiagnosticSections];

// ========================================
// SECTIONS QUESTIONNAIRE TRANSPORT - 8 SECTIONS + SOUS-DOUANE + MULTIMODAL
// ========================================
const transportSections: QuestionnaireSection[] = [
  {
    id: 'transp-gouvernance',
    title: '1. Gouvernance RGPD & responsabilités',
    description: 'Rôle de responsable, registre, référent, formation, violations',
    icon: 'shield-check',
    questions: transportGovernanceQuestions
  },
  {
    id: 'transp-geolocalisation',
    title: '2. Géolocalisation des véhicules et conducteurs',
    description: 'Finalités, information, CSE, désactivation, conservation',
    icon: 'map-pin',
    questions: transportGeolocQuestions
  },
  {
    id: 'transp-chronotachygraphe',
    title: '3. Chronotachygraphe et temps de conduite',
    description: 'Téléchargement, conservation, accès, droits conducteurs',
    icon: 'clock',
    questions: transportChronoQuestions
  },
  {
    id: 'transp-videosurveillance',
    title: '4. Vidéosurveillance et caméras embarquées',
    description: 'Entrepôts, dashcams, conservation, accès, CSE',
    icon: 'video',
    questions: transportVideoQuestions
  },
  {
    id: 'transp-clients',
    title: '5. Données clients et marchandises',
    description: 'Cartographie, information, sécurité, conservation, responsabilité',
    icon: 'package',
    questions: transportClientQuestions
  },
  {
    id: 'transp-rh',
    title: '6. Données RH et conducteurs',
    description: 'Dossiers, aptitude médicale, formations, droits salariés',
    icon: 'users',
    questions: transportRHQuestions
  },
  {
    id: 'transp-partenaires',
    title: '7. Sous-traitants et partenaires',
    description: 'Affrétés, télématique, contrats, bourses de fret',
    icon: 'share-2',
    questions: transportPartnersQuestions
  },
  {
    id: 'transp-securite',
    title: '8. Sécurité IT et cybersécurité',
    description: 'TMS, terminaux mobiles, sauvegardes, sensibilisation, PCA',
    icon: 'lock',
    questions: transportSecurityQuestions
  }
  // Note: customsDepotSections et multimodalTransportSections sont conservés 
  // dans le code pour une utilisation future (sous-secteurs spécifiques)
];

export const SECTOR_QUESTIONNAIRE_LABELS: Record<Sector, string> = {
  sante_reglementee_pharmacien: 'Questionnaire RGPD - Pharmacie',
  sante_reglementee_medecin: 'Questionnaire RGPD - Professionnel de santé',
  sante_non_reglementee_bien_etre: 'Questionnaire RGPD - Bien-être',
  assurance_vie: 'Questionnaire RGPD - Assurance vie',
  assurance_non_vie: 'Questionnaire RGPD - Assurance IARD',
  transport_logistique: 'Questionnaire RGPD - Transport & Logistique'
};

// Fonction pour obtenir le label du questionnaire
export function getQuestionnaireLabel(sector: Sector): string {
  return SECTOR_QUESTIONNAIRE_LABELS[sector];
}

// Type de transport pour le secteur Transport & Logistique
export type TransportType = 'general' | 'sous_douane' | 'multimodal';

// Fonction originale pour RGPD EU
export function getQuestionnaireSections(sector: Sector, transportType?: TransportType): QuestionnaireSection[] {
  const sections = [...commonSections];
  
  // Secteur santé réglementée - Pharmacien
  if (sector === 'sante_reglementee_pharmacien') {
    sections.push(...healthSections);
    sections.push(...pharmacySections);
  }
  
  // Secteur santé réglementée - Médecin
  if (sector === 'sante_reglementee_medecin') {
    sections.push(...healthSections);
    sections.push(...doctorSections);
  }
  
  // Secteur santé non réglementée - Bien-être
  if (sector === 'sante_non_reglementee_bien_etre') {
    sections.push(...wellnessSections);
  }
  
  // Secteur assurance vie - Diagnostic Global (8 modules)
  if (sector === 'assurance_vie') {
    sections.push(...lifeInsuranceSections);
  }
  
  // Secteur assurance non-vie (IARD) - Diagnostic Global (8 modules)
  if (sector === 'assurance_non_vie') {
    sections.push(...nonLifeInsuranceSections);
  }
  
  // Secteur transport et logistique - avec sélection du type
  if (sector === 'transport_logistique') {
    switch (transportType) {
      case 'sous_douane':
        sections.push(...customsDepotSections);
        break;
      case 'multimodal':
        sections.push(...multimodalTransportSections);
        break;
      case 'general':
      default:
        sections.push(...transportSections);
        break;
    }
  }
  
  return sections;
}

// Alias kept for backward compatibility
export function getQuestionnaireSectionsByFramework(
  sector: Sector,
  transportType?: TransportType
): QuestionnaireSection[] {
  return getQuestionnaireSections(sector, transportType);
}

export function getAllQuestionsFlat(sector: Sector, transportType?: TransportType): ConditionalQuestion[] {
  const sections = getQuestionnaireSectionsByFramework(sector, transportType);
  const allQuestions: ConditionalQuestion[] = [];
  
  const extractQuestions = (questions: ConditionalQuestion[]) => {
    questions.forEach(q => {
      allQuestions.push(q);
      if (q.followUpQuestions) {
        extractQuestions(q.followUpQuestions);
      }
    });
  };
  
  sections.forEach(section => extractQuestions(section.questions));
  return allQuestions;
}
