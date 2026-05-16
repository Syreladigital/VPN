-- Create table for flash audit results
CREATE TABLE public.flash_audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL DEFAULT 'pharmacy',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Summary counts
  critical_count INTEGER NOT NULL DEFAULT 0,
  sensitive_count INTEGER NOT NULL DEFAULT 0,
  acceptable_count INTEGER NOT NULL DEFAULT 0,
  total_alerts INTEGER NOT NULL DEFAULT 0,
  
  -- Detailed results stored as JSONB
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  flow_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flash_audit_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own flash_audit_results"
ON public.flash_audit_results
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = flash_audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own flash_audit_results"
ON public.flash_audit_results
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = flash_audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own flash_audit_results"
ON public.flash_audit_results
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = flash_audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own flash_audit_results"
ON public.flash_audit_results
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = flash_audit_results.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Admins can view all flash_audit_results"
ON public.flash_audit_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Clients can view flash_audit_results for their organisations"
ON public.flash_audit_results
FOR SELECT
USING (has_client_access(auth.uid(), organisation_id));

-- Create index for faster queries
CREATE INDEX idx_flash_audit_results_organisation ON public.flash_audit_results(organisation_id);
CREATE INDEX idx_flash_audit_results_completed_at ON public.flash_audit_results(completed_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_flash_audit_results_updated_at
BEFORE UPDATE ON public.flash_audit_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();