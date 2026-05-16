// ========================================
// AUDIT FLASH PHARMACIE - Questions terrain
// ========================================

export interface FlashAuditQuestion {
  id: string;
  category: FlashAuditCategory;
  question: string;
  description: string;
  riskLevel: 'critical' | 'sensitive' | 'acceptable';
  controlScenario: string;
  exposureLevel: string;
}

export type FlashAuditCategory = 
  | 'lgo'
  | 'communications'
  | 'external_relations'
  | 'hr_salaries';

export const FLASH_AUDIT_CATEGORIES: Record<FlashAuditCategory, { label: string; icon: string }> = {
  lgo: { label: 'Logiciel métier (LGO)', icon: '💻' },
  communications: { label: 'Communications', icon: '📧' },
  external_relations: { label: 'Relations externes', icon: '🤝' },
  hr_salaries: { label: 'RH & Salaires', icon: '👥' },
};

export const flashAuditQuestions: FlashAuditQuestion[] = [
  // ========== LGO ==========
  {
    id: 'lgo-1',
    category: 'lgo',
    question: 'Utilisez-vous des comptes partagés ou un mot de passe générique pour accéder au LGO ?',
    description: 'Un seul identifiant pour plusieurs utilisateurs empêche toute traçabilité individuelle.',
    riskLevel: 'critical',
    controlScenario: 'En cas de contrôle CNIL ou d\'incident, impossible de savoir qui a fait quoi. Responsabilité du titulaire engagée.',
    exposureLevel: 'Sanction CNIL jusqu\'à 4% du CA + mise en demeure publique',
  },
  {
    id: 'lgo-2',
    category: 'lgo',
    question: 'Les préparateurs ont-ils le même niveau d\'accès que le titulaire dans le LGO ?',
    description: 'Un préparateur n\'a pas besoin d\'accéder aux statistiques, exports massifs ou données sensibles.',
    riskLevel: 'sensitive',
    controlScenario: 'Export de données patients par un préparateur qui quitte l\'officine = violation de données.',
    exposureLevel: 'Risque de fuite de données + notification CNIL obligatoire sous 72h',
  },
  {
    id: 'lgo-3',
    category: 'lgo',
    question: 'Les exports de données (fichiers patients, ordonnances) sont-ils tracés et contrôlés ?',
    description: 'Un export massif non justifié représente une faille majeure.',
    riskLevel: 'critical',
    controlScenario: 'Vol de fichier client par un collaborateur = plainte + action CNIL + préjudice réputation.',
    exposureLevel: 'Amende CNIL + action civile des patients concernés',
  },
  {
    id: 'lgo-4',
    category: 'lgo',
    question: 'Savez-vous où sont stockées vos sauvegardes et qui y a accès ?',
    description: 'Sauvegardes sur disque dur externe dans le tiroir = pas de sauvegarde.',
    riskLevel: 'sensitive',
    controlScenario: 'Incendie ou ransomware = perte totale des données patients et comptables.',
    exposureLevel: 'Interruption d\'activité + perte historique dispensation',
  },
  {
    id: 'lgo-5',
    category: 'lgo',
    question: 'Le mainteneur/éditeur LGO a-t-il un accès permanent à vos données sans votre contrôle ?',
    description: 'Accès de maintenance = accès aux données de santé. Contrat article 28 obligatoire.',
    riskLevel: 'sensitive',
    controlScenario: 'Fuite de données via le prestataire = le titulaire reste responsable.',
    exposureLevel: 'Responsabilité conjointe RT/ST - sanctions partagées',
  },
  {
    id: 'lgo-6',
    category: 'lgo',
    question: 'Les remplaçants utilisent-ils leur propre identifiant ou celui du titulaire ?',
    description: 'Un remplaçant doit avoir son propre compte pour assurer la traçabilité.',
    riskLevel: 'sensitive',
    controlScenario: 'Ordonnance litigieuse = impossible de prouver qui l\'a dispensée.',
    exposureLevel: 'Responsabilité professionnelle engagée + problème assurance',
  },

  // ========== COMMUNICATIONS ==========
  {
    id: 'com-1',
    category: 'communications',
    question: 'Envoyez-vous des ordonnances ou données patients par email classique (Gmail, Outlook...) ?',
    description: 'Un email non chiffré = carte postale lisible par tous.',
    riskLevel: 'critical',
    controlScenario: 'Interception de données de santé = violation de données à déclarer + information des patients.',
    exposureLevel: 'Amende CNIL + atteinte au secret professionnel (Code pénal)',
  },
  {
    id: 'com-2',
    category: 'communications',
    question: 'Utilisez-vous WhatsApp ou SMS pour échanger des informations patients avec médecins ou patients ?',
    description: 'WhatsApp stocke les données hors UE et n\'est pas conforme RGPD pour les données de santé.',
    riskLevel: 'critical',
    controlScenario: 'Photo d\'ordonnance sur WhatsApp = transfert hors UE + pas de contrat + pas de chiffrement bout en bout pour groupes.',
    exposureLevel: 'Non-conformité flagrante - sanction quasi certaine en cas de contrôle',
  },
  {
    id: 'com-3',
    category: 'communications',
    question: 'Les équipiers utilisent-ils leur téléphone personnel pour des échanges professionnels ?',
    description: 'Téléphone perso = données patients dans iCloud/Google sans contrôle.',
    riskLevel: 'sensitive',
    controlScenario: 'Perte ou vol du téléphone = fuite massive de données de santé.',
    exposureLevel: 'Notification CNIL 72h + information patients concernés',
  },
  {
    id: 'com-4',
    category: 'communications',
    question: 'Utilisez-vous une boîte email personnelle pour des communications professionnelles ?',
    description: 'Gmail personnel = données professionnelles hors contrôle de l\'officine.',
    riskLevel: 'sensitive',
    controlScenario: 'Départ d\'un collaborateur avec sa boîte Gmail = il conserve les échanges patients.',
    exposureLevel: 'Perte de contrôle des données + impossibilité de répondre aux droits patients',
  },
  {
    id: 'com-5',
    category: 'communications',
    question: 'Avez-vous une messagerie sécurisée de santé (MSSanté, Apicrypt...) ?',
    description: 'C\'est le seul canal conforme pour les échanges de données de santé entre professionnels.',
    riskLevel: 'acceptable',
    controlScenario: 'Si non utilisée, tous les échanges médicaux sont potentiellement non conformes.',
    exposureLevel: 'Point d\'amélioration - recommandation CNIL/CNOP',
  },

  // ========== RELATIONS EXTERNES ==========
  {
    id: 'ext-1',
    category: 'external_relations',
    question: 'Transmettez-vous des bulletins de salaire ou RIB au comptable par email non sécurisé ?',
    description: 'Données RH sensibles qui circulent en clair.',
    riskLevel: 'sensitive',
    controlScenario: 'Interception d\'un bulletin = usurpation d\'identité possible pour le salarié.',
    exposureLevel: 'Responsabilité employeur + potentielle action salariés',
  },
  {
    id: 'ext-2',
    category: 'external_relations',
    question: 'Les mutuelles vous demandent-elles des copies de factures avec données patient par fax/email ?',
    description: 'Pratique courante mais souvent non conforme.',
    riskLevel: 'sensitive',
    controlScenario: 'Fax envoyé au mauvais numéro = violation de données caractérisée.',
    exposureLevel: 'Risque partagé avec la mutuelle mais le titulaire est exposé',
  },
  {
    id: 'ext-3',
    category: 'external_relations',
    question: 'Le prestataire ménage, maintenance ou alarme a-t-il accès à des zones où des données sont visibles ?',
    description: 'Écrans allumés, documents sur le bureau, poubelles non sécurisées.',
    riskLevel: 'acceptable',
    controlScenario: 'Photo d\'écran par un prestataire malveillant = fuite de données.',
    exposureLevel: 'Risque faible mais réel - procédure de verrouillage recommandée',
  },
  {
    id: 'ext-4',
    category: 'external_relations',
    question: 'Avez-vous une liste à jour de tous les prestataires ayant accès à vos données ?',
    description: 'Éditeur LGO, grossiste, téléphonie, maintenance, comptable, hébergeur...',
    riskLevel: 'critical',
    controlScenario: 'Contrôle CNIL = production du registre des sous-traitants exigée immédiatement.',
    exposureLevel: 'Non-conformité documentaire = mise en demeure quasi systématique',
  },
  {
    id: 'ext-5',
    category: 'external_relations',
    question: 'Avez-vous des contrats de sous-traitance (article 28 RGPD) avec vos prestataires clés ?',
    description: 'Obligatoire pour tout prestataire traitant des données pour votre compte.',
    riskLevel: 'critical',
    controlScenario: 'Pas de contrat = le titulaire assume 100% de la responsabilité en cas de fuite chez le prestataire.',
    exposureLevel: 'Responsabilité pleine et entière du responsable de traitement',
  },

  // ========== RH & SALAIRES ==========
  {
    id: 'rh-1',
    category: 'hr_salaries',
    question: 'Les bulletins de salaire sont-ils stockés sur un serveur accessible à tous les collaborateurs ?',
    description: 'Un préparateur ne doit pas voir le salaire d\'un autre.',
    riskLevel: 'sensitive',
    controlScenario: 'Collaborateur consulte le salaire d\'un collègue = violation vie privée + conflit social.',
    exposureLevel: 'Action prud\'homale potentielle + sanction CNIL',
  },
  {
    id: 'rh-2',
    category: 'hr_salaries',
    question: 'Les dossiers salariés (arrêts maladie, RIB, contrats) sont-ils accessibles à plusieurs personnes ?',
    description: 'Seules les personnes habilitées (titulaire, gestionnaire RH désigné) doivent y accéder.',
    riskLevel: 'sensitive',
    controlScenario: 'Fuite d\'un arrêt maladie = atteinte à la vie privée du salarié.',
    exposureLevel: 'Responsabilité employeur + préjudice moral',
  },
  {
    id: 'rh-3',
    category: 'hr_salaries',
    question: 'Les données RH partent-elles au cabinet comptable via un canal non sécurisé ?',
    description: 'WeTransfer, email classique, clé USB = pas de traçabilité ni de sécurité.',
    riskLevel: 'sensitive',
    controlScenario: 'Interception des données salariales = usurpation d\'identité, fraude.',
    exposureLevel: 'Responsabilité partagée employeur/cabinet mais vous restez exposé',
  },
  {
    id: 'rh-4',
    category: 'hr_salaries',
    question: 'Conservez-vous des dossiers de candidats non retenus au-delà de 2 ans ?',
    description: 'La CNIL recommande une suppression sous 2 ans maximum.',
    riskLevel: 'acceptable',
    controlScenario: 'Candidat exerce son droit d\'effacement = vous devez prouver la suppression.',
    exposureLevel: 'Point de conformité documentaire',
  },
];

