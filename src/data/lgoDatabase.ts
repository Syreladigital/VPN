// Base LGO officine & hébergeurs — statut HDS au regard du décret n°2026-209
// Deadline conformité hébergement HDS : 26 septembre 2026
// ⚠️ Vérifier les statuts auprès des éditeurs — peuvent évoluer

export type HdsStatus = 'certifie' | 'en_cours' | 'non_certifie' | 'inconnu';
export type Decret2026Status = 'conforme' | 'en_cours' | 'non_conforme' | 'a_verifier';

export interface LGOEntry {
  id: string;
  nom: string;
  editeur: string;
  siteEditeur?: string;
  hdsStatus: HdsStatus;
  hebergeur: string;
  hebergeurHdsStatus: HdsStatus;
  decret2026Status: Decret2026Status;
  certificationUrl?: string;
  notes?: string;
  derniereVerification: string;
}

export interface HebergeurEntry {
  id: string;
  nom: string;
  hdsStatus: HdsStatus;
  certificationNumero?: string;
  certificationUrl?: string;
  categoriesHds: string[];
  derniereVerification: string;
}

// ─────────────────────────────────────────────
// LOGICIELS DE GESTION D'OFFICINE (LGO)
// ─────────────────────────────────────────────
export const LGO_DATABASE: LGOEntry[] = [
  {
    id: 'pharmagest',
    nom: 'iSantéPharma (Pharmagest)',
    editeur: 'Pharmagest Interactive',
    siteEditeur: 'https://www.pharmagest.com',
    hdsStatus: 'certifie',
    hebergeur: 'Pharmagest Datacenter',
    hebergeurHdsStatus: 'certifie',
    decret2026Status: 'conforme',
    certificationUrl: 'https://esante.gouv.fr/produits-services/hds',
    notes: 'Hébergement HDS intégré. Certification ANS vérifiée.',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'pharmavitale',
    nom: 'Pharmavitale',
    editeur: 'Pharmagest Interactive',
    siteEditeur: 'https://www.pharmagest.com',
    hdsStatus: 'certifie',
    hebergeur: 'Pharmagest Datacenter',
    hebergeurHdsStatus: 'certifie',
    decret2026Status: 'conforme',
    certificationUrl: 'https://esante.gouv.fr/produits-services/hds',
    notes: 'Même infrastructure que Pharmagest. HDS confirmé.',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'wellpharma',
    nom: 'Wellpharma',
    editeur: 'Pharmagest Interactive',
    siteEditeur: 'https://www.pharmagest.com',
    hdsStatus: 'certifie',
    hebergeur: 'Pharmagest Datacenter',
    hebergeurHdsStatus: 'certifie',
    decret2026Status: 'conforme',
    notes: 'Filiale Pharmagest — infrastructure HDS partagée.',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'lgpi',
    nom: 'LGPI',
    editeur: 'PHR Groupe',
    siteEditeur: 'https://www.phr.fr',
    hdsStatus: 'en_cours',
    hebergeur: 'OVHcloud',
    hebergeurHdsStatus: 'certifie',
    decret2026Status: 'en_cours',
    certificationUrl: 'https://www.ovhcloud.com/fr/enterprise/certification-conformity/hds/',
    notes: "Hébergeur OVH certifié HDS. Certification de l'éditeur en cours — vérifier avant sept. 2026.",
    derniereVerification: '2026-05-01',
  },
  {
    id: 'winpharma',
    nom: 'Winpharma',
    editeur: 'PHR Groupe',
    siteEditeur: 'https://www.phr.fr',
    hdsStatus: 'en_cours',
    hebergeur: 'OVHcloud',
    hebergeurHdsStatus: 'certifie',
    decret2026Status: 'en_cours',
    notes: "Hébergeur OVH certifié HDS. Vérifier statut éditeur auprès de PHR Groupe.",
    derniereVerification: '2026-05-01',
  },
  {
    id: 'smartrx',
    nom: 'SmartRx',
    editeur: 'McKesson France',
    siteEditeur: 'https://www.mckesson.fr',
    hdsStatus: 'non_certifie',
    hebergeur: 'AWS Europe (Dublin)',
    hebergeurHdsStatus: 'non_certifie',
    decret2026Status: 'non_conforme',
    notes: "⚠️ AWS n'est pas hébergeur HDS certifié ANS. Données hors UE potentiellement. Contact éditeur requis.",
    derniereVerification: '2026-05-01',
  },
  {
    id: 'caduciel',
    nom: 'Caduciel',
    editeur: 'Astera',
    siteEditeur: 'https://www.astera.fr',
    hdsStatus: 'inconnu',
    hebergeur: 'Astera Datacenter',
    hebergeurHdsStatus: 'inconnu',
    decret2026Status: 'a_verifier',
    notes: 'Contacter Astera pour obtenir la documentation de certification HDS.',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'isipharm',
    nom: 'Isipharm',
    editeur: 'Isinova',
    siteEditeur: 'https://www.isinova.fr',
    hdsStatus: 'inconnu',
    hebergeur: 'Non communiqué',
    hebergeurHdsStatus: 'inconnu',
    decret2026Status: 'a_verifier',
    notes: 'Documentation HDS non disponible publiquement. Demander à votre éditeur.',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'axiolog',
    nom: 'Axiolog',
    editeur: 'Axiolog',
    hdsStatus: 'inconnu',
    hebergeur: 'Non communiqué',
    hebergeurHdsStatus: 'inconnu',
    decret2026Status: 'a_verifier',
    notes: 'Contacter directement Axiolog pour le statut HDS.',
    derniereVerification: '2026-05-01',
  },
];

