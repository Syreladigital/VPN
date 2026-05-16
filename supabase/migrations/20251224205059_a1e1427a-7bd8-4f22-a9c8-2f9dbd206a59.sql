-- Table pour les tentatives d'audit
CREATE TABLE public.audit_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL, -- ex: "rgpd_pharmacie", "rgpd_medecin", etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  score_percent INTEGER NOT NULL DEFAULT 0,
  earned NUMERIC NOT NULL DEFAULT 0,
  possible NUMERIC NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_questions INTEGER NOT NULL DEFAULT 0
);

-- Table pour les réponses aux questions d'audit
CREATE TABLE public.audit_attempt_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_value TEXT, -- La valeur sélectionnée (pas le label)
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT, -- 'faible', 'moyen', 'eleve'
  section_id TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

-- Table pour les scores par section/module
CREATE TABLE public.audit_attempt_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  earned NUMERIC NOT NULL DEFAULT 0,
  possible NUMERIC NOT NULL DEFAULT 0,
  percent INTEGER NOT NULL DEFAULT 0,
  conform_status TEXT NOT NULL DEFAULT 'non_conforme' CHECK (conform_status IN ('conforme', 'partiel', 'non_conforme')),
  conforme_count INTEGER NOT NULL DEFAULT 0,
  partiel_count INTEGER NOT NULL DEFAULT 0,
  non_conforme_count INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, section_id)
);

-- Enable RLS
ALTER TABLE public.audit_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_attempt_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_attempts
CREATE POLICY "Users can view their own audit_attempts"
ON public.audit_attempts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_attempts.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own audit_attempts"
ON public.audit_attempts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_attempts.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own audit_attempts"
ON public.audit_attempts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_attempts.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own audit_attempts"
ON public.audit_attempts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = audit_attempts.organisation_id
  AND organisations.user_id = auth.uid()
));

-- RLS Policies for audit_attempt_answers
CREATE POLICY "Users can view their own audit_attempt_answers"
ON public.audit_attempt_answers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_answers.attempt_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own audit_attempt_answers"
ON public.audit_attempt_answers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_answers.attempt_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own audit_attempt_answers"
ON public.audit_attempt_answers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_answers.attempt_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own audit_attempt_answers"
ON public.audit_attempt_answers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_answers.attempt_id
  AND organisations.user_id = auth.uid()
));

-- RLS Policies for audit_attempt_sections
CREATE POLICY "Users can view their own audit_attempt_sections"
ON public.audit_attempt_sections FOR SELECT
USING (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_sections.attempt_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own audit_attempt_sections"
ON public.audit_attempt_sections FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_sections.attempt_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own audit_attempt_sections"
ON public.audit_attempt_sections FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_sections.attempt_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own audit_attempt_sections"
ON public.audit_attempt_sections FOR DELETE
USING (EXISTS (
  SELECT 1 FROM audit_attempts
  JOIN organisations ON organisations.id = audit_attempts.organisation_id
  WHERE audit_attempts.id = audit_attempt_sections.attempt_id
  AND organisations.user_id = auth.uid()
));

-- Admins can view all attempts for statistics
CREATE POLICY "Admins can view all audit_attempts"
ON public.audit_attempts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can view all audit_attempt_answers"
ON public.audit_attempt_answers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can view all audit_attempt_sections"
ON public.audit_attempt_sections FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_audit_attempts_organisation ON public.audit_attempts(organisation_id);
CREATE INDEX idx_audit_attempts_status ON public.audit_attempts(status);
CREATE INDEX idx_audit_attempts_completed ON public.audit_attempts(organisation_id, status, completed_at DESC);
CREATE INDEX idx_audit_attempt_answers_attempt ON public.audit_attempt_answers(attempt_id);
CREATE INDEX idx_audit_attempt_sections_attempt ON public.audit_attempt_sections(attempt_id);