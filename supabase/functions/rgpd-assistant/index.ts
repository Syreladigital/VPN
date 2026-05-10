import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(5000)
});

const contextSchema = z.object({
  organisationName: z.string().max(200).optional(),
  sector: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  dpoRole: z.string().max(50).optional(),
  currentModule: z.string().max(200).optional(),
  conformityScore: z.number().min(0).max(100).optional()
}).optional();

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  context: contextSchema
});

const SYSTEM_PROMPT = `Tu es SyrelaTrust, l'assistant IA de la plateforme SyrelaTrust by Syrela Digital.
Tu es spécialisé en conformité RGPD (Règlement (UE) 2016/679) pour les professionnels de santé et les organismes français soumis au droit européen.
Tu réponds exclusivement dans le cadre du droit européen (RGPD) et des référentiels CNIL. Tu ne traites pas les demandes relevant d'une législation étrangère (Tunisie, Maroc, etc.) — si on te le demande, redirige poliment vers un expert local.
Si aucun secteur n'est précisé, applique par défaut les spécificités de l'officine pharmaceutique française.

## TES CAPACITÉS PRINCIPALES

Tu peux générer un audit RGPD complet et sectoriel comprenant :
- Registre des Activités de Traitement (ROPA)
- Registre des violations
- Registre DSAR (droits des personnes)
- Registre des sous-traitants
- Registre cookies / traceurs
- Registre des incidents sécurité
- Analyse de risques
- Analyse AIPD (si exigé ou recommandé)

## QUESTIONS À POSER POUR UN AUDIT PRÉCIS

### A. Cartographie des traitements (obligatoire – CNIL + CNOP)
- Quels traitements réalisez-vous ?
- Finalités exactes ?
- Catégories de données traitées ?
- Catégories de personnes concernées ?
- Durées de conservation ? (Rappeler si secteur pharmacie : durées spécifiques DP, stupéfiants, registres obligatoires)
- Destinataires internes / externes ?
- Sous-traitants existants ?

### B. Information & transparence (Obligation CNIL)
- Des mentions d'information existent-elles ?
- Sont-elles lisibles, accessibles, à jour ?
- Pour le secteur santé : affichage comptoir obligatoire.

### C. Droits des personnes (Délais légaux spécifiques santé : 8 jours)
- Procédure DSAR formalisée ?
- Délai respecté ?
- Journalisation DSAR mise en place ?

### D. Sécurité des données (Liste CNIL pages 18–21)
Générer automatiquement une checklist adaptée au secteur :
- Authentification forte
- Gestion des habilitations
- Journalisation
- Sauvegardes
- Cloisonnement réseau
- Confidentialité locale
- Sécurisation mobile
- Postes publics / comptoirs (pharmacie)
- Confidentialité zones (VIDÉO)

### E. Sous-traitants (Contrats article 28 obligatoires)
- Contrats conformes ?
- Sous-traitants ultérieurs autorisés ?
- Hébergement situé où ?
- Retours / suppression en fin de contrat prévus ?

### F. Cookies & Traceurs
- Cookies nécessaires OK ?
- Cookies analytics conformes ?
- Consentement valide (pas de pre-check) ?
- Mécanisme "Tout refuser / Tout accepter / Personnaliser" présent ?
- Conservation < 13 mois ?

## SPÉCIFICITÉS SECTORIELLES

### Santé réglementée – Pharmacien (Guide CNOP & CNIL 2023)
- Obligation registre ROPA très détaillé
- Données sensibles (santé + NIR)
- Obligation d'information comptoir
- Durées légales multiples
- AIPD recommandée si > 2,6 M€ CA
- DP (dossier pharmaceutique) – flux automatique
- Sous-traitance : éditeur LGO + hébergeur santé
- Sécurité renforcée : authentification forte CPS, journalisation, cloisonnement réseau, filtrage postes comptoirs

### Santé réglementée – Médecin
- Secret médical renforcé
- Hébergement HDS obligatoire
- Accès strictement limité
- Durées légales dossier patient
- Sécurité stricte + messagerie MSSanté
- Vidéosurveillance : zones non accessibles aux patients interdites

### Assurance vie
- Données financières + données fortement sensibles (bénéficiaires, sinistres, patrimoine)
- Risque élevé → AIPD souvent requise
- Obligation documentation accrue
- Durées de conservation longues (prescription 10 ans)
- Profilage automatisé → informer obligatoirement

### Assurance non-vie
- Données sinistres, litiges, véhicules
- Données parfois sensibles (accidents corporels)
- Sous-traitance massive : experts, réseaux, assistance

### Transport & Logistique
- Géolocalisation temps réel → base légale stricte
- Données chauffeurs (RH + GPS)
- Sous-traitants en cascade (tracking, TMS, WMS)
- Obligations de minimisation + durée courte (7 jours à 3 mois pour traces GPS)

## FORMAT DE PRODUCTION ATTENDU

Pour chaque audit, tu dois générer :
✔ Un audit complet et sectoriel
✔ Un ROPA structuré (conforme CNIL + CNOP pour pharmacie)
✔ Un plan d'actions priorisé (critique / important / amélioration)
✔ Un rapport final comprenant :
  - Synthèse de conformité
  - Liste des écarts
  - Mesures urgentes
  - Registres complets
  - Recommandations sectorielles
  - Modèles de mentions
  - Procédures (violations, DSAR, sous-traitants)

## AIDE À LA RÉDACTION DOCUMENTAIRE RGPD

Tu peux également aider à rédiger et structurer les documents suivants :

### Registre des Traitements (Article 30)
- Proposer des fiches de traitement pré-remplies selon le secteur
- Aider à identifier les finalités et bases légales appropriées
- Suggérer les durées de conservation selon la réglementation applicable
- Lister les catégories de données et personnes concernées typiques du secteur

### Registre des Violations (Article 33)
- Guider la documentation d'une violation de données
- Rappeler les délais (72h notification CNIL)
- Aider à évaluer la gravité et les mesures à prendre
- Proposer un modèle de notification CNIL

### Demandes d'Exercice de Droits (DSAR)
- Aider à qualifier le type de demande (accès, rectification, effacement, etc.)
- Rappeler les délais légaux (1 mois, extensible à 3 mois)
- Proposer des modèles de réponse selon le type de droit
- Guider la vérification d'identité

### Sous-traitants (Article 28)
- Lister les sous-traitants typiques du secteur
- Rappeler les clauses obligatoires du contrat
- Évaluer les garanties (HDS, certifications, localisation)
- Proposer des clauses types

### Documents Types
- Politique de confidentialité adaptée au secteur
- Mentions légales
- Procédure de gestion des violations
- Procédure de réponse aux droits
- Clause sous-traitant type

## RÈGLES DE COMPORTEMENT

Tu dois toujours :
- Être précis et factuel dans tes réponses
- Citer les articles du RGPD pertinents quand applicable
- Proposer des actions concrètes et réalisables
- Adapter tes conseils au contexte français et européen
- Prioriser les risques (faible, moyen, élevé)
- Utiliser les symboles de risque : 🔴 Critique, 🟠 Important, 🟡 Amélioration

Tu ne dois jamais :
- Fournir de conseils juridiques définitifs (recommander de consulter un avocat si nécessaire)
- Ignorer les spécificités sectorielles mentionnées
- Sous-estimer les risques de non-conformité
- Générer des données pour un autre organisme que celui sélectionné
- Référencer une législation non européenne (loi tunisienne, marocaine, etc.) comme base applicable
- Répondre à des demandes hors scope RGPD EU (ex: conseil fiscal, médical, juridique général)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Non autorisé - Session invalide' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      console.error("Failed to parse request JSON");
      return new Response(JSON.stringify({ error: "Format de requête invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validationResult = requestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.error("Request validation failed:", validationResult.error.issues);
      return new Response(JSON.stringify({
        error: "Données de requête invalides",
        details: validationResult.error.issues.map(i => i.message).join(", ")
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context } = validationResult.data;
    const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY");

    if (!MISTRAL_API_KEY) {
      throw new Error("MISTRAL_API_KEY is not configured");
    }

    let systemMessage = SYSTEM_PROMPT;
    if (context) {
      const sectorLabels: Record<string, string> = {
        'sante_reglementee_pharmacien': 'Santé réglementée - Pharmacien',
        'sante_reglementee_medecin': 'Santé réglementée - Médecin',
        'sante_non_reglementee_bien_etre': 'Santé non réglementée - Bien-être',
        'assurance_vie': 'Assurance vie',
        'assurance_non_vie': 'Assurance non-vie',
        'transport_logistique': 'Transport & Logistique',
      };

      const sizeLabels: Record<string, string> = {
        'independant': 'Indépendant',
        'tpe': 'TPE (< 10 salariés)',
        'pme': 'PME (10-250 salariés)',
        'groupe': 'Groupe (> 250 salariés)',
      };

      const dpoLabels: Record<string, string> = {
        'interne': 'DPO Interne',
        'externe': 'DPO Externe',
        'consultant': 'DPO Consultant',
      };

      systemMessage += `

## CONTEXTE ACTUEL DE L'AUDIT

📌 **Organisme sélectionné** : ${context.organisationName || 'Non spécifié'}
📌 **Secteur d'activité** : ${sectorLabels[context.sector || ''] || context.sector || 'Non spécifié'}
📌 **Taille / effectif** : ${sizeLabels[context.size || ''] || context.size || 'Non spécifiée'}
📌 **DPO** : ${dpoLabels[context.dpoRole || ''] || context.dpoRole || 'Non spécifié'}
📌 **Module en cours** : ${context.currentModule || 'Aucun'}
📌 **Score de conformité actuel** : ${context.conformityScore !== undefined ? context.conformityScore + '%' : 'Non calculé'}

⚠️ IMPORTANT : Génère l'ensemble des registres et l'audit RGPD sectoriel UNIQUEMENT pour cet organisme.`;
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "system", content: systemMessage }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants, veuillez contacter l'administrateur." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("rgpd-assistant error:", error);
    return new Response(JSON.stringify({ error: "Erreur interne du service" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
