import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditCompletionEmailRequest {
  organisationId: string;
  organisationName: string;
  clientEmails: string[];
  clientNames: string[];
  complianceScore: number;
  answeredQuestions: number;
  totalQuestions: number;
  risksHigh: number;
  conformeCount: number;
  partielCount: number;
  nonConformeCount: number;
  completedAt: string;
  portalUrl: string;
}

function generateAuditEmailHTML(data: AuditCompletionEmailRequest, clientName: string): string {
  const scoreColor = data.complianceScore >= 75 ? '#22c55e' : data.complianceScore >= 50 ? '#eab308' : '#ef4444';
  const scoreLabel = data.complianceScore >= 75 ? 'Satisfaisant' : data.complianceScore >= 50 ? 'À améliorer' : 'Critique';
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'audit RGPD</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">📊 Rapport d'Audit RGPD</h1>
              <p style="color: #a0c4e8; margin: 10px 0 0 0; font-size: 16px;">${data.organisationName}</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
                Bonjour <strong>${clientName}</strong>,
              </p>
              <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 15px 0 0 0;">
                L'audit de conformité RGPD de votre organisation a été finalisé le <strong>${new Date(data.completedAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Score Card -->
          <tr>
            <td style="padding: 0 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <div style="font-size: 48px; font-weight: bold; color: ${scoreColor};">${data.complianceScore}%</div>
                    <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: ${scoreColor};">${scoreLabel}</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Score de conformité</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Statistics -->
          <tr>
            <td style="padding: 20px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 33%; text-align: center; padding: 15px;">
                    <div style="background-color: #dcfce7; border-radius: 8px; padding: 15px;">
                      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22c55e;">${data.conformeCount}</p>
                      <p style="margin: 5px 0 0 0; font-size: 12px; color: #166534;">Conformes</p>
                    </div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 15px;">
                    <div style="background-color: #fef9c3; border-radius: 8px; padding: 15px;">
                      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #eab308;">${data.partielCount}</p>
                      <p style="margin: 5px 0 0 0; font-size: 12px; color: #854d0e;">Partiels</p>
                    </div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 15px;">
                    <div style="background-color: #fee2e2; border-radius: 8px; padding: 15px;">
                      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ef4444;">${data.nonConformeCount}</p>
                      <p style="margin: 5px 0 0 0; font-size: 12px; color: #991b1b;">Non conformes</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Additional Info -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Questions traitées</td>
                        <td style="text-align: right; font-weight: 600; color: #334155;">${data.answeredQuestions}/${data.totalQuestions}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${data.risksHigh > 0 ? `
                <tr>
                  <td style="padding: 15px 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #ef4444; font-size: 14px;">⚠️ Risques élevés identifiés</td>
                        <td style="text-align: right; font-weight: 600; color: #ef4444;">${data.risksHigh}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 30px 30px 30px; text-align: center;">
              <a href="${data.portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Consulter le rapport complet
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">
                Cet email a été envoyé automatiquement par <strong>Syrela Trust</strong>.<br>
                Pour toute question, contactez votre consultant RGPD.
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
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== send-audit-completion-email function called ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client to verify user role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid user token:", userError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User authenticated:", user.id);

    // Parse request data first to get organisationId
    const data: AuditCompletionEmailRequest = await req.json();
    
    // Check if user is admin, super_admin, OR the owner of the organisation
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = roleData && ["admin", "super_admin"].includes(roleData.role);
    
    // Check if user is the organisation owner
    const { data: orgData } = await supabase
      .from("organisations")
      .select("id")
      .eq("id", data.organisationId)
      .eq("user_id", user.id)
      .single();
    
    const isOrgOwner = !!orgData;

    if (!isAdmin && !isOrgOwner) {
      console.error("User is not authorized - not admin and not org owner");
      return new Response(JSON.stringify({ error: "Access denied: you must be the organisation owner or an admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User authorized:", isAdmin ? `admin (${roleData?.role})` : "organisation owner");
    console.log("Request data:", {
      organisationId: data.organisationId,
      organisationName: data.organisationName,
      clientEmails: data.clientEmails,
      complianceScore: data.complianceScore,
    });

    if (!data.clientEmails || data.clientEmails.length === 0) {
      return new Response(JSON.stringify({ error: "No client emails provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const results: { email: string; success: boolean; error?: string }[] = [];

    // Send email to each client
    for (let i = 0; i < data.clientEmails.length; i++) {
      const email = data.clientEmails[i];
      const name = data.clientNames[i] || "Client";
      
      console.log(`Sending email to: ${email} (${name})`);
      
      try {
        const htmlContent = generateAuditEmailHTML(data, name);
        
        const emailResponse = await resend.emails.send({
          from: "Syrela Trust <contact@syrelatrust.fr>",
          to: [email],
          subject: `📊 Rapport d'audit RGPD - ${data.organisationName}`,
          html: htmlContent,
        });
        
        console.log(`Email sent successfully to ${email}:`, emailResponse);
        results.push({ email, success: true });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${email}:`, emailError);
        results.push({ email, success: false, error: emailError.message });
      }
    }

    const allSuccess = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    console.log(`Email sending complete: ${successCount}/${results.length} successful`);

    // Log each email in the database
    for (const result of results) {
      try {
        const { error: logError } = await supabase
          .from("email_logs")
          .insert({
            organisation_id: data.organisationId,
            alert_type: "audit_report",
            subject: `📊 Rapport d'audit RGPD - ${data.organisationName}`,
            recipients: [result.email],
            status: result.success ? "sent" : "failed",
            error_message: result.error || null,
          });

        if (logError) {
          console.error(`Failed to log email for ${result.email}:`, logError);
        }
      } catch (logErr) {
        console.error(`Error logging email for ${result.email}:`, logErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: allSuccess,
        message: `${successCount}/${results.length} email(s) envoyé(s) avec succès`,
        results 
      }),
      {
        status: allSuccess ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-audit-completion-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
