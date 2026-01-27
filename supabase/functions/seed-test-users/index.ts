import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SeededUser = {
  email: string;
  user_id: string;
  role: "super_admin" | "admin" | "user";
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

    const body = (await req.json().catch(() => ({}))) as { password?: string };
    const password = body.password?.trim() || "Test@123456";

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const ensureUser = async (params: {
      email: string;
      full_name: string;
      role: SeededUser["role"];
    }): Promise<SeededUser> => {
      const emailLower = params.email.toLowerCase();

      // 1) Create user (or find if already exists)
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: params.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: params.full_name },
      });

      let userId = created?.user?.id ?? null;

      if (!userId) {
        const msg = (createError as { message?: string } | null)?.message?.toLowerCase() ?? "";
        const isAlready = msg.includes("already") || msg.includes("exists") || msg.includes("registered");
        if (!isAlready) {
          throw createError ?? new Error("Failed to create user");
        }

        const { data: usersList, error: listError } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (listError) throw listError;

        const existing = usersList.users.find((u) => (u.email ?? "").toLowerCase() === emailLower);
        if (!existing?.id) {
          throw new Error(`User exists but could not be resolved: ${params.email}`);
        }
        userId = existing.id;

        // Keep password consistent for testing
        await admin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: { full_name: params.full_name },
        });
      }

      // 2) Ensure profile + role exist (no trigger in this project)
      const { error: profileError } = await admin.from("profiles").upsert(
        {
          user_id: userId,
          full_name: params.full_name,
          email: params.email,
          is_active: true,
        },
        { onConflict: "user_id" },
      );
      if (profileError) throw profileError;

      const { error: deleteRolesError } = await admin.from("user_roles").delete().eq("user_id", userId);
      if (deleteRolesError) throw deleteRolesError;

      const { error: insertRoleError } = await admin.from("user_roles").insert({
        user_id: userId,
        role: params.role,
      });
      if (insertRoleError) throw insertRoleError;

      return { email: params.email, user_id: userId, role: params.role };
    };

    const seeded: SeededUser[] = [];
    seeded.push(
      await ensureUser({
        email: "superadmin@test.com",
        full_name: "Pagelyzer Super Admin",
        role: "super_admin",
      }),
    );
    seeded.push(
      await ensureUser({
        email: "admin@test.com",
        full_name: "Pagelyzer Admin",
        role: "admin",
      }),
    );
    seeded.push(
      await ensureUser({
        email: "user@test.com",
        full_name: "Pagelyzer User",
        role: "user",
      }),
    );

    return new Response(JSON.stringify({ users: seeded, password }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("seed-test-users error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
