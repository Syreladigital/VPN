-- Add corrective actions notification settings to email_notification_settings table
ALTER TABLE public.email_notification_settings
ADD COLUMN IF NOT EXISTS notify_corrective_actions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS corrective_actions_reminder_days integer DEFAULT 7;