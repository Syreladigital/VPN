-- Create messages table for internal messaging
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_from_consultant BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages for their organisations"
ON public.messages
FOR SELECT
USING (
  organisation_id IN (
    SELECT id FROM public.organisations WHERE user_id = auth.uid()
  )
  OR
  sender_id = auth.uid()
  OR
  public.has_role(auth.uid(), 'admin'::app_role)
  OR
  public.is_super_admin(auth.uid())
);

CREATE POLICY "Authenticated users can create messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    -- User can send to their own organisation
    organisation_id IN (SELECT id FROM public.organisations WHERE user_id = auth.uid())
    OR
    -- Admins/consultants can send to any organisation
    public.has_role(auth.uid(), 'admin'::app_role)
    OR
    public.is_super_admin(auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (
  organisation_id IN (SELECT id FROM public.organisations WHERE user_id = auth.uid())
  OR
  sender_id = auth.uid()
  OR
  public.has_role(auth.uid(), 'admin'::app_role)
  OR
  public.is_super_admin(auth.uid())
);

-- Create trigger for updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;