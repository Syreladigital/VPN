
-- Allow clients to view messages for organisations they have access to
CREATE POLICY "Clients can view messages for their organisations"
ON public.messages
FOR SELECT
USING (has_client_access(auth.uid(), organisation_id));

-- Allow clients to insert messages for organisations they have access to
CREATE POLICY "Clients can insert messages for their organisations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND has_client_access(auth.uid(), organisation_id)
  AND sender_id = auth.uid()
);

-- Allow clients to update their own messages (mark as read)
CREATE POLICY "Clients can update messages for their organisations"
ON public.messages
FOR UPDATE
USING (has_client_access(auth.uid(), organisation_id));

-- Allow clients to view organisations they have access to
CREATE POLICY "Clients can view their linked organisations"
ON public.organisations
FOR SELECT
USING (has_client_access(auth.uid(), id));
