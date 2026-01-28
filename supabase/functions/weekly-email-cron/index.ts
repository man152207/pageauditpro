import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserWithConnection {
  user_id: string;
  email: string;
  full_name: string | null;
  page_name: string;
  page_id: string;
  connection_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("[WEEKLY-EMAIL-CRON] Starting weekly email job...");

    // Get email configuration
    const { data: emailSettings } = await supabaseAdmin
      .from("settings")
      .select("key, value_encrypted")
      .eq("scope", "global")
      .in("key", ["resend_api_key", "email_from_address", "email_from_name"]);

    const settingsMap: Record<string, string> = {};
    emailSettings?.forEach((s) => {
      settingsMap[s.key] = s.value_encrypted || "";
    });

    if (!settingsMap.resend_api_key) {
      console.log("[WEEKLY-EMAIL-CRON] Resend API key not configured, skipping");
      return new Response(
        JSON.stringify({ message: "Email not configured", skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get users with active Facebook connections who have email preferences enabled
    const { data: connections, error: connError } = await supabaseAdmin
      .from("fb_connections")
      .select(`
        id,
        user_id,
        page_name,
        page_id,
        profiles!inner(email, full_name)
      `)
      .eq("is_active", true);

    if (connError) {
      console.error("[WEEKLY-EMAIL-CRON] Error fetching connections:", connError);
      throw connError;
    }

    if (!connections || connections.length === 0) {
      console.log("[WEEKLY-EMAIL-CRON] No active connections found");
      return new Response(
        JSON.stringify({ message: "No active connections", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WEEKLY-EMAIL-CRON] Found ${connections.length} active connections`);

    // Check email preferences for each user
    const { data: preferences } = await supabaseAdmin
      .from("settings")
      .select("scope_id, key, value_encrypted")
      .eq("scope", "user")
      .eq("key", "email_weekly_summary");

    const userPrefs: Record<string, boolean> = {};
    preferences?.forEach((p) => {
      if (p.scope_id) {
        userPrefs[p.scope_id] = p.value_encrypted !== "false";
      }
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (const conn of connections) {
      const profile = conn.profiles as any;
      if (!profile?.email) continue;

      // Check if user has opted out
      const prefEnabled = userPrefs[conn.user_id] !== false; // Default to true
      if (!prefEnabled) {
        console.log(`[WEEKLY-EMAIL-CRON] User ${conn.user_id} opted out, skipping`);
        continue;
      }

      // Get recent audits for this connection
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: audits } = await supabaseAdmin
        .from("audits")
        .select("id, score_total, created_at, page_name")
        .eq("fb_connection_id", conn.id)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);

      // Generate summary
      const auditCount = audits?.length || 0;
      const avgScore = audits?.length
        ? Math.round(audits.reduce((sum, a) => sum + (a.score_total || 0), 0) / audits.length)
        : null;

      // Send email via send-audit-email function
      try {
        const { error: sendError } = await supabaseAdmin.functions.invoke("send-audit-email", {
          body: {
            to: profile.email,
            template: "weekly_summary",
            data: {
              userName: profile.full_name || "there",
              pageName: conn.page_name,
              auditCount,
              avgScore,
              audits: audits || [],
              unsubscribeUrl: `${supabaseUrl.replace(".supabase.co", ".supabase.co")}/functions/v1/send-audit-email?action=unsubscribe&user_id=${conn.user_id}`,
            },
          },
        });

        if (sendError) {
          console.error(`[WEEKLY-EMAIL-CRON] Failed to send to ${profile.email}:`, sendError);
          errors.push(`${profile.email}: ${sendError.message}`);
        } else {
          sentCount++;
          console.log(`[WEEKLY-EMAIL-CRON] Sent weekly summary to ${profile.email}`);
        }
      } catch (e) {
        console.error(`[WEEKLY-EMAIL-CRON] Error sending to ${profile.email}:`, e);
        errors.push(`${profile.email}: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    }

    console.log(`[WEEKLY-EMAIL-CRON] Completed. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: "Weekly email job completed",
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WEEKLY-EMAIL-CRON] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
