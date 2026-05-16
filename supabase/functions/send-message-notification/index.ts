import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  messageId: string;
  organisationId: string;
  subject: string;
  isFromConsultant: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("send-message-notification function called");

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messageId, organisationId, subject, isFromConsultant }: MessageNotificationRequest = await req.json();

    console.log("Message notification request:", { messageId, organisationId, subject, isFromConsultant });

    // Get SMTP credentials
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ error: "SMTP credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email notification settings for the organisation
    const { data: settings, error: settingsError } = await supabase
      .from("email_notification_settings")
      .select("*")
      .eq("organisation_id", organisationId)
      .single();

    if (settingsError || !settings?.enabled) {
      console.log("Email notifications disabled or settings not found");
      return new Response(
        JSON.stringify({ success: false, reason: "Notifications disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get organisation details
    const { data: organisation, error: orgError } = await supabase
      .from("organisations")
      .select("name, user_id")
      .eq("id", organisationId)
      .single();

    if (orgError || !organisation) {
      console.error("Organisation not found:", orgError);
      return new Response(
        JSON.stringify({ error: "Organisation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine recipients
    let recipients: string[] = [];
    
    if (isFromConsultant) {
      const { data: userData } = await supabase.rpc("get_users_with_emails");
      const clientUser = userData?.find((u: { user_id: string }) => u.user_id === organisation.user_id);
      if (clientUser?.email) {
        recipients = [clientUser.email];
      }
    } else {
      recipients = settings.email_recipients || [];
    }

    if (recipients.length === 0) {
      console.log("No recipients configured");
      return new Response(
        JSON.stringify({ success: false, reason: "No recipients" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const senderName = settings.sender_name || "Syrela Trust";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .badge-consultant { background: #0ea5e9; color: white; }
          .badge-client { background: #e2e8f0; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Nouveau message</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez reçu un nouveau message sur la plateforme Syrela Trust.</p>
            
            <p><strong>Organisation :</strong> ${organisation.name}</p>
            <p><strong>Objet :</strong> ${subject}</p>
            <p>
              <strong>De :</strong> 
              <span class="badge ${isFromConsultant ? 'badge-consultant' : 'badge-client'}">
                ${isFromConsultant ? 'Consultant RGPD' : 'Client'}
              </span>
            </p>
            
            <p>Connectez-vous à la plateforme pour lire et répondre au message.</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par Syrela Trust.</p>
            <p>Ne répondez pas directement à cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via SMTP
    console.log("Sending notification email to:", recipients);

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

    await client.send({
      from: `${senderName} <${smtpUser}>`,
      to: recipients,
      subject: `📬 Nouveau message : ${subject}`,
      html: emailHtml,
    });

    await client.close();

    console.log("Notification email sent successfully");

    // Log the email
    await supabase.from("email_logs").insert({
      organisation_id: organisationId,
      recipients: recipients,
      subject: `Nouveau message : ${subject}`,
      alert_type: "message",
      status: "sent",
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-message-notification:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'envoi de la notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
