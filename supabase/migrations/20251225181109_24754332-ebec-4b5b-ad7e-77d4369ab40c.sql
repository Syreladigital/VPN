-- Create corrective_actions table
CREATE TABLE public.corrective_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.audit_attempts(id) ON DELETE SET NULL,
  question_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  impact_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own corrective_actions"
ON public.corrective_actions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = corrective_actions.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own corrective_actions"
ON public.corrective_actions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = corrective_actions.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own corrective_actions"
ON public.corrective_actions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = corrective_actions.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own corrective_actions"
ON public.corrective_actions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = corrective_actions.organisation_id
  AND organisations.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_corrective_actions_updated_at
BEFORE UPDATE ON public.corrective_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_corrective_actions_organisation ON public.corrective_actions(organisation_id);
CREATE INDEX idx_corrective_actions_status ON public.corrective_actions(status);