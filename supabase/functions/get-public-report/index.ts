import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-PUBLIC-REPORT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const url = new URL(req.url);
    const shareSlug = url.searchParams.get("slug");

    if (!shareSlug) {
      return new Response(
        JSON.stringify({ error: "Share slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Looking up report", { slug: shareSlug });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Find the public report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*, audit:audits(*)")
      .eq("share_slug", shareSlug)
      .eq("is_public", true)
      .single();

    if (reportError || !report || !report.audit) {
      logStep("Report not found or not public", { error: reportError?.message });
      return new Response(
        JSON.stringify({ error: "Report not found or not public" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Report found", { auditId: report.audit.id, pageName: report.audit.page_name });

    // Increment view count
    await supabase
      .from("reports")
      .update({ views_count: (report.views_count || 0) + 1 })
      .eq("id", report.id);

    // Get metrics if available
    const { data: metrics } = await supabase
      .from("audit_metrics")
      .select("computed_metrics, ai_insights, demographics")
      .eq("audit_id", report.audit.id)
      .maybeSingle();

    const audit = report.audit;

    // Return public report data (same as Pro view, since it was shared by Pro user)
    const publicResponse = {
      id: audit.id,
      page_name: audit.page_name,
      page_url: audit.page_url,
      audit_type: audit.audit_type,
      created_at: audit.created_at,
      score_total: audit.score_total,
      score_breakdown: audit.score_breakdown,
      recommendations: audit.recommendations || [],
      input_data: audit.input_data,
      detailed_metrics: metrics?.computed_metrics || null,
      ai_insights: metrics?.ai_insights || null,
      demographics: metrics?.demographics || null,
      views_count: (report.views_count || 0) + 1,
      is_shared: true,
    };

    return new Response(
      JSON.stringify(publicResponse),
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
