import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  recipients: string[];
  alertType: "breach" | "rights_request" | "subprocessor" | "test";
  subject: string;
  title: string;
  message: string;
  deadline?: string;
  urgencyLevel: "critical" | "warning" | "info";
  actionUrl?: string;
  organisationName?: string;
  organisationId?: string;
  notificationId?: string;
  senderName?: string;
  replyToEmail?: string;
}

const getUrgencyColor = (level: string): string => {
  switch (level) {
    case "critical": return "#dc2626";
    case "warning": return "#f59e0b";
    default: return "#3b82f6";
  }
};

const getUrgencyLabel = (level: string): string => {
  switch (level) {
    case "critical": return "URGENT";
    case "warning": return "ATTENTION";
    default: return "INFORMATION";
  }
};

const generateEmailHTML = (data: EmailRequest): string => {
  const urgencyColor = getUrgencyColor(data.urgencyLevel);
  const urgencyLabel = getUrgencyLabel(data.urgencyLevel);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🛡️ Syrela Trust
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                Plateforme de conformité RGPD
              </p>
            </td>
          </tr>
          
          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: ${urgencyColor}; padding: 12px 40px; text-align: center;">
              <span style="color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                ⚠️ ${urgencyLabel} - ${data.alertType === 'breach' ? 'VIOLATION DE DONNÉES' : data.alertType === 'rights_request' ? 'DEMANDE DE DROITS' : data.alertType === 'subprocessor' ? 'RÉVISION SOUS-TRAITANT' : 'NOTIFICATION TEST'}
              </span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${data.organisationName ? `
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
                Organisation : <strong style="color: #374151;">${data.organisationName}</strong>
              </p>
              ` : ''}
              
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                ${data.title}
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${data.message}
              </p>
              
              ${data.deadline ? `
              <div style="background-color: #fef3c7; border-left: 4px solid ${urgencyColor}; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>📅 Échéance :</strong> ${data.deadline}
                </p>
              </div>
              ` : ''}
              
              ${data.actionUrl ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Voir les détails →
                </a>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Cette notification a été envoyée automatiquement par Syrela Trust.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Syrela Trust - Conformité RGPD
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notification-email function called");
  
  if (req.method === "OPTIONS") {
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

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.error("Missing SMTP configuration");
      throw new Error("Configuration SMTP manquante. Veuillez configurer les secrets SMTP.");
    }

    const emailData: EmailRequest = await req.json();
    console.log("Email request received:", { 
      recipients: emailData.recipients, 
      alertType: emailData.alertType,
      subject: emailData.subject 
    });

    if (!emailData.recipients || emailData.recipients.length === 0) {
      throw new Error("Aucun destinataire spécifié");
    }

    // Verify user has access to the organisation
    if (emailData.organisationId) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const userId = claimsData.claims.sub;
      const { data: orgData } = await supabaseAdmin
        .from('organisations')
        .select('id')
        .eq('id', emailData.organisationId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!orgData) {
        // Check if admin
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

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    const htmlContent = generateEmailHTML(emailData);

    console.log("Sending email via SMTP...");
    
    const senderName = emailData.senderName || "Syrela Trust";
    const fromAddress = `${senderName} <${smtpUser}>`;
    
    const sendOptions: any = {
      from: fromAddress,
      to: emailData.recipients,
      subject: emailData.subject,
      content: emailData.message,
      html: htmlContent,
    };
    
    if (emailData.replyToEmail) {
      sendOptions.replyTo = emailData.replyToEmail;
    }
    
    await client.send(sendOptions);
    await client.close();

    console.log("Email sent successfully to:", emailData.recipients);

    // Log email to database
    if (emailData.organisationId) {
      try {
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase.from("email_logs").insert({
          organisation_id: emailData.organisationId,
          notification_id: emailData.notificationId || null,
          recipients: emailData.recipients,
          subject: emailData.subject,
          alert_type: emailData.alertType,
          status: "sent",
        });
        console.log("Email logged to database");
      } catch (logError) {
        console.error("Failed to log email:", logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email envoyé avec succès",
        recipients: emailData.recipients 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Erreur lors de l'envoi de l'email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
