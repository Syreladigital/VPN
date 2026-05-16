-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'breach_deadline', 'rights_deadline', 'subprocessor_review', 'breach_overdue', 'rights_overdue'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID, -- ID of the related record (breach, request, subprocessor)
  reference_type TEXT, -- 'data_breach', 'rights_request', 'subprocessor'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = notifications.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = notifications.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = notifications.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = notifications.organisation_id
  AND organisations.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();