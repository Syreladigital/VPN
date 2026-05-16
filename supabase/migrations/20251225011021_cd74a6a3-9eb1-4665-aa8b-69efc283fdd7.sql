-- Add custom email template fields to email_notification_settings
ALTER TABLE public.email_notification_settings
ADD COLUMN IF NOT EXISTS rights_email_subject_template TEXT DEFAULT '{{STATUS_EMOJI}} Votre demande de droits a été {{STATUS_TEXT}}',
ADD COLUMN IF NOT EXISTS rights_email_body_template TEXT DEFAULT 'Bonjour {{REQUESTER_NAME}},

{{STATUS_MESSAGE}}

{{RESPONSE_CONTENT}}

Cordialement,
L''équipe {{ORGANISATION_NAME}}',
ADD COLUMN IF NOT EXISTS rights_email_completed_message TEXT DEFAULT 'Nous avons le plaisir de vous informer que votre demande d''exercice de votre {{RIGHT_TYPE}} a été traitée avec succès.',
ADD COLUMN IF NOT EXISTS rights_email_rejected_message TEXT DEFAULT 'Suite à votre demande d''exercice de votre {{RIGHT_TYPE}}, nous vous informons que celle-ci n''a pas pu être satisfaite.',
ADD COLUMN IF NOT EXISTS rights_email_in_progress_message TEXT DEFAULT 'Nous vous informons que votre demande d''exercice de votre {{RIGHT_TYPE}} est en cours de traitement.';

COMMENT ON COLUMN public.email_notification_settings.rights_email_subject_template IS 'Template for email subject. Variables: {{STATUS_EMOJI}}, {{STATUS_TEXT}}, {{RIGHT_TYPE}}, {{REQUESTER_NAME}}, {{ORGANISATION_NAME}}';
COMMENT ON COLUMN public.email_notification_settings.rights_email_body_template IS 'Template for email body. Variables: {{STATUS_EMOJI}}, {{STATUS_TEXT}}, {{STATUS_MESSAGE}}, {{RIGHT_TYPE}}, {{REQUESTER_NAME}}, {{ORGANISATION_NAME}}, {{RESPONSE_CONTENT}}';