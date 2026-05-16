import { LegalFramework } from '@/types/rgpd';

// Mapping des références légales RGPD vers Tunisie
const LEGAL_REFERENCE_MAPPINGS: Record<string, string> = {
  // Autorités de contrôle
  'CNIL': 'INPDP',
  'la CNIL': 'l\'INPDP',
  'à la CNIL': 'à l\'INPDP',
  'de la CNIL': 'de l\'INPDP',
  
  // Références au règlement
  'RGPD': 'Projet de loi 2025/95',
  'du RGPD': 'du Projet de loi 2025/95',
  'le RGPD': 'le Projet de loi 2025/95',
  'au RGPD': 'au Projet de loi 2025/95',
  
  // Articles spécifiques - mapping vers équivalents tunisiens
  'article 30 du RGPD': 'Article 15 du Projet de loi 2025/95',
  'Article 30 du RGPD': 'Article 15 du Projet de loi 2025/95',
  'articles 13 et 14 du RGPD': 'Articles 23-25 du Projet de loi 2025/95',
  'Articles 13 et 14 du RGPD': 'Articles 23-25 du Projet de loi 2025/95',
  'article 33 du RGPD': 'Article 45 du Projet de loi 2025/95',
  'Article 33 du RGPD': 'Article 45 du Projet de loi 2025/95',
  'article 35 du RGPD': 'Article 48 du Projet de loi 2025/95',
  'Article 35 du RGPD': 'Article 48 du Projet de loi 2025/95',
  'article 37 du RGPD': 'Article 16 du Projet de loi 2025/95',
  'Article 37 du RGPD': 'Article 16 du Projet de loi 2025/95',
  'article 44 du RGPD': 'Articles 51-53 du Projet de loi 2025/95',
  'Article 44 du RGPD': 'Articles 51-53 du Projet de loi 2025/95',
  'article 17 du RGPD': 'Article 28 du Projet de loi 2025/95',
  'Article 17 du RGPD': 'Article 28 du Projet de loi 2025/95',
  'article 20 du RGPD': 'Article 32 du Projet de loi 2025/95',
  'Article 20 du RGPD': 'Article 32 du Projet de loi 2025/95',
  'article 21 du RGPD': 'Article 33 du Projet de loi 2025/95',
  'Article 21 du RGPD': 'Article 33 du Projet de loi 2025/95',
  'article 22 du RGPD': 'Article 90 du Projet de loi 2025/95',
  'Article 22 du RGPD': 'Article 90 du Projet de loi 2025/95',
  'articles 15 à 22 du RGPD': 'Articles 26-35 du Projet de loi 2025/95',
  'Articles 15 à 22 du RGPD': 'Articles 26-35 du Projet de loi 2025/95',
  
  // Catégories
  'Gouvernance RGPD': 'Gouvernance Protection des Données',
  
  // Termes génériques
  'Union européenne': 'territoire tunisien',
  'l\'UE': 'la Tunisie',
  'européen': 'tunisien',
  'européenne': 'tunisienne',
  'européennes': 'tunisiennes',
  'européens': 'tunisiens',
};

/**
 * Remplace les références légales dans un texte selon le cadre juridique
 */
export function adaptLegalReference(text: string, legalFramework: LegalFramework): string {
  if (!text || legalFramework !== 'loi_tunisie_2025') {
    return text;
  }
  
  let result = text;
  
  // Trier les mappings par longueur décroissante pour éviter les remplacements partiels
  const sortedMappings = Object.entries(LEGAL_REFERENCE_MAPPINGS)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [rgpdRef, tunisiaRef] of sortedMappings) {
    result = result.replace(new RegExp(escapeRegExp(rgpdRef), 'g'), tunisiaRef);
  }
  
  return result;
}

/**
 * Échappe les caractères spéciaux pour une utilisation dans une regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Adapte toutes les références légales d'un objet question
 */
export function adaptQuestionLegalReferences<T extends { 
  question?: string; 
  description?: string; 
  category?: string;
  guidance?: {
    title?: string;
    description?: string;
    actions?: string[];
    resources?: { label: string; url?: string }[];
  };
}>(question: T, legalFramework: LegalFramework): T {
  if (legalFramework !== 'loi_tunisie_2025') {
    return question;
  }
  
  return {
    ...question,
    question: question.question ? adaptLegalReference(question.question, legalFramework) : question.question,
    description: question.description ? adaptLegalReference(question.description, legalFramework) : question.description,
    category: question.category ? adaptLegalReference(question.category, legalFramework) : question.category,
    guidance: question.guidance ? {
      ...question.guidance,
      title: question.guidance.title ? adaptLegalReference(question.guidance.title, legalFramework) : question.guidance.title,
      description: question.guidance.description ? adaptLegalReference(question.guidance.description, legalFramework) : question.guidance.description,
      actions: question.guidance.actions?.map(a => adaptLegalReference(a, legalFramework)),
      resources: question.guidance.resources?.map(r => ({
        ...r,
        label: adaptLegalReference(r.label, legalFramework)
      }))
    } : question.guidance
  };
}

/**
 * Obtient le nom de l'autorité de contrôle selon le cadre juridique
 */
export function getDataProtectionAuthority(legalFramework: LegalFramework): string {
  return legalFramework === 'loi_tunisie_2025' ? 'INPDP' : 'CNIL';
}

/**
 * Obtient le nom du cadre juridique en format court
 */
export function getLegalFrameworkShortName(legalFramework: LegalFramework): string {
  return legalFramework === 'loi_tunisie_2025' ? 'Projet de loi 2025/95' : 'RGPD';
}

/**
 * Obtient le nom du cadre juridique en format long
 */
export function getLegalFrameworkFullName(legalFramework: LegalFramework): string {
  return legalFramework === 'loi_tunisie_2025' 
    ? 'Projet de loi organique n° 2025/95 relative à la protection des données personnelles'
    : 'Règlement Général sur la Protection des Données (UE 2016/679)';
}