export interface FlashAuditAnswer {
  questionId: string;
  answer: 'yes' | 'no' | 'partial' | 'unknown';
  notes?: string;
}

export interface FlashAuditAlert {
  question: FlashAuditQuestion;
  answer: FlashAuditAnswer;
  severity: 'critical' | 'sensitive' | 'acceptable';
}

export function generateFlashAuditReport(answers: FlashAuditAnswer[]): {
  alerts: FlashAuditAlert[];
  summary: {
    critical: number;
    sensitive: number;
    acceptable: number;
    total: number;
  };
  flowMap: Record<FlashAuditCategory, { 
    issues: number;
    questions: FlashAuditQuestion[];
  }>;
} {
  const alerts: FlashAuditAlert[] = [];
  const flowMap: Record<FlashAuditCategory, { issues: number; questions: FlashAuditQuestion[] }> = {
    lgo: { issues: 0, questions: [] },
    communications: { issues: 0, questions: [] },
    external_relations: { issues: 0, questions: [] },
    hr_salaries: { issues: 0, questions: [] },
  };

  for (const answer of answers) {
    const question = flashAuditQuestions.find(q => q.id === answer.questionId);
    if (!question) continue;

    // Determine if this answer indicates a problem
    const isProblematic = 
      (question.riskLevel === 'critical' || question.riskLevel === 'sensitive') &&
      (answer.answer === 'yes' || answer.answer === 'partial' || answer.answer === 'unknown');

    // For acceptable questions, we inverse the logic
    const isAcceptableMissing = 
      question.riskLevel === 'acceptable' && 
      (answer.answer === 'no' || answer.answer === 'unknown');

    if (isProblematic || isAcceptableMissing) {
      alerts.push({
        question,
        answer,
        severity: question.riskLevel,
      });
      flowMap[question.category].issues++;
      flowMap[question.category].questions.push(question);
    }
  }

  // Sort alerts by severity
  alerts.sort((a, b) => {
    const order = { critical: 0, sensitive: 1, acceptable: 2 };
    return order[a.severity] - order[b.severity];
  });

  return {
    alerts,
    summary: {
      critical: alerts.filter(a => a.severity === 'critical').length,
      sensitive: alerts.filter(a => a.severity === 'sensitive').length,
      acceptable: alerts.filter(a => a.severity === 'acceptable').length,
      total: alerts.length,
    },
    flowMap,
  };
}
