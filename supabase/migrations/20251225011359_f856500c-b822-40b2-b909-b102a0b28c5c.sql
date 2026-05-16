-- Add email templates for data breaches
ALTER TABLE public.email_notification_settings
ADD COLUMN IF NOT EXISTS breach_email_subject_template TEXT DEFAULT '{{SEVERITY_EMOJI}} Alerte violation de données - {{BREACH_NATURE}}',
ADD COLUMN IF NOT EXISTS breach_email_body_template TEXT DEFAULT 'Bonjour,

Une violation de données a été détectée et nécessite votre attention.

Nature : {{BREACH_NATURE}}
Date de la violation : {{BREACH_DATE}}
Date de découverte : {{DISCOVERY_DATE}}
Échéance notification CNIL : {{NOTIFICATION_DEADLINE}}

{{ADDITIONAL_INFO}}

Cordialement,
L''équipe {{ORGANISATION_NAME}}';

-- Add email templates for subprocessor reminders
ALTER TABLE public.email_notification_settings
ADD COLUMN IF NOT EXISTS subprocessor_email_subject_template TEXT DEFAULT '📋 Rappel : Révision sous-traitant - {{SUBPROCESSOR_NAME}}',
ADD COLUMN IF NOT EXISTS subprocessor_email_body_template TEXT DEFAULT 'Bonjour,

Un rappel de révision pour un sous-traitant est prévu.

Sous-traitant : {{SUBPROCESSOR_NAME}}
Activité : {{SUBPROCESSOR_ACTIVITY}}
Date de révision prévue : {{REVIEW_DATE}}
Localisation : {{SUBPROCESSOR_LOCATION}}

{{ADDITIONAL_INFO}}

Cordialement,
L''équipe {{ORGANISATION_NAME}}';

COMMENT ON COLUMN public.email_notification_settings.breach_email_subject_template IS 'Template for breach email subject. Variables: {{SEVERITY_EMOJI}}, {{BREACH_NATURE}}, {{ORGANISATION_NAME}}';
COMMENT ON COLUMN public.email_notification_settings.breach_email_body_template IS 'Template for breach email body. Variables: {{BREACH_NATURE}}, {{BREACH_DATE}}, {{DISCOVERY_DATE}}, {{NOTIFICATION_DEADLINE}}, {{ADDITIONAL_INFO}}, {{ORGANISATION_NAME}}';
COMMENT ON COLUMN public.email_notification_settings.subprocessor_email_subject_template IS 'Template for subprocessor email subject. Variables: {{SUBPROCESSOR_NAME}}, {{ORGANISATION_NAME}}';
COMMENT ON COLUMN public.email_notification_settings.subprocessor_email_body_template IS 'Template for subprocessor email body. Variables: {{SUBPROCESSOR_NAME}}, {{SUBPROCESSOR_ACTIVITY}}, {{REVIEW_DATE}}, {{SUBPROCESSOR_LOCATION}}, {{ADDITIONAL_INFO}}, {{ORGANISATION_NAME}}';