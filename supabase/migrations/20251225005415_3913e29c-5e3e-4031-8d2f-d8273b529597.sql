-- Add column to enable/disable notifications to rights requesters when their request is processed
ALTER TABLE public.email_notification_settings
ADD COLUMN IF NOT EXISTS notify_requester_on_status_change boolean DEFAULT true;