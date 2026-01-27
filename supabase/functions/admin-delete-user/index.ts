import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requesterId = claims.claims.sub;
    const { data: isSuperAdmin, error: roleError } = await userClient.rpc("is_super_admin", {
      _user_id: requesterId,
    });

    if (roleError || !isSuperAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => null)) as { user_id?: string } | null;
    const targetUserId = body?.user_id;
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Collect audit IDs for cascading deletes
    const { data: audits, error: auditsError } = await admin
      .from("audits")
      .select("id")
      .eq("user_id", targetUserId);
    if (auditsError) throw auditsError;
    const auditIds = (audits ?? []).map((a) => a.id);

    if (auditIds.length > 0) {
      const { error: metricsError } = await admin.from("audit_metrics").delete().in("audit_id", auditIds);
      if (metricsError) throw metricsError;

      const { error: reportsError } = await admin.from("reports").delete().in("audit_id", auditIds);
      if (reportsError) throw reportsError;
    }

    // Delete user-owned rows
    const deletions = [
      admin.from("audits").delete().eq("user_id", targetUserId),
      admin.from("fb_connections").delete().eq("user_id", targetUserId),
      admin.from("subscriptions").delete().eq("user_id", targetUserId),
      admin.from("payments").delete().eq("user_id", targetUserId),
      admin.from("security_events").delete().eq("user_id", targetUserId),
      admin.from("audit_logs").delete().eq("actor_id", targetUserId),
      admin.from("user_roles").delete().eq("user_id", targetUserId),
      admin.from("profiles").delete().eq("user_id", targetUserId),
    ];

    for (const q of deletions) {
      const { error } = await q;
      if (error) throw error;
    }

    // Finally delete auth user
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(targetUserId);
    if (authDeleteError) throw authDeleteError;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("admin-delete-user error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
