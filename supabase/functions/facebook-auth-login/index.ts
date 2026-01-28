import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to create structured error response
function errorResponse(code: string, message: string, fixSteps: string[], status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        error_code: code,
        human_message: message,
        fix_steps: fixSteps,
        is_config_issue: code.includes('NOT_CONFIGURED'),
      }
    }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Fetch Facebook credentials from settings
    const { data: settingsData } = await supabaseAdmin
      .from("settings")
      .select("key, value_encrypted")
      .eq("scope", "global")
      .in("key", ["facebook_app_id", "facebook_app_secret"]);

    const settingsMap = new Map(settingsData?.map(s => [s.key, s.value_encrypted]) || []);
    const FB_APP_ID = settingsMap.get("facebook_app_id");
    const FB_APP_SECRET = settingsMap.get("facebook_app_secret");

    // Validate Facebook configuration
    if (!FB_APP_ID || FB_APP_ID === "••••••••" || !FB_APP_SECRET || FB_APP_SECRET === "••••••••") {
      console.error("[FB-AUTH-LOGIN] Facebook credentials not configured");
      return errorResponse(
        'FACEBOOK_NOT_CONFIGURED',
        'Facebook login is not configured yet.',
        [
          'Super Admin needs to configure Facebook integration',
          'Go to Settings → Integrations → Facebook API',
          'Enter Facebook App ID and App Secret',
          'Get credentials from developers.facebook.com'
        ],
        500
      );
    }

    // Action: Get login URL
    if (action === "get-login-url") {
      const redirectUri = `${url.origin}/facebook-auth-login?action=callback`;
      const scopes = [
        "email",
        "public_profile",
      ].join(",");

      const state = crypto.randomUUID(); // CSRF protection

      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${FB_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scopes}&` +
        `state=${state}&` +
        `response_type=code`;

      return new Response(
        JSON.stringify({ authUrl, state }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: OAuth Callback - exchange code for user info
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        const errorMsg = url.searchParams.get("error_description") || error;
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-login-error', error: '${errorMsg}' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      if (!code) {
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-login-error', error: 'No authorization code received' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Exchange code for access token
      const redirectUri = `${url.origin}/facebook-auth-login?action=callback`;
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `client_id=${FB_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${FB_APP_SECRET}&` +
        `code=${code}`;

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error("[FB-AUTH-LOGIN] Token exchange failed:", tokenData.error);
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-login-error', error: '${tokenData.error.message}' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      const accessToken = tokenData.access_token;

      // Get user info from Facebook
      const userInfoUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${accessToken}`;
      const userInfoResponse = await fetch(userInfoUrl);
      const userData = await userInfoResponse.json();

      if (userData.error) {
        console.error("[FB-AUTH-LOGIN] Failed to get user info:", userData.error);
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-login-error', error: '${userData.error.message}' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      const fbUserId = userData.id;
      const fbName = userData.name;
      const fbEmail = userData.email;
      const fbPicture = userData.picture?.data?.url;

      if (!fbEmail) {
        return new Response(
          `<script>window.opener.postMessage({ type: 'fb-login-error', error: 'Email permission is required. Please try again and allow email access.' }, '*'); window.close();</script>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      console.log(`[FB-AUTH-LOGIN] User authenticated: ${fbEmail}, name: ${fbName}`);

      // Send data back to opener window for client-side auth handling
      return new Response(
        `<script>
          window.opener.postMessage({
            type: 'fb-login-success',
            userData: {
              facebookId: '${fbUserId}',
              email: '${fbEmail}',
              name: '${fbName || ''}',
              picture: '${fbPicture || ''}'
            }
          }, '*');
          window.close();
        </script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Action: Complete login (called from frontend after popup callback)
    if (action === "complete-login") {
      const body = await req.json();
      const { email, name, picture, facebookId } = body;

      if (!email) {
        return errorResponse(
          'MISSING_EMAIL',
          'Email is required for Facebook login.',
          ['Please ensure you allow email access when connecting with Facebook'],
          400
        );
      }

      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === email);

      if (existingUser) {
        // User exists - generate magic link token for login
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (signInError) {
          console.error("[FB-AUTH-LOGIN] Sign in error:", signInError);
          return errorResponse(
            'AUTH_FAILED',
            'Failed to sign in with Facebook.',
            ['Please try again or use email/password login'],
            500
          );
        }

        // Update profile with Facebook picture if available
        if (picture && existingUser.id) {
          await supabaseAdmin
            .from("profiles")
            .update({ 
              avatar_url: picture,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", existingUser.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            isNewUser: false,
            userId: existingUser.id,
            properties: signInData.properties,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // New user - create account
        const tempPassword = crypto.randomUUID(); // Temporary password
        
        const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email for Facebook users
          user_metadata: {
            full_name: name,
            avatar_url: picture,
            facebook_id: facebookId,
            provider: 'facebook',
          }
        });

        if (signUpError) {
          console.error("[FB-AUTH-LOGIN] Sign up error:", signUpError);
          return errorResponse(
            'SIGNUP_FAILED',
            'Failed to create account with Facebook.',
            ['This email might already be registered', 'Try logging in with email/password instead'],
            500
          );
        }

        // Update profile with avatar
        if (newUser?.user?.id && picture) {
          await supabaseAdmin
            .from("profiles")
            .update({ 
              avatar_url: picture,
              full_name: name,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", newUser.user.id);
        }

        // Generate sign in link
        const { data: signInData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (linkError) {
          console.error("[FB-AUTH-LOGIN] Generate link error:", linkError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            isNewUser: true,
            userId: newUser?.user?.id,
            properties: signInData?.properties,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return errorResponse(
      'INVALID_ACTION',
      'Invalid action specified.',
      ['This is an internal error. Please try again.'],
      400
    );
  } catch (error: unknown) {
    console.error("[FB-AUTH-LOGIN] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(
      'UNKNOWN_ERROR',
      'An unexpected error occurred during Facebook login.',
      ['Please try again', 'If the issue persists, contact support'],
      500
    );
  }
});
