import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Send, X, Loader2, Sparkles, MessageSquare, FileText, Shield, 
  ClipboardList, AlertTriangle, RefreshCw, Download, FileDown, Maximize2, Minimize2, GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportAIContentToPDF, exportAIContentToWord } from '@/services/exportAIContent';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  context?: {
    organisationName?: string;
    sector?: string;
    size?: string;
    dpoRole?: string;
    country?: string;
    legalFramework?: string;
    currentModule?: string;
    conformityScore?: number;
  };
  mode?: 'audit' | 'documentation';
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rgpd-assistant`;

// Types pour les commandes
interface CommandItem {
  icon: typeof FileText;
  label: string;
  command: string;
  color: string;
  bgColor: string;
  documentType: string;
}

// Commandes de base pour l'audit - RGPD EU
const BASE_AUDIT_COMMANDS_RGPD: CommandItem[] = [
  {
    icon: FileText,
    label: "Générer un audit complet",
    command: "Génère un audit RGPD complet pour mon organisme avec tous les registres obligatoires (ROPA, violations, DSAR, sous-traitants, cookies, incidents sécurité) et une analyse de risques adaptée à mon secteur.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    documentType: "Audit RGPD Complet",
  },
  {
    icon: AlertTriangle,
    label: "Plan d'actions prioritaires",
    command: "Génère un plan d'actions priorisé (🔴 Critique, 🟠 Important, 🟡 Amélioration) pour améliorer ma conformité RGPD, basé sur les spécificités de mon secteur.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    documentType: "Plan Actions Prioritaires",
  },
];

// Commandes de base pour l'audit - Projet de Loi Tunisie 2025/95
const BASE_AUDIT_COMMANDS_TUNISIE: CommandItem[] = [
  {
    icon: FileText,
    label: "Générer un audit complet",
    command: "Génère un audit complet de conformité au Projet de loi 2025/95 pour mon organisme avec tous les registres obligatoires (registre des traitements, violations, demandes de droits, sous-traitants) et une analyse de risques adaptée à mon secteur. Cite les articles du projet de loi tunisien applicables.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    documentType: "Audit Projet de loi 2025/95",
  },
  {
    icon: AlertTriangle,
    label: "Plan d'actions prioritaires",
    command: "Génère un plan d'actions priorisé pour améliorer ma conformité au Projet de loi 2025/95 tunisien. Mentionne les articles concernés et les exigences de l'INPDP.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    documentType: "Plan Actions Projet de loi 2025/95",
  },
  {
    icon: Shield,
    label: "Autorisation INPDP",
    command: "Aide-moi à préparer une demande d'autorisation auprès de l'INPDP pour le traitement de données sensibles ou de santé (Articles 41 et 70 du Projet de loi 2025/95).",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    documentType: "Demande Autorisation INPDP",
  },
];

// Commandes spécifiques par secteur pour l'audit
const SECTOR_AUDIT_COMMANDS: Record<string, CommandItem[]> = {
  sante_reglementee_pharmacien: [
    {
      icon: ClipboardList,
      label: "ROPA Officine",
      command: "Génère un ROPA complet pour mon officine de pharmacie incluant : gestion du Dossier Pharmaceutique, dispensation, télésoin, carte Vitale, et gestion des ordonnances.",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      documentType: "ROPA Officine Pharmacie",
    },
    {
      icon: Shield,
      label: "AIPD Données de Santé",
      command: "Réalise une AIPD pour le traitement des données de santé en officine : Dossier Pharmaceutique, historique des dispensations, données de vaccination.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "AIPD Pharmacie",
    },
  ],
  sante_reglementee_medecin: [
    {
      icon: ClipboardList,
      label: "ROPA Cabinet Médical",
      command: "Génère un ROPA complet pour mon cabinet médical incluant : dossier médical patient, téléconsultation, prescriptions, comptabilité médicale, et messagerie sécurisée de santé.",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      documentType: "ROPA Cabinet Médical",
    },
    {
      icon: Shield,
      label: "AIPD Dossier Médical",
      command: "Réalise une AIPD pour le traitement du dossier médical électronique, incluant l'hébergement HDS, les échanges avec confrères et le DMP.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "AIPD Dossier Médical",
    },
  ],
  sante_non_reglementee_bien_etre: [
    {
      icon: ClipboardList,
      label: "ROPA Bien-être",
      command: "Génère un ROPA pour mon activité bien-être incluant : fiches clients, historique des soins, prise de rendez-vous, et programme de fidélité.",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      documentType: "ROPA Bien-être",
    },
    {
      icon: Shield,
      label: "Consentement Données Sensibles",
      command: "Génère un formulaire de consentement pour la collecte de données sensibles liées aux prestations bien-être (état de santé, contre-indications).",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Consentement Bien-être",
    },
  ],
  assurance_vie: [
    {
      icon: ClipboardList,
      label: "ROPA Assurance Vie",
      command: "Génère un ROPA complet pour mon activité assurance vie incluant : souscription, gestion des contrats, données bénéficiaires, données de santé pour la tarification.",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      documentType: "ROPA Assurance Vie",
    },
    {
      icon: Shield,
      label: "AIPD Questionnaire Santé",
      command: "Réalise une AIPD pour le traitement des questionnaires de santé utilisés dans la souscription des contrats d'assurance vie.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "AIPD Questionnaire Santé",
    },
  ],
  assurance_non_vie: [
    {
      icon: ClipboardList,
      label: "ROPA Assurance IARD",
      command: "Génère un ROPA pour mon activité assurance non-vie incluant : souscription auto/habitation, gestion des sinistres, expertises, et lutte contre la fraude.",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      documentType: "ROPA Assurance IARD",
    },
    {
      icon: Shield,
      label: "AIPD Lutte Anti-Fraude",
      command: "Réalise une AIPD pour les traitements de détection et lutte contre la fraude à l'assurance.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "AIPD Anti-Fraude",
    },
  ],
  transport_logistique: [
    {
      icon: ClipboardList,
      label: "ROPA Transport",
      command: "Génère un ROPA pour mon activité transport/logistique incluant : géolocalisation, gestion de flotte, chronotachygraphe, CMR, et traçabilité des marchandises.",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      documentType: "ROPA Transport",
    },
    {
      icon: Shield,
      label: "AIPD Géolocalisation",
      command: "Réalise une AIPD pour les traitements de géolocalisation des véhicules et conducteurs, incluant le suivi temps réel et l'historique des trajets.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "AIPD Géolocalisation",
    },
  ],
};

// Commandes par défaut si secteur non reconnu
const DEFAULT_SECTOR_COMMANDS: CommandItem[] = [
  {
    icon: ClipboardList,
    label: "Générer le ROPA",
    command: "Génère un Registre des Activités de Traitement (ROPA) complet et structuré pour mon organisme, conforme aux exigences CNIL et adapté à mon secteur d'activité.",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    documentType: "Registre ROPA",
  },
  {
    icon: Shield,
    label: "Analyse AIPD",
    command: "Réalise une Analyse d'Impact relative à la Protection des Données (AIPD) pour mon organisme. Identifie si elle est obligatoire ou recommandée selon mon secteur et génère le document complet.",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    documentType: "Analyse AIPD",
  },
];

// Fonction pour obtenir les commandes d'audit personnalisées
const getAuditCommands = (sector?: string, legalFramework?: string): CommandItem[] => {
  const isTunisia = legalFramework === 'loi_tunisie_2025';
  const baseCommands = isTunisia ? BASE_AUDIT_COMMANDS_TUNISIE : BASE_AUDIT_COMMANDS_RGPD;
  
  const sectorCommands = sector && SECTOR_AUDIT_COMMANDS[sector] 
    ? SECTOR_AUDIT_COMMANDS[sector] 
    : DEFAULT_SECTOR_COMMANDS;
  
  // Pour la Tunisie, adapter les commandes sectorielles
  if (isTunisia) {
    const adaptedSectorCommands = sectorCommands.map(cmd => ({
      ...cmd,
      command: cmd.command
        .replace(/CNIL/g, 'INPDP')
        .replace(/RGPD/g, 'Projet de loi 2025/95')
        .replace(/Article 30/g, 'Projet de loi 2025/95')
        .replace(/Article 28/g, 'Projet de loi 2025/95')
    }));
    return [...baseCommands.slice(0, 2), ...adaptedSectorCommands, ...baseCommands.slice(2)];
  }
  
  return [...baseCommands.slice(0, 1), ...sectorCommands, ...baseCommands.slice(1)];
};

// Commandes de base pour la documentation
const BASE_DOCUMENTATION_COMMANDS: CommandItem[] = [
  {
    icon: AlertTriangle,
    label: "Déclarer une violation",
    command: "Guide-moi pour documenter une violation de données (Article 33). Rappelle-moi les délais légaux, les informations à collecter et génère un modèle de notification CNIL si nécessaire.",
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100 border-red-200",
    documentType: "Déclaration Violation",
  },
  {
    icon: Shield,
    label: "Répondre à une demande de droits",
    command: "Aide-moi à traiter une demande d'exercice de droits (accès, rectification, effacement, portabilité, opposition). Rappelle les délais, propose un modèle de réponse et les vérifications d'identité à effectuer.",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    documentType: "Réponse DSAR",
  },
];

// Commandes spécifiques par secteur pour la documentation
const SECTOR_DOC_COMMANDS: Record<string, CommandItem[]> = {
  sante_reglementee_pharmacien: [
    {
      icon: ClipboardList,
      label: "Fiche Dossier Pharmaceutique",
      command: "Aide-moi à rédiger une fiche de traitement pour le Dossier Pharmaceutique incluant les finalités, bases légales, durées de conservation spécifiques et mesures HDS.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      documentType: "Fiche DP Pharmacie",
    },
    {
      icon: FileText,
      label: "Clause Éditeur Logiciel",
      command: "Génère une clause Article 28 pour un contrat avec un éditeur de logiciel de gestion officinale, incluant les exigences HDS et les obligations spécifiques santé.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Clause Éditeur Pharma",
    },
  ],
  sante_reglementee_medecin: [
    {
      icon: ClipboardList,
      label: "Fiche Dossier Médical",
      command: "Aide-moi à rédiger une fiche de traitement pour le dossier médical patient incluant les durées de conservation légales (20 ans minimum), les bases légales et l'hébergement HDS.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      documentType: "Fiche Dossier Médical",
    },
    {
      icon: FileText,
      label: "Clause Hébergeur HDS",
      command: "Génère une clause Article 28 pour un contrat avec un hébergeur de données de santé certifié HDS.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Clause HDS",
    },
  ],
  sante_non_reglementee_bien_etre: [
    {
      icon: ClipboardList,
      label: "Fiche Client Bien-être",
      command: "Aide-moi à rédiger une fiche de traitement pour les fichiers clients bien-être, incluant les données sensibles éventuelles et le consentement explicite.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      documentType: "Fiche Client Bien-être",
    },
    {
      icon: FileText,
      label: "Mentions Information Client",
      command: "Génère les mentions d'information RGPD à afficher sur mes formulaires clients et mon site web pour mon activité bien-être.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Mentions Information",
    },
  ],
  assurance_vie: [
    {
      icon: ClipboardList,
      label: "Fiche Souscription Vie",
      command: "Aide-moi à rédiger une fiche de traitement pour la souscription de contrats d'assurance vie, incluant les données de santé et les clauses bénéficiaires.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      documentType: "Fiche Souscription Vie",
    },
    {
      icon: FileText,
      label: "Clause Réassureur",
      command: "Génère une clause Article 28 pour les transferts de données vers un réassureur, incluant les garanties appropriées.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Clause Réassureur",
    },
  ],
  assurance_non_vie: [
    {
      icon: ClipboardList,
      label: "Fiche Gestion Sinistres",
      command: "Aide-moi à rédiger une fiche de traitement pour la gestion des sinistres auto/habitation, incluant les échanges avec experts et tiers.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      documentType: "Fiche Sinistres",
    },
    {
      icon: FileText,
      label: "Clause Expert Automobile",
      command: "Génère une clause Article 28 pour un contrat avec un cabinet d'expertise automobile.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Clause Expert Auto",
    },
  ],
  transport_logistique: [
    {
      icon: ClipboardList,
      label: "Fiche Géolocalisation",
      command: "Aide-moi à rédiger une fiche de traitement pour la géolocalisation des véhicules, incluant l'information des conducteurs et les durées de conservation.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      documentType: "Fiche Géolocalisation",
    },
    {
      icon: FileText,
      label: "Clause Prestataire Tracking",
      command: "Génère une clause Article 28 pour un contrat avec un prestataire de solutions de tracking et géolocalisation.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      documentType: "Clause Tracking",
    },
  ],
};

// Commandes par défaut pour documentation
const DEFAULT_DOC_COMMANDS: CommandItem[] = [
  {
    icon: ClipboardList,
    label: "Fiche de traitement",
    command: "Aide-moi à rédiger une fiche de traitement complète (Article 30) adaptée à mon secteur. Propose les finalités, bases légales, catégories de données, durées de conservation et mesures de sécurité appropriées.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    documentType: "Fiche de Traitement",
  },
  {
    icon: FileText,
    label: "Clause sous-traitant",
    command: "Génère une clause contractuelle type Article 28 pour un contrat avec un sous-traitant. Inclus toutes les mentions obligatoires et adapte au secteur de mon organisme.",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    documentType: "Clause Sous-traitant",
  },
];

// Fonction pour obtenir les commandes de documentation personnalisées
const getDocumentationCommands = (sector?: string, legalFramework?: string): CommandItem[] => {
  const isTunisia = legalFramework === 'loi_tunisie_2025';
  const sectorCommands = sector && SECTOR_DOC_COMMANDS[sector] 
    ? SECTOR_DOC_COMMANDS[sector] 
    : DEFAULT_DOC_COMMANDS;
  
  // Pour la Tunisie, adapter les références légales
  if (isTunisia) {
    const adaptedCommands = [...sectorCommands, ...BASE_DOCUMENTATION_COMMANDS].map(cmd => ({
      ...cmd,
      command: cmd.command
        .replace(/CNIL/g, 'INPDP')
        .replace(/Article 33/g, 'Projet de loi 2025/95')
        .replace(/Article 28/g, 'Projet de loi 2025/95')
        .replace(/Article 30/g, 'Projet de loi 2025/95')
    }));
    return adaptedCommands;
  }
  
  return [...sectorCommands, ...BASE_DOCUMENTATION_COMMANDS];
};

// Fonction pour générer des questions personnalisées selon le secteur
const getAuditQuestions = (sector?: string): string[] => {
  const baseQuestions = [
    "Comment mettre en place une procédure de gestion des violations de données ?",
    "Comment gérer les demandes d'exercice des droits (DSAR) ?",
  ];

  const sectorQuestions: Record<string, string[]> = {
    sante_reglementee_pharmacien: [
      "Quelles sont les obligations spécifiques pour la gestion du Dossier Pharmaceutique ?",
      "Comment sécuriser les données de santé dans mon officine ?",
      "Quels sont les délais de conservation des ordonnances et dossiers patients ?",
      "Comment gérer le partage de données avec les professionnels de santé ?",
    ],
    sante_reglementee_medecin: [
      "Comment sécuriser les données médicales de mes patients (hébergement HDS) ?",
      "Quelles sont les obligations pour la tenue du dossier médical électronique ?",
      "Comment gérer le consentement pour les données de santé ?",
      "Quels sont les délais de conservation du dossier médical ?",
    ],
    sante_non_reglementee_bien_etre: [
      "Quelles données puis-je collecter pour mes prestations bien-être ?",
      "Dois-je obtenir un consentement spécifique pour les données de santé ?",
      "Comment informer mes clients sur l'utilisation de leurs données ?",
      "Quelles mesures de sécurité pour les données sensibles de bien-être ?",
    ],
    assurance_vie: [
      "Comment gérer les données bénéficiaires et clauses sensibles ?",
      "Quelles obligations pour les données de santé des assurés ?",
      "Comment gérer les transferts de données avec les réassureurs ?",
      "Quels sont les délais de conservation des contrats d'assurance vie ?",
    ],
    assurance_non_vie: [
      "Comment gérer les données des sinistres et expertises ?",
      "Quelles données puis-je collecter pour l'évaluation des risques ?",
      "Comment gérer les données de géolocalisation pour l'assurance auto ?",
      "Quels sont les délais de conservation des dossiers sinistres ?",
    ],
    transport_logistique: [
      "Comment gérer les données de géolocalisation des véhicules ?",
      "Quelles obligations pour les données des conducteurs ?",
      "Comment sécuriser les données de tracking des marchandises ?",
      "Quels sont les délais de conservation des documents de transport ?",
    ],
  };

  const specificQuestions = sector && sectorQuestions[sector] 
    ? sectorQuestions[sector] 
    : ["Quelles sont les obligations RGPD spécifiques à mon secteur ?"];

  return [...specificQuestions.slice(0, 2), ...baseQuestions];
};

const getDocumentationQuestions = (sector?: string): string[] => {
  const baseQuestions = [
    "Comment évaluer la gravité d'une violation de données ?",
    "Quels sont les délais légaux pour répondre aux demandes de droits ?",
  ];

  const sectorQuestions: Record<string, string[]> = {
    sante_reglementee_pharmacien: [
      "Comment rédiger une fiche de traitement pour le Dossier Pharmaceutique ?",
      "Quelles clauses pour un contrat avec un éditeur de logiciel officinal ?",
      "Comment documenter les accès aux données de santé dans l'officine ?",
    ],
    sante_reglementee_medecin: [
      "Comment rédiger une fiche de traitement pour le dossier médical ?",
      "Quelles clauses pour un contrat avec un hébergeur HDS ?",
      "Comment documenter le recueil du consentement patient ?",
    ],
    sante_non_reglementee_bien_etre: [
      "Comment rédiger une fiche de traitement pour les séances de bien-être ?",
      "Quelles mentions obligatoires dans le formulaire client ?",
      "Comment documenter le consentement pour les données sensibles ?",
    ],
    assurance_vie: [
      "Comment rédiger une fiche de traitement pour la gestion des contrats vie ?",
      "Quelles clauses pour les transferts vers les réassureurs ?",
      "Comment documenter les vérifications anti-blanchiment ?",
    ],
    assurance_non_vie: [
      "Comment rédiger une fiche de traitement pour la gestion des sinistres ?",
      "Quelles clauses pour un contrat avec un expert automobile ?",
      "Comment documenter les échanges avec les tiers impliqués ?",
    ],
    transport_logistique: [
      "Comment rédiger une fiche de traitement pour le suivi GPS ?",
      "Quelles clauses pour un contrat avec un prestataire de tracking ?",
      "Comment documenter les accès aux données de géolocalisation ?",
    ],
  };

  const specificQuestions = sector && sectorQuestions[sector] 
    ? sectorQuestions[sector] 
    : [
        "Quelles données dois-je mentionner dans ma fiche de traitement ?",
        "Quelles clauses sont obligatoires dans un contrat sous-traitant ?",
      ];

  return [...specificQuestions.slice(0, 2), ...baseQuestions];
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ context, mode = 'audit' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('Document IA');
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [size, setSize] = useState({ width: 380, height: 480 });
  const [isResizing, setIsResizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const { toast } = useToast();

  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 400;
  const MAX_WIDTH = 600;
  const MAX_HEIGHT = 700;

  const commands = mode === 'documentation' 
    ? getDocumentationCommands(context?.sector, context?.legalFramework) 
    : getAuditCommands(context?.sector, context?.legalFramework);
  const questions = mode === 'documentation' 
    ? getDocumentationQuestions(context?.sector) 
    : getAuditQuestions(context?.sector);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle resize mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;
      
      const deltaX = resizeRef.current.startX - e.clientX;
      const deltaY = resizeRef.current.startY - e.clientY;
      
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeRef.current.startWidth + deltaX));
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, resizeRef.current.startHeight + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  const toggleExpand = () => {
    if (isExpanded) {
      setSize({ width: 380, height: 480 });
    } else {
      setSize({ width: MAX_WIDTH, height: MAX_HEIGHT });
    }
    setIsExpanded(!isExpanded);
  };

  const getLastAssistantMessage = (): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].content) {
        return messages[i].content;
      }
    }
    return null;
  };

  const handleExportPDF = async () => {
    const content = getLastAssistantMessage();
    if (!content) {
      toast({
        title: 'Aucun contenu à exporter',
        description: 'Générez d\'abord un document avec l\'assistant IA.',
        variant: 'destructive',
      });
      return;
    }

    setExporting('pdf');
    try {
      await exportAIContentToPDF(content, {
        organisationName: context?.organisationName,
        sector: context?.sector,
        documentType: currentDocumentType,
      });
      toast({
        title: 'Export réussi',
        description: 'Le document PDF a été téléchargé.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le PDF.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportWord = async () => {
    const content = getLastAssistantMessage();
    if (!content) {
      toast({
        title: 'Aucun contenu à exporter',
        description: 'Générez d\'abord un document avec l\'assistant IA.',
        variant: 'destructive',
      });
      return;
    }

    setExporting('word');
    try {
      await exportAIContentToWord(content, {
        organisationName: context?.organisationName,
        sector: context?.sector,
        documentType: currentDocumentType,
      });
      toast({
        title: 'Export réussi',
        description: 'Le document Word a été téléchargé.',
      });
    } catch (error) {
      console.error('Word export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le document Word.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const sendMessage = async (messageText: string, documentType?: string) => {
    if (!messageText.trim() || isLoading) return;

    if (documentType) {
      setCurrentDocumentType(documentType);
    }

    const userMsg: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          context 
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur de communication avec l'assistant");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const resetConversation = () => {
    setMessages([]);
    setInput('');
    setCurrentDocumentType('Document IA');
  };

  const sectorLabels: Record<string, string> = {
    'sante_reglementee_pharmacien': 'Pharmacien',
    'sante_reglementee_medecin': 'Médecin',
    'sante_non_reglementee_bien_etre': 'Bien-être',
    'assurance_vie': 'Assurance vie',
    'assurance_non_vie': 'Assurance non-vie',
    'transport_logistique': 'Transport',
  };

  const hasAssistantMessage = messages.some(m => m.role === 'assistant' && m.content);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <Bot className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card 
      className="fixed bottom-4 right-4 shadow-2xl z-50 flex flex-col"
      style={{ width: size.width, height: size.height }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-tl-lg"
        title="Redimensionner"
      >
        <GripVertical className="h-3 w-3 rotate-45" />
      </div>

      <CardHeader className="py-2 px-3 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ml-4">
            <Sparkles className="h-4 w-4" />
            <CardTitle className="text-sm">SyrelaTrust IA</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetConversation}
                className="hover:bg-primary-foreground/10 text-primary-foreground h-6 w-6"
                title="Nouvelle conversation"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleExpand}
              className="hover:bg-primary-foreground/10 text-primary-foreground h-6 w-6"
              title={isExpanded ? "Réduire" : "Agrandir"}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/10 text-primary-foreground h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {context?.organisationName && (
          <div className="flex flex-wrap gap-1 mt-1 ml-4">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-[10px] py-0">
              {context.organisationName}
            </Badge>
            {context.sector && (
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-[10px] py-0">
                {sectorLabels[context.sector] || context.sector}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-3">
              <div className="text-center text-muted-foreground py-1">
                <Bot className="h-8 w-8 mx-auto mb-1 text-primary/50" />
                <p className="text-xs font-medium">
                  Assistant RGPD intelligent
                </p>
              </div>

              {context?.organisationName && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {mode === 'documentation' ? 'Aide à la rédaction' : 'Documents'}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {commands.map((cmd, index) => {
                        const Icon = cmd.icon;
                        return (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-auto py-1.5 px-2 flex flex-col items-center gap-0.5 border",
                              cmd.bgColor
                            )}
                            onClick={() => sendMessage(cmd.command, cmd.documentType)}
                          >
                            <Icon className={cn("h-3.5 w-3.5", cmd.color)} />
                            <span className="text-[10px] font-medium text-center leading-tight">
                              {cmd.label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Questions fréquentes
                    </p>
                    <div className="space-y-1">
                      {questions.slice(0, 3).map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-1 px-2 text-[10px] hover:bg-muted"
                          onClick={() => sendMessage(question)}
                        >
                          <MessageSquare className="h-2.5 w-2.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
                          <span className="line-clamp-1">{question}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!context?.organisationName && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] text-amber-800">
                    Sélectionnez un organisme pour générer l'audit RGPD.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-2",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%] text-sm",
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <span className="text-sm text-muted-foreground">Génération en cours...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Export buttons */}
        {hasAssistantMessage && !isLoading && (
          <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Exporter le document :</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting !== null}
                className="h-7 text-xs"
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Download className="h-3 w-3 mr-1" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportWord}
                disabled={exporting !== null}
                className="h-7 text-xs"
              >
                {exporting === 'word' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <FileDown className="h-3 w-3 mr-1" />
                )}
                Word
              </Button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question sur le RGPD..."
              className="min-h-[44px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
