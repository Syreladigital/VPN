import { z } from 'zod';

// ==================== Authentication Schemas ====================
export const emailSchema = z
  .string()
  .trim()
  .min(1, "L'email est requis")
  .email("Adresse email invalide")
  .max(255, "L'email ne doit pas dépasser 255 caractères");

export const passwordSchema = z
  .string()
  .min(6, "Le mot de passe doit contenir au moins 6 caractères")
  .max(128, "Le mot de passe ne doit pas dépasser 128 caractères");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// ==================== Profile Schemas ====================
export const nameSchema = z
  .string()
  .trim()
  .max(100, "Maximum 100 caractères")
  .optional()
  .transform(val => val || null);

export const requiredNameSchema = z
  .string()
  .trim()
  .min(1, "Ce champ est requis")
  .max(100, "Maximum 100 caractères");

export const profileFormSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  job_title: nameSchema,
});

// ==================== Organisation Schemas ====================
export const organisationNameSchema = z
  .string()
  .trim()
  .min(1, "Le nom de l'organisme est requis")
  .max(200, "Le nom ne doit pas dépasser 200 caractères");

export const organisationFormSchema = z.object({
  name: organisationNameSchema,
  sector: z.enum([
    'sante_reglementee_pharmacien',
    'sante_reglementee_medecin',
    'sante_non_reglementee_bien_etre',
    'assurance_vie',
    'assurance_non_vie',
    'transport_logistique'
  ], { errorMap: () => ({ message: "Le secteur sélectionné n'est pas valide" }) }),
  size: z.enum(['independant', 'tpe', 'pme', 'groupe'], { 
    errorMap: () => ({ message: "La taille sélectionnée n'est pas valide" }) 
  }),
  dpoRole: z.enum(['interne', 'externe', 'consultant'], { 
    errorMap: () => ({ message: "Le rôle DPO sélectionné n'est pas valide" }) 
  }),
  country: z.enum(['france', 'eu_other', 'tunisie'], { 
    errorMap: () => ({ message: "Le pays sélectionné n'est pas valide" }) 
  }),
});

// ==================== Data Breach Schemas ====================
export const dataBreachFormSchema = z.object({
  breach_date: z.string().min(1, "La date de la violation est requise"),
  discovery_date: z.string().min(1, "La date de découverte est requise"),
  nature: z
    .string()
    .trim()
    .min(1, "La nature de la violation est requise")
    .max(2000, "Maximum 2000 caractères"),
  categories_affected: z
    .string()
    .max(1000, "Maximum 1000 caractères")
    .optional(),
  estimated_count: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0),
      "Le nombre doit être un entier positif"
    ),
  consequences: z.string().max(2000, "Maximum 2000 caractères").optional(),
  measures_taken: z.string().max(2000, "Maximum 2000 caractères").optional(),
  persons_informed: z.boolean(),
  cnil_notified: z.boolean(),
  status: z.enum(['open', 'notified', 'closed']),
  notes: z.string().max(2000, "Maximum 2000 caractères").optional(),
});

// ==================== Rights Request Schemas ====================
export const rightsRequestFormSchema = z.object({
  request_date: z.string().min(1, "La date de réception est requise"),
  requester_name: z
    .string()
    .trim()
    .min(1, "Le nom du demandeur est requis")
    .max(200, "Maximum 200 caractères"),
  requester_email: z
    .string()
    .trim()
    .max(255, "Maximum 255 caractères")
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Adresse email invalide"
    ),
  identity_verified: z.boolean(),
  right_type: z.string().min(1, "Le type de droit est requis"),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  response_content: z.string().max(5000, "Maximum 5000 caractères").optional(),
  notes: z.string().max(2000, "Maximum 2000 caractères").optional(),
});

// ==================== Processing Record Schemas ====================
export const processingRecordFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom du traitement est requis")
    .max(200, "Maximum 200 caractères"),
  purposes: z
    .string()
    .trim()
    .min(1, "Les finalités sont requises")
    .max(2000, "Maximum 2000 caractères"),
  legal_basis: z.string().min(1, "La base légale est requise"),
  data_categories: z.string().max(1000, "Maximum 1000 caractères").optional(),
  data_subjects: z.string().max(1000, "Maximum 1000 caractères").optional(),
  recipients: z.string().max(1000, "Maximum 1000 caractères").optional(),
  transfers_outside_eu: z.boolean(),
  transfer_safeguards: z.string().max(2000, "Maximum 2000 caractères").optional(),
  retention_period: z.string().max(200, "Maximum 200 caractères").optional(),
  security_measures: z.string().max(2000, "Maximum 2000 caractères").optional(),
  dpo_validation: z.boolean(),
});

// ==================== Subprocessor Schemas ====================
export const subprocessorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom du sous-traitant est requis")
    .max(200, "Maximum 200 caractères"),
  activity: z
    .string()
    .trim()
    .min(1, "L'activité est requise")
    .max(2000, "Maximum 2000 caractères"),
  data_processed: z.string().max(1000, "Maximum 1000 caractères").optional(),
  contract_signed: z.boolean(),
  contract_date: z.string().optional(),
  hds_certified: z.boolean(),
  location: z.string().max(200, "Maximum 200 caractères").optional(),
  eu_based: z.boolean(),
  transfer_mechanism: z.string().max(500, "Maximum 500 caractères").optional(),
  review_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
});

// ==================== Utility Functions ====================
export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map((err) => err.message);
  return { success: false, errors };
}

export function getFirstError<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): string | null {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return null;
  }
  
  return result.error.errors[0]?.message || "Erreur de validation";
}
