-- Table pour le registre des traitements (Article 30 RGPD)
CREATE TABLE public.processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purposes TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  data_categories JSONB DEFAULT '[]'::jsonb,
  data_subjects TEXT[] DEFAULT '{}',
  recipients TEXT[] DEFAULT '{}',
  transfers_outside_eu BOOLEAN DEFAULT false,
  transfer_safeguards TEXT,
  retention_period TEXT,
  security_measures TEXT,
  dpo_validation BOOLEAN DEFAULT false,
  dpo_validation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour le registre des violations (Article 33 RGPD)
CREATE TABLE public.data_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  breach_date TIMESTAMPTZ NOT NULL,
  discovery_date TIMESTAMPTZ NOT NULL,
  notification_deadline TIMESTAMPTZ,
  cnil_notified BOOLEAN DEFAULT false,
  cnil_notification_date TIMESTAMPTZ,
  nature TEXT NOT NULL,
  categories_affected TEXT[] DEFAULT '{}',
  estimated_count INTEGER,
  consequences TEXT,
  measures_taken TEXT,
  persons_informed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour le registre des demandes de droits (DSAR)
CREATE TABLE public.rights_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  request_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  identity_verified BOOLEAN DEFAULT false,
  right_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_date TIMESTAMPTZ,
  response_content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour le registre des sous-traitants (Article 28 RGPD)
CREATE TABLE public.subprocessors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  data_processed JSONB DEFAULT '[]'::jsonb,
  contract_signed BOOLEAN DEFAULT false,
  contract_date DATE,
  hds_certified BOOLEAN DEFAULT false,
  location TEXT,
  eu_based BOOLEAN DEFAULT true,
  transfer_mechanism TEXT,
  review_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.processing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for processing_records
CREATE POLICY "Users can view their own processing_records"
ON public.processing_records FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = processing_records.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own processing_records"
ON public.processing_records FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = processing_records.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own processing_records"
ON public.processing_records FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = processing_records.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own processing_records"
ON public.processing_records FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = processing_records.organisation_id
  AND organisations.user_id = auth.uid()
));

-- RLS Policies for data_breaches
CREATE POLICY "Users can view their own data_breaches"
ON public.data_breaches FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = data_breaches.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own data_breaches"
ON public.data_breaches FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = data_breaches.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own data_breaches"
ON public.data_breaches FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = data_breaches.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own data_breaches"
ON public.data_breaches FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = data_breaches.organisation_id
  AND organisations.user_id = auth.uid()
));

-- RLS Policies for rights_requests
CREATE POLICY "Users can view their own rights_requests"
ON public.rights_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = rights_requests.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own rights_requests"
ON public.rights_requests FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = rights_requests.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own rights_requests"
ON public.rights_requests FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = rights_requests.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own rights_requests"
ON public.rights_requests FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = rights_requests.organisation_id
  AND organisations.user_id = auth.uid()
));

-- RLS Policies for subprocessors
CREATE POLICY "Users can view their own subprocessors"
ON public.subprocessors FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = subprocessors.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own subprocessors"
ON public.subprocessors FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = subprocessors.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own subprocessors"
ON public.subprocessors FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = subprocessors.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own subprocessors"
ON public.subprocessors FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.organisations
  WHERE organisations.id = subprocessors.organisation_id
  AND organisations.user_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_processing_records_updated_at
BEFORE UPDATE ON public.processing_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_breaches_updated_at
BEFORE UPDATE ON public.data_breaches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rights_requests_updated_at
BEFORE UPDATE ON public.rights_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subprocessors_updated_at
BEFORE UPDATE ON public.subprocessors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();