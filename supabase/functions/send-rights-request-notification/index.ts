import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RightsRequestNotification {
  requestId: string;
  requesterName: string;
  requesterEmail: string;
  rightType: string;
  status: string;
  responseContent?: string;
  organisationId: string;
  organisationName?: string;
}

interface EmailTemplate {
  rights_email_subject_template: string | null;
  rights_email_body_template: string | null;
  rights_email_completed_message: string | null;
  rights_email_rejected_message: string | null;
  rights_email_in_progress_message: string | null;
}

const defaultTemplates: EmailTemplate = {
  rights_email_subject_template: '{{STATUS_EMOJI}} Votre demande de droits a été {{STATUS_TEXT}}',
  rights_email_body_template: `Bonjour {{REQUESTER_NAME}},

{{STATUS_MESSAGE}}

{{RESPONSE_CONTENT}}

Cordialement,
L'équipe {{ORGANISATION_NAME}}`,
  rights_email_completed_message: "Nous avons le plaisir de vous informer que votre demande d'exercice de votre {{RIGHT_TYPE}} a été traitée avec succès.",
  rights_email_rejected_message: "Suite à votre demande d'exercice de votre {{RIGHT_TYPE}}, nous vous informons que celle-ci n'a pas pu être satisfaite.",
  rights_email_in_progress_message: "Nous vous informons que votre demande d'exercice de votre {{RIGHT_TYPE}} est en cours de traitement.",
};

const getRightTypeLabel = (rightType: string): string => {
  const labels: Record<string, string> = {
    'access': "droit d'accès",
    'rectification': 'droit de rectification',
    'erasure': "droit à l'effacement",
    'portability': 'droit à la portabilité',
    'opposition': "droit d'opposition",
    'limitation': 'droit à la limitation du traitement',
  };
  return labels[rightType] || rightType;
};

const getStatusText = (status: string): string => {
  const labels: Record<string, string> = {
    'completed': 'traitée',
    'rejected': 'rejetée',
    'in_progress': 'en cours',
  };
  return labels[status] || status;
};

const getStatusEmoji = (status: string): string => {
  const emojis: Record<string, string> = {
    'completed': '✅',
    'rejected': '❌',
    'in_progress': '⏳',
  };
  return emojis[status] || '📋';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'completed': '#22c55e',
    'rejected': '#ef4444',
    'in_progress': '#f59e0b',
  };
  return colors[status] || '#6b7280';
};

const replaceVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value || '');
  });
  return result;
};

const generateEmailContent = (data: RightsRequestNotification, templates: EmailTemplate): { subject: string; textContent: string; htmlContent: string } => {
  const rightTypeLabel = getRightTypeLabel(data.rightType);
  const statusText = getStatusText(data.status);
  const statusEmoji = getStatusEmoji(data.status);
  const statusColor = getStatusColor(data.status);
  const orgName = data.organisationName || 'Notre organisation';

  let statusMessageTemplate = '';
  switch (data.status) {
    case 'completed':
      statusMessageTemplate = templates.rights_email_completed_message || defaultTemplates.rights_email_completed_message!;
      break;
    case 'rejected':
      statusMessageTemplate = templates.rights_email_rejected_message || defaultTemplates.rights_email_rejected_message!;
      break;
    case 'in_progress':
      statusMessageTemplate = templates.rights_email_in_progress_message || defaultTemplates.rights_email_in_progress_message!;
      break;
    default:
      statusMessageTemplate = '';
  }

  const variables: Record<string, string> = {
    '{{REQUESTER_NAME}}': data.requesterName,
    '{{RIGHT_TYPE}}': rightTypeLabel,
    '{{STATUS_TEXT}}': statusText,
    '{{STATUS_EMOJI}}': statusEmoji,
    '{{ORGANISATION_NAME}}': orgName,
    '{{RESPONSE_CONTENT}}': data.responseContent || '',
    '{{STATUS_MESSAGE}}': replaceVariables(statusMessageTemplate, { '{{RIGHT_TYPE}}': rightTypeLabel }),
  };

  const subjectTemplate = templates.rights_email_subject_template || defaultTemplates.rights_email_subject_template!;
  const subject = replaceVariables(subjectTemplate, variables);

  const bodyTemplate = templates.rights_email_body_template || defaultTemplates.rights_email_body_template!;
  const textContent = replaceVariables(bodyTemplate, variables);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notification de demande de droits</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 10px 20px; background-color: ${statusColor}; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${statusEmoji} Demande de droits - ${data.status === 'completed' ? 'Traitée' : data.status === 'rejected' ? 'Rejetée' : 'En cours'}
          </div>
        </div>
        
        <div style="white-space: pre-wrap; color: #4b5563;">
${textContent.split('\n').map(line => `          ${line}`).join('\n')}
        </div>
        
        ${data.responseContent && data.status !== 'in_progress' ? `
        <div style="background-color: ${data.status === 'completed' ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: ${data.status === 'completed' ? '#166534' : '#991b1b'};"><strong>${data.status === 'completed' ? 'Réponse' : 'Motif'} :</strong></p>
          <p style="margin: 10px 0 0 0; color: ${data.status === 'completed' ? '#166534' : '#991b1b'};">${data.responseContent}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Ce message a été envoyé automatiquement suite au traitement de votre demande RGPD.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, textContent, htmlContent };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-rights-request-notification function called");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Session invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: RightsRequestNotification = await req.json();
    console.log("Rights request notification data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.requesterEmail || !data.requesterName || !data.status || !data.rightType) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns the organisation
    if (data.organisationId) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const userId = claimsData.claims.sub;
      
      const { data: orgData } = await supabaseAdmin
        .from('organisations')
        .select('id')
        .eq('id', data.organisationId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!orgData) {
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
          return new Response(
            JSON.stringify({ error: 'Non autorisé - Pas d\'accès à cette organisation' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Get SMTP credentials
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error("SMTP configuration missing");
      return new Response(
        JSON.stringify({ error: "SMTP configuration missing" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch email templates
    let templates: EmailTemplate = { ...defaultTemplates };
    if (data.organisationId) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: settingsData, error: settingsError } = await supabase
        .from('email_notification_settings')
        .select('rights_email_subject_template, rights_email_body_template, rights_email_completed_message, rights_email_rejected_message, rights_email_in_progress_message')
        .eq('organisation_id', data.organisationId)
        .maybeSingle();

      if (!settingsError && settingsData) {
        templates = { ...templates, ...settingsData };
      }
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    const { subject, textContent, htmlContent } = generateEmailContent(data, templates);

    console.log(`Sending notification email to: ${data.requesterEmail}`);

    await client.send({
      from: smtpUser,
      to: data.requesterEmail,
      subject: subject,
      content: textContent,
      html: htmlContent,
    });

    await client.close();
    console.log("Rights request notification email sent successfully");

    // Log email
    if (data.organisationId) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from('email_logs').insert({
        organisation_id: data.organisationId,
        recipients: [data.requesterEmail],
        subject: subject,
        alert_type: 'rights_request_status',
        status: 'sent',
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Error sending rights request notification:", error);
    
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'envoi de la notification" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
