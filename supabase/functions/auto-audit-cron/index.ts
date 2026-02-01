import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-AUDIT-CRON] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Auto audit cron started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Find due schedules
    const now = new Date().toISOString();
    const { data: dueSchedules, error: schedulesError } = await supabase
      .from("audit_schedules")
      .select("*, fb_connections(*)")
      .eq("is_active", true)
      .lte("next_run_at", now);

    if (schedulesError) {
      logStep("Error fetching schedules", { error: schedulesError.message });
      throw new Error(schedulesError.message);
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      logStep("No due schedules found");
      return new Response(
        JSON.stringify({ success: true, message: "No due schedules", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Found due schedules", { count: dueSchedules.length });

    let processed = 0;
    let failed = 0;

    for (const schedule of dueSchedules) {
      try {
        logStep("Processing schedule", { 
          scheduleId: schedule.id, 
          userId: schedule.user_id,
          connectionId: schedule.connection_id 
        });

        // Call run-audit function
        const auditResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/run-audit`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              connection_id: schedule.connection_id,
              user_id: schedule.user_id,
              is_scheduled: true,
            }),
          }
        );

        const auditResult = await auditResponse.json();

        if (!auditResponse.ok || auditResult.error) {
          logStep("Audit failed", { 
            scheduleId: schedule.id, 
            error: auditResult.error 
          });
          failed++;
          continue;
        }

        // Calculate next run time
        let nextRun: Date;
        if (schedule.frequency === "weekly") {
          nextRun = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        } else if (schedule.frequency === "monthly") {
          nextRun = new Date();
          nextRun.setMonth(nextRun.getMonth() + 1);
        } else {
          nextRun = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default weekly
        }

        // Update schedule
        await supabase
          .from("audit_schedules")
          .update({
            last_run_at: now,
            next_run_at: nextRun.toISOString(),
          })
          .eq("id", schedule.id);

        // Send email notification if user has email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", schedule.user_id)
          .maybeSingle();

        if (profile?.email) {
          // Fetch email settings
          const { data: emailSettings } = await supabase
            .from("settings")
            .select("key, value_encrypted")
            .eq("scope", "global")
            .in("key", ["resend_api_key", "email_from_address", "email_from_name"]);

          const settingsMap: Record<string, string> = {};
          emailSettings?.forEach((s) => {
            settingsMap[s.key] = s.value_encrypted || "";
          });

          if (settingsMap.resend_api_key) {
            try {
              const connection = schedule.fb_connections;
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${settingsMap.resend_api_key}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: `${settingsMap.email_from_name || "Pagelyzer"} <${settingsMap.email_from_address || "noreply@pagelyzer.io"}>`,
                  to: profile.email,
                  subject: `Scheduled Audit Complete: ${connection?.page_name || "Your Page"}`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2>Scheduled Audit Complete</h2>
                      <p>Hi ${profile.full_name || "there"},</p>
                      <p>Your scheduled ${schedule.frequency} audit for <strong>${connection?.page_name || "your page"}</strong> has been completed.</p>
                      <p>Score: <strong>${auditResult.score_total}/100</strong></p>
                      <p><a href="https://pagelyzer.io/dashboard/report/${auditResult.audit_id}">View Full Report</a></p>
                      <hr />
                      <p style="color: #666; font-size: 12px;">Next audit scheduled for ${nextRun.toLocaleDateString()}</p>
                    </div>
                  `,
                }),
              });
              logStep("Email notification sent", { email: profile.email });
            } catch (emailError) {
              logStep("Failed to send email", { error: String(emailError) });
            }
          }
        }

        processed++;
        logStep("Schedule processed successfully", { 
          scheduleId: schedule.id,
          auditId: auditResult.audit_id 
        });

      } catch (scheduleError) {
        logStep("Error processing schedule", { 
          scheduleId: schedule.id, 
          error: String(scheduleError) 
        });
        failed++;
      }
    }

    logStep("Cron job completed", { processed, failed });

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed, 
        failed,
        message: `Processed ${processed} schedules, ${failed} failed`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
