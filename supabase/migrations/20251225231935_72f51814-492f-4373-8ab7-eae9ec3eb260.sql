-- 2. Créer la table client_access pour lier clients aux organisations
CREATE TABLE IF NOT EXISTS public.client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_user_id, organisation_id)
);

-- 3. Activer RLS sur client_access
ALTER TABLE public.client_access ENABLE ROW LEVEL SECURITY;

-- 4. Fonction pour vérifier l'accès client
CREATE OR REPLACE FUNCTION public.has_client_access(_user_id uuid, _organisation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.client_access
    WHERE client_user_id = _user_id
      AND organisation_id = _organisation_id
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 5. Fonction pour vérifier si un utilisateur est un client
CREATE OR REPLACE FUNCTION public.is_client(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'client'
  )
$$;

-- 6. Policies pour client_access
CREATE POLICY "Clients can view their own access"
  ON public.client_access FOR SELECT
  USING (client_user_id = auth.uid());

CREATE POLICY "Admins can manage client access"
  ON public.client_access FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- 7. Policies lecture seule pour clients sur audit_results
CREATE POLICY "Clients can view audit_results for their organisations"
  ON public.audit_results FOR SELECT
  USING (has_client_access(auth.uid(), organisation_id));

-- 8. Policies lecture seule pour clients sur audit_attempt_sections
CREATE POLICY "Clients can view audit_attempt_sections for their organisations"
  ON public.audit_attempt_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audit_attempts aa
      JOIN public.client_access ca ON ca.organisation_id = aa.organisation_id
      WHERE aa.id = audit_attempt_sections.attempt_id
      AND ca.client_user_id = auth.uid()
      AND (ca.expires_at IS NULL OR ca.expires_at > now())
    )
  );

-- 9. Policies lecture seule pour clients sur corrective_actions
CREATE POLICY "Clients can view corrective_actions for their organisations"
  ON public.corrective_actions FOR SELECT
  USING (has_client_access(auth.uid(), organisation_id));

-- 10. Policies lecture seule pour clients sur processing_records
CREATE POLICY "Clients can view processing_records for their organisations"
  ON public.processing_records FOR SELECT
  USING (has_client_access(auth.uid(), organisation_id));

-- 11. Policies lecture seule pour clients sur data_breaches
CREATE POLICY "Clients can view data_breaches for their organisations"
  ON public.data_breaches FOR SELECT
  USING (has_client_access(auth.uid(), organisation_id));

-- 12. Policies lecture seule pour clients sur rights_requests
CREATE POLICY "Clients can view rights_requests for their organisations"
  ON public.rights_requests FOR SELECT
  USING (has_client_access(auth.uid(), organisation_id));

-- 13. Policies lecture seule pour clients sur subprocessors
CREATE POLICY "Clients can view subprocessors for their organisations"
  ON public.subprocessors FOR SELECT
  USING (has_client_access(auth.uid(), organisation_id));

-- 14. Trigger pour updated_at sur client_access
CREATE TRIGGER update_client_access_updated_at
  BEFORE UPDATE ON public.client_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();