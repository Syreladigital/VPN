-- Table pour stocker les réponses aux questionnaires
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  sector TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour accélérer les requêtes par organisation
CREATE INDEX idx_questionnaire_responses_org ON public.questionnaire_responses(organisation_id);

-- Unicité: une seule réponse par organisation (on met à jour plutôt que créer)
CREATE UNIQUE INDEX idx_questionnaire_responses_unique ON public.questionnaire_responses(organisation_id);

-- Table pour stocker les scores de conformité calculés
CREATE TABLE public.conformity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  -- Scores globaux
  overall_score INTEGER NOT NULL DEFAULT 0,
  overall_max_score INTEGER NOT NULL DEFAULT 0,
  overall_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  conformity_level TEXT NOT NULL DEFAULT 'non_evalue',
  -- Détails par section
  section_scores JSONB DEFAULT '[]',
  -- Compteurs
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_questions INTEGER NOT NULL DEFAULT 0,
  critical_questions_total INTEGER NOT NULL DEFAULT 0,
  critical_questions_passed INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,
  medium_risk_count INTEGER NOT NULL DEFAULT 0,
  low_risk_count INTEGER NOT NULL DEFAULT 0,
  -- Recommandations prioritaires
  priority_recommendations JSONB DEFAULT '[]',
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour accélérer les requêtes
CREATE INDEX idx_conformity_scores_org ON public.conformity_scores(organisation_id);
CREATE UNIQUE INDEX idx_conformity_scores_unique ON public.conformity_scores(organisation_id);
CREATE INDEX idx_conformity_scores_level ON public.conformity_scores(conformity_level);

-- Enable RLS
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conformity_scores ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaire_responses
CREATE POLICY "Users can view their own questionnaire_responses"
ON public.questionnaire_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = questionnaire_responses.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own questionnaire_responses"
ON public.questionnaire_responses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = questionnaire_responses.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own questionnaire_responses"
ON public.questionnaire_responses FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = questionnaire_responses.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own questionnaire_responses"
ON public.questionnaire_responses FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = questionnaire_responses.organisation_id
  AND organisations.user_id = auth.uid()
));

-- Policies for conformity_scores
CREATE POLICY "Users can view their own conformity_scores"
ON public.conformity_scores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = conformity_scores.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own conformity_scores"
ON public.conformity_scores FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = conformity_scores.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own conformity_scores"
ON public.conformity_scores FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = conformity_scores.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own conformity_scores"
ON public.conformity_scores FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = conformity_scores.organisation_id
  AND organisations.user_id = auth.uid()
));

-- Admins can view all scores for statistics
CREATE POLICY "Admins can view all conformity_scores"
ON public.conformity_scores FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_questionnaire_responses_updated_at
BEFORE UPDATE ON public.questionnaire_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conformity_scores_updated_at
BEFORE UPDATE ON public.conformity_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();