-- Add RLS policies for organization owners to manage client_access
-- This allows the owner of an organization to manage client access records

-- Policy: Organization owners can view client accesses for their organizations
CREATE POLICY "Organisation owners can view client access"
ON public.client_access
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = auth.uid()
  )
);

-- Policy: Organization owners can create client access for their organizations
CREATE POLICY "Organisation owners can insert client access"
ON public.client_access
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = auth.uid()
  )
);

-- Policy: Organization owners can update client access for their organizations
CREATE POLICY "Organisation owners can update client access"
ON public.client_access
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = auth.uid()
  )
);

-- Policy: Organization owners can delete client access for their organizations
CREATE POLICY "Organisation owners can delete client access"
ON public.client_access
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organisations
    WHERE organisations.id = client_access.organisation_id
    AND organisations.user_id = auth.uid()
  )
);

-- Add unique constraint to prevent duplicate client access records
ALTER TABLE public.client_access
ADD CONSTRAINT client_access_unique_client_org UNIQUE (client_user_id, organisation_id);