-- Table audit_results : source unique de vérité pour les résultats d'audit par organisation
-- Cette table stocke les résultats agrégés calculés UNE SEULE FOIS à la fin de chaque audit

CREATE TABLE IF NOT EXISTS public.audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL,
  
  -- Scores globaux
  compliance_score INTEGER NOT NULL DEFAULT 0,
  earned NUMERIC NOT NULL DEFAULT 0,
  possible NUMERIC NOT NULL DEFAULT 0,
  
  -- Compteurs de conformité
  conforme_count INTEGER NOT NULL DEFAULT 0,
  partiel_count INTEGER NOT NULL DEFAULT 0,
  non_conforme_count INTEGER NOT NULL DEFAULT 0,
  
  -- Compteurs de risques
  risks_high INTEGER NOT NULL DEFAULT 0,
  risks_medium INTEGER NOT NULL DEFAULT 0,
  risks_low INTEGER NOT NULL DEFAULT 0,
  
  -- Compteurs d'actions
  actions_total INTEGER NOT NULL DEFAULT 0,
  actions_completed INTEGER NOT NULL DEFAULT 0,
  
  -- Questions
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_questions INTEGER NOT NULL DEFAULT 0,
  
  -- Métadonnées
  is_latest BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(organisation_id, attempt_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_audit_results_org_latest ON public.audit_results(organisation_id, is_latest) WHERE is_latest = true;
CREATE INDEX idx_audit_results_org_type ON public.audit_results(organisation_id, audit_type);

-- Enable RLS
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own audit_results"
ON public.audit_results
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own audit_results"
ON public.audit_results
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own audit_results"
ON public.audit_results
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own audit_results"
ON public.audit_results
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Admins can view all audit_results"
ON public.audit_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_audit_results_updated_at
BEFORE UPDATE ON public.audit_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour marquer le dernier résultat comme is_latest
CREATE OR REPLACE FUNCTION public.update_audit_results_latest()
RETURNS TRIGGER AS $$
BEGIN
  -- Marquer tous les anciens résultats de cette organisation comme non-latest
  UPDATE public.audit_results
  SET is_latest = false
  WHERE organisation_id = NEW.organisation_id
    AND id != NEW.id
    AND is_latest = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger pour gérer is_latest automatiquement
CREATE TRIGGER audit_results_set_latest
AFTER INSERT ON public.audit_results
FOR EACH ROW
EXECUTE FUNCTION public.update_audit_results_latest();