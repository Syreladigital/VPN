-- Create enum types for RGPD audit
CREATE TYPE public.sector_type AS ENUM (
  'sante_reglementee_pharmacien',
  'sante_reglementee_medecin',
  'sante_non_reglementee_bien_etre',
  'assurance_vie',
  'assurance_non_vie',
  'transport_logistique'
);

CREATE TYPE public.organisation_size_type AS ENUM (
  'independant',
  'tpe',
  'pme',
  'groupe'
);

CREATE TYPE public.dpo_role_type AS ENUM (
  'interne',
  'externe',
  'consultant'
);

CREATE TYPE public.conformity_status_type AS ENUM (
  'conforme',
  'partiellement_conforme',
  'non_conforme'
);

CREATE TYPE public.risk_level_type AS ENUM (
  'faible',
  'moyen',
  'eleve'
);

-- Organisations table
CREATE TABLE public.organisations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector sector_type NOT NULL,
  size organisation_size_type NOT NULL,
  dpo_role dpo_role_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- Public access for now (no auth required)
CREATE POLICY "Allow public read access to organisations"
ON public.organisations FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to organisations"
ON public.organisations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to organisations"
ON public.organisations FOR UPDATE
USING (true);

-- Audits table (one audit per organisation, can be updated over time)
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  conformity_score INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  completed_actions INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'en_cours',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audits"
ON public.audits FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to audits"
ON public.audits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to audits"
ON public.audits FOR UPDATE
USING (true);

-- Audit modules table
CREATE TABLE public.audit_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status conformity_status_type NOT NULL DEFAULT 'non_conforme',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(audit_id, module_key)
);

ALTER TABLE public.audit_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit_modules"
ON public.audit_modules FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to audit_modules"
ON public.audit_modules FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to audit_modules"
ON public.audit_modules FOR UPDATE
USING (true);

-- Audit items table (elements within each module)
CREATE TABLE public.audit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.audit_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status conformity_status_type NOT NULL DEFAULT 'non_conforme',
  risk_level risk_level_type NOT NULL DEFAULT 'moyen',
  risk_justification TEXT,
  dpo_comments TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit_items"
ON public.audit_items FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to audit_items"
ON public.audit_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to audit_items"
ON public.audit_items FOR UPDATE
USING (true);

-- Audit actions table (corrective actions)
CREATE TABLE public.audit_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.audit_items(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit_actions"
ON public.audit_actions FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to audit_actions"
ON public.audit_actions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to audit_actions"
ON public.audit_actions FOR UPDATE
USING (true);

-- Audit history table (snapshots of conformity over time)
CREATE TABLE public.audit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  conformity_score INTEGER NOT NULL,
  total_actions INTEGER NOT NULL,
  completed_actions INTEGER NOT NULL,
  high_risk_count INTEGER NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.audit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit_history"
ON public.audit_history FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to audit_history"
ON public.audit_history FOR INSERT
WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organisations_updated_at
BEFORE UPDATE ON public.organisations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audits_updated_at
BEFORE UPDATE ON public.audits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_modules_updated_at
BEFORE UPDATE ON public.audit_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_items_updated_at
BEFORE UPDATE ON public.audit_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_actions_updated_at
BEFORE UPDATE ON public.audit_actions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();