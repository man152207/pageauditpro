import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Facebook OAuth configuration
const FB_APP_ID = Deno.env.get("FACEBOOK_APP_ID") || "";
const FB_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // Action: Get OAuth URL
    if (action === "get-auth-url") {
      if (!FB_APP_ID) {
        return new Response(
          JSON.stringify({ error: "Facebook App not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const redirectUri = `${url.origin}/facebook-oauth?action=callback`;
      const scopes = [
        "pages_show_list",
        "pages_read_engagement",
        "pages_read_user_content",
        "read_insights",
      ].join(",");

      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${FB_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scopes}&` +
        `response_type=code`;

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: OAuth Callback
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-oauth-error', error: '${error}' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      if (!code) {
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-oauth-error', error: 'No code received' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Exchange code for access token
      const redirectUri = `${url.origin}/facebook-oauth?action=callback`;
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `client_id=${FB_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${FB_APP_SECRET}&` +
        `code=${code}`;

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-oauth-error', error: '${tokenData.error.message}' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Get long-lived token
      const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${FB_APP_ID}&` +
        `client_secret=${FB_APP_SECRET}&` +
        `fb_exchange_token=${tokenData.access_token}`;

      const longLivedResponse = await fetch(longLivedUrl);
      const longLivedData = await longLivedResponse.json();

      const accessToken = longLivedData.access_token || tokenData.access_token;
      const expiresIn = longLivedData.expires_in || 60 * 60; // Default 1 hour

      // Get user's pages
      const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;
      const pagesResponse = await fetch(pagesUrl);
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-oauth-error', error: '${pagesData.error.message}' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      const pages = pagesData.data?.map((page: any) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
      })) || [];

      // Send data back to opener window
      return new Response(
        `<script>
          window.opener.postMessage({
            type: 'fb-oauth-success',
            pages: ${JSON.stringify(pages)},
            userToken: '${accessToken}',
            expiresIn: ${expiresIn}
          }, '*');
          window.close();
        </script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Action: Save page connection
    if (action === "save-connection") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
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
      const { page_id, page_name, access_token, expires_in } = await req.json();

      if (!page_id || !page_name || !access_token) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Upsert connection
      const { data, error } = await supabase
        .from("fb_connections")
        .upsert({
          user_id: userId,
          page_id,
          page_name,
          access_token_encrypted: access_token, // In production, encrypt this!
          scopes: ["pages_show_list", "pages_read_engagement", "pages_read_user_content", "read_insights"],
          is_active: true,
          connected_at: new Date().toISOString(),
          token_expires_at: expires_in 
            ? new Date(Date.now() + expires_in * 1000).toISOString() 
            : null,
        }, {
          onConflict: "user_id,page_id",
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving connection:", error);
        return new Response(
          JSON.stringify({ error: "Failed to save connection" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, connection: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Get page insights
    if (action === "get-insights") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
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
      const connectionId = url.searchParams.get("connection_id");

      // Get connection
      const { data: connection, error: connError } = await supabase
        .from("fb_connections")
        .select("*")
        .eq("id", connectionId)
        .eq("user_id", userId)
        .single();

      if (connError || !connection) {
        return new Response(
          JSON.stringify({ error: "Connection not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const pageToken = connection.access_token_encrypted;
      const pageId = connection.page_id;

      // Fetch page info
      const pageInfoUrl = `https://graph.facebook.com/v19.0/${pageId}?` +
        `fields=name,followers_count,fan_count,about,category&` +
        `access_token=${pageToken}`;
      
      const pageInfoRes = await fetch(pageInfoUrl);
      const pageInfo = await pageInfoRes.json();

      // Fetch page insights
      const insightsUrl = `https://graph.facebook.com/v19.0/${pageId}/insights?` +
        `metric=page_impressions,page_engaged_users,page_post_engagements,page_fans&` +
        `period=day&date_preset=last_30d&` +
        `access_token=${pageToken}`;
      
      const insightsRes = await fetch(insightsUrl);
      const insightsData = await insightsRes.json();

      // Fetch recent posts
      const postsUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?` +
        `fields=id,message,created_time,shares,likes.summary(true),comments.summary(true)&` +
        `limit=10&` +
        `access_token=${pageToken}`;
      
      const postsRes = await fetch(postsUrl);
      const postsData = await postsRes.json();

      return new Response(
        JSON.stringify({
          pageInfo: pageInfo.error ? null : pageInfo,
          insights: insightsData.error ? [] : insightsData.data,
          posts: postsData.error ? [] : postsData.data,
          dataAvailability: {
            pageInfo: !pageInfo.error,
            insights: !insightsData.error,
            posts: !postsData.error,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Facebook OAuth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