// ─────────────────────────────────────────────
// HÉBERGEURS HDS CERTIFIÉS ANS
// ─────────────────────────────────────────────
export const HEBERGEURS_HDS: HebergeurEntry[] = [
  {
    id: 'pharmagest-dc',
    nom: 'Pharmagest Datacenter',
    hdsStatus: 'certifie',
    categoriesHds: ['1a', '1b', '2', '3', '4', '5', '6'],
    certificationUrl: 'https://esante.gouv.fr/produits-services/hds',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'ovhcloud',
    nom: 'OVHcloud',
    hdsStatus: 'certifie',
    certificationNumero: 'CERT-HDS-OVH-001',
    certificationUrl: 'https://www.ovhcloud.com/fr/enterprise/certification-conformity/hds/',
    categoriesHds: ['1a', '1b', '2', '3', '4', '5', '6'],
    derniereVerification: '2026-05-01',
  },
  {
    id: 'outscale',
    nom: '3DS Outscale (Dassault)',
    hdsStatus: 'certifie',
    certificationUrl: 'https://fr.outscale.com/conformite/hds/',
    categoriesHds: ['1a', '1b', '2', '3', '4', '5', '6'],
    derniereVerification: '2026-05-01',
  },
  {
    id: 'cegedim',
    nom: 'Cegedim Health Cloud',
    hdsStatus: 'certifie',
    categoriesHds: ['1a', '1b', '2', '3'],
    certificationUrl: 'https://esante.gouv.fr/produits-services/hds',
    derniereVerification: '2026-05-01',
  },
  {
    id: 'azure-fr',
    nom: 'Microsoft Azure (France Central)',
    hdsStatus: 'certifie',
    certificationUrl: 'https://learn.microsoft.com/fr-fr/azure/compliance/offerings/offering-hds-france',
    categoriesHds: ['1a', '1b', '2', '3', '4'],
    derniereVerification: '2026-05-01',
  },
  {
    id: 'gcp-fr',
    nom: 'Google Cloud (europe-west9 Paris)',
    hdsStatus: 'certifie',
    certificationUrl: 'https://cloud.google.com/security/compliance/hds',
    categoriesHds: ['1a', '1b', '2', '3'],
    derniereVerification: '2026-05-01',
  },
  {
    id: 'aws-eu',
    nom: 'AWS Europe (eu-west-3 Paris)',
    hdsStatus: 'en_cours',
    categoriesHds: [],
    derniereVerification: '2026-05-01',
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
export const HDS_STATUS_LABELS: Record<HdsStatus, string> = {
  certifie: 'Certifié HDS',
  en_cours: 'Certification en cours',
  non_certifie: 'Non certifié',
  inconnu: 'Statut inconnu',
};

export const DECRET_STATUS_LABELS: Record<Decret2026Status, string> = {
  conforme: 'Conforme déc. 2026-209',
  en_cours: 'En cours de mise en conformité',
  non_conforme: 'Non conforme',
  a_verifier: 'À vérifier',
};

export const HDS_STATUS_COLORS: Record<HdsStatus, string> = {
  certifie: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  en_cours: 'bg-amber-100 text-amber-700 border-amber-300',
  non_certifie: 'bg-red-100 text-red-700 border-red-300',
  inconnu: 'bg-gray-100 text-gray-600 border-gray-300',
};

export const DECRET_STATUS_COLORS: Record<Decret2026Status, string> = {
  conforme: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  en_cours: 'bg-amber-100 text-amber-700 border-amber-300',
  non_conforme: 'bg-red-100 text-red-700 border-red-300',
  a_verifier: 'bg-gray-100 text-gray-600 border-gray-300',
};
