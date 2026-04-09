import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if caller is admin/super_admin
    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const callerRoleSet = new Set((callerRoles || []).map((r: { role: string }) => r.role));
    const isCallerAdmin = callerRoleSet.has("super_admin") || callerRoleSet.has("admin");
    const isCallerSuperAdmin = callerRoleSet.has("super_admin");

    const body = await req.json();
    const { action, target_user_id } = body;

    // Determine effective user: admins can act on behalf of another user
    let effectiveUserId = user.id;
    if (target_user_id && target_user_id !== user.id) {
      if (!isCallerAdmin) {
        return new Response(JSON.stringify({ error: "Only admins can manage other users' posts" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      effectiveUserId = target_user_id;
    }

    if (action === "create" || action === "update") {
      const { id, content, fb_connection_id, scheduled_at, status, media_urls, platform } = body;

      if (!content && status !== "draft") {
        return new Response(JSON.stringify({ error: "Content is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (status === "scheduled" && !scheduled_at) {
        return new Response(JSON.stringify({ error: "Scheduled time is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (status === "scheduled" && new Date(scheduled_at) <= new Date()) {
        return new Response(JSON.stringify({ error: "Scheduled time must be in the future" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "create") {
        // Check usage limits for non-pro users (check effective user's subscription)
        const isPro = isCallerSuperAdmin || isCallerAdmin;
        if (!isPro) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("*, plans(*)")
            .eq("user_id", effectiveUserId)
            .eq("status", "active")
            .maybeSingle();

          const hasProSub = !!sub?.plans;
          if (!hasProSub) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count } = await supabase
              .from("scheduled_posts")
              .select("*", { count: "exact", head: true })
              .eq("user_id", effectiveUserId)
              .gte("created_at", startOfMonth.toISOString());

            if ((count || 0) >= 3) {
              return new Response(JSON.stringify({ error: "Free plan limit: 3 scheduled posts per month. Upgrade to Pro for unlimited." }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        }

        const { data, error } = await supabase
          .from("scheduled_posts")
          .insert({
            user_id: effectiveUserId,
            content: content || "",
            fb_connection_id: fb_connection_id || null,
            scheduled_at: scheduled_at || null,
            status: status || "draft",
            media_urls: media_urls || [],
            platform: platform || "facebook",
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ post: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // update
        if (!id) {
          return new Response(JSON.stringify({ error: "Post ID is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData: Record<string, unknown> = {};
        if (content !== undefined) updateData.content = content;
        if (fb_connection_id !== undefined) updateData.fb_connection_id = fb_connection_id;
        if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;
        if (status !== undefined) updateData.status = status;
        if (media_urls !== undefined) updateData.media_urls = media_urls;
        if (platform !== undefined) updateData.platform = platform;

        // Admin can update any user's post; regular user only own
        let query = supabase.from("scheduled_posts").update(updateData).eq("id", id);
        if (!isCallerAdmin) {
          query = query.eq("user_id", user.id);
        }
        const { data, error } = await query.select().single();

        if (error) throw error;

        return new Response(JSON.stringify({ post: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: "Post ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let query = supabase.from("scheduled_posts").delete().eq("id", id);
      if (!isCallerAdmin) {
        query = query.eq("user_id", user.id);
      }
      const { error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*, fb_connections(page_name)")
        .eq("user_id", user.id)
        .order("scheduled_at", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return new Response(JSON.stringify({ posts: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("schedule-post error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
