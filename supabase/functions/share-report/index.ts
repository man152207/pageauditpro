import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SHARE-REPORT] ${step}${detailsStr}`);
};

// Generate a random slug
function generateSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);

    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;
    logStep("User authenticated", { userId });

    const { audit_id, action } = await req.json();

    if (!audit_id || !action) {
      return new Response(
        JSON.stringify({ error: "audit_id and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this audit
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("id, user_id, is_pro_unlocked")
      .eq("id", audit_id)
      .eq("user_id", userId)
      .single();

    if (auditError || !audit) {
      logStep("Audit not found", { audit_id, error: auditError?.message });
      return new Response(
        JSON.stringify({ error: "Audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check Pro access for sharing
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    const isPro = !!subscription && subscription.plan?.billing_type !== "free";

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthStr = startOfMonth.toISOString().split('T')[0];

    const { data: freeGrant } = await supabase
      .from("free_audit_grants")
      .select("id")
      .eq("user_id", userId)
      .eq("grant_month", monthStr)
      .maybeSingle();

    const hasProAccess = isPro || !!freeGrant || audit.is_pro_unlocked;

    if (!hasProAccess) {
      return new Response(
        JSON.stringify({ error: "Pro subscription required for sharing reports" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create report record
    let { data: report } = await supabase
      .from("reports")
      .select("*")
      .eq("audit_id", audit_id)
      .single();

    if (!report) {
      const { data: newReport, error: insertError } = await supabase
        .from("reports")
        .insert({ audit_id })
        .select()
        .single();

      if (insertError) {
        logStep("Failed to create report", { error: insertError.message });
        throw new Error("Failed to create report");
      }
      report = newReport;
    }

    if (action === "create") {
      // Generate unique slug
      let slug = generateSlug();
      let attempts = 0;

      // Ensure slug is unique
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from("reports")
          .select("id")
          .eq("share_slug", slug)
          .maybeSingle();

        if (!existing) break;
        slug = generateSlug();
        attempts++;
      }

      // Update report with share info
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          is_public: true,
          share_slug: slug,
        })
        .eq("id", report.id);

      if (updateError) {
        logStep("Failed to update report", { error: updateError.message });
        throw new Error("Failed to create share link");
      }

      // Construct share URL - use production domain
      const shareUrl = `https://pagelyzer.io/r/${slug}`;

      logStep("Share link created", { slug, shareUrl });

      return new Response(
        JSON.stringify({
          success: true,
          share_url: shareUrl,
          share_slug: slug,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "revoke") {
      // Revoke sharing
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          is_public: false,
          share_slug: null,
        })
        .eq("id", report.id);

      if (updateError) {
        logStep("Failed to revoke share", { error: updateError.message });
        throw new Error("Failed to revoke share link");
      }

      logStep("Share link revoked");

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'create' or 'revoke'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
