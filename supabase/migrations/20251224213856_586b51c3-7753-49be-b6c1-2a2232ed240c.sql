-- Add sender_name and reply_to_email columns to email_notification_settings
ALTER TABLE public.email_notification_settings 
ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT 'Syrela Trust',
ADD COLUMN IF NOT EXISTS reply_to_email TEXT;