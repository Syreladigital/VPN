-- Create email notification settings table
CREATE TABLE public.email_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  email_recipients TEXT[] DEFAULT '{}',
  notify_breaches BOOLEAN DEFAULT true,
  notify_rights_requests BOOLEAN DEFAULT true,
  notify_subprocessors BOOLEAN DEFAULT true,
  breach_reminder_hours INTEGER DEFAULT 48,
  rights_reminder_days INTEGER DEFAULT 7,
  subprocessor_reminder_days INTEGER DEFAULT 30,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organisation_id)
);

-- Enable RLS
ALTER TABLE public.email_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own email_notification_settings"
ON public.email_notification_settings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = email_notification_settings.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own email_notification_settings"
ON public.email_notification_settings
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = email_notification_settings.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own email_notification_settings"
ON public.email_notification_settings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = email_notification_settings.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own email_notification_settings"
ON public.email_notification_settings
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = email_notification_settings.organisation_id
  AND organisations.user_id = auth.uid()
));

-- Create email logs table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  recipients TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_logs
CREATE POLICY "Users can view their own email_logs"
ON public.email_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = email_logs.organisation_id
  AND organisations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own email_logs"
ON public.email_logs
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organisations
  WHERE organisations.id = email_logs.organisation_id
  AND organisations.user_id = auth.uid()
));