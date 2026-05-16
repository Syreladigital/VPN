/**
 * Legal references for RGPD / CNIL (France-only)
 */

/**
 * Returns the text unchanged (Tunisia adaptation removed)
 */
export function adaptLegalReference(text: string): string {
  return text;
}

/**
 * Adapts question legal references — no-op, kept for compatibility
 */
export function adaptQuestionLegalReferences<T>(question: T): T {
  return question;
}

/**
 * Returns the data protection authority name
 */
export function getDataProtectionAuthority(): string {
  return 'CNIL';
}

/**
 * Returns the legal framework short name
 */
export function getLegalFrameworkShortName(): string {
  return 'RGPD';
}

/**
 * Returns the legal framework full name
 */
export function getLegalFrameworkFullName(): string {
  return 'Règlement Général sur la Protection des Données (UE 2016/679)';
}
