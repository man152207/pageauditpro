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
  const queryAction = url.searchParams.get("action");

  // Parse body early for POST requests to get action from body
  let bodyData: {
    action?: string;
    code?: string;
    email?: string;
    name?: string;
    picture?: string;
    facebookId?: string;
    redirect_uri?: string;
    redirectUri?: string;
  } = {};
  if (req.method === "POST") {
    try {
      bodyData = await req.json();
    } catch {
      // Body parsing failed, continue with empty object
    }
  }

  // Get action from body or query params
  const action = bodyData.action || queryAction;

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

    // Action: Test Connection (for Super Admin integration settings)
    if (action === "test") {
      if (!FB_APP_ID || FB_APP_ID === "••••••••" || !FB_APP_SECRET || FB_APP_SECRET === "••••••••") {
        console.log("[FB-AUTH-LOGIN] Test failed: credentials not configured");
        return errorResponse(
          'FACEBOOK_NOT_CONFIGURED',
          'Facebook credentials are not configured.',
          ['Go to Settings → Integrations → Facebook API', 'Enter Facebook App ID and App Secret'],
          400
        );
      }
      
      console.log("[FB-AUTH-LOGIN] Connection test successful (credentials configured)");
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Facebook credentials are configured.',
          note: 'Full OAuth validation occurs during login flow.',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate Facebook configuration for other actions
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

  // ALWAYS use production domain for OAuth redirects per project requirements
  const PRODUCTION_ORIGIN = "https://pagelyzer.io";
  const defaultRedirectUri = `${PRODUCTION_ORIGIN}/api/auth/facebook/login/callback`;

    // Action: Get login URL
    if (action === "get-login-url") {
      // Facebook Login scope - email requires Standard Access, public_profile is default
      // IMPORTANT: These permissions must be approved in Facebook Developer Console
      // App Review > Permissions and Features > email must have at least "Standard Access"
      const scopes = ["email"].join(",");
      
      // URL encode the scope parameter properly
      const encodedScopes = encodeURIComponent(scopes);

      const state = crypto.randomUUID(); // CSRF protection

      const redirectUri =
        bodyData.redirect_uri ||
        // @ts-ignore - tolerate legacy key
        (bodyData as any).redirectUri ||
        url.searchParams.get("redirect_uri") ||
        defaultRedirectUri;

      // Build OAuth URL with properly encoded parameters
      const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
      authUrl.searchParams.set("client_id", FB_APP_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", scopes);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("response_type", "code");
      
      const authUrlString = authUrl.toString();

      console.log(`[FB-AUTH-LOGIN] Generated auth URL: ${authUrlString}`);
      console.log(`[FB-AUTH-LOGIN] Redirect URI: ${redirectUri}`);
      console.log(`[FB-AUTH-LOGIN] Scopes: ${scopes}`);

      return new Response(
        JSON.stringify({ 
          authUrl: authUrlString, 
          state, 
          redirectUri,
          debug: {
            client_id: FB_APP_ID,
            redirect_uri: redirectUri,
            scope: scopes,
            response_type: "code"
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Exchange code for user data (called from frontend callback component)
    if (action === "exchange-code") {
      const code = bodyData.code || url.searchParams.get("code");
      const redirectUri =
        // @ts-ignore - tolerate legacy key
        (bodyData as any).redirect_uri ||
        // @ts-ignore
        (bodyData as any).redirectUri ||
        url.searchParams.get("redirect_uri") ||
        defaultRedirectUri;

      if (!code) {
        return errorResponse(
          'MISSING_CODE',
          'Authorization code is required.',
          ['This is an internal error. Please try again.'],
          400
        );
      }

      // Exchange code for access token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `client_id=${FB_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${FB_APP_SECRET}&` +
        `code=${code}`;

      console.log(`[FB-AUTH-LOGIN] Exchanging code for token with redirect: ${redirectUri}`);

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error("[FB-AUTH-LOGIN] Token exchange failed:", tokenData.error);
        return errorResponse(
          'TOKEN_EXCHANGE_FAILED',
          tokenData.error.message || 'Failed to exchange authorization code.',
          ['Please try again', 'If the issue persists, contact support'],
          400
        );
      }

      const accessToken = tokenData.access_token;

      // Get user info from Facebook
      const userInfoUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${accessToken}`;
      const userInfoResponse = await fetch(userInfoUrl);
      const userData = await userInfoResponse.json();

      if (userData.error) {
        console.error("[FB-AUTH-LOGIN] Failed to get user info:", userData.error);
        return errorResponse(
          'USER_INFO_FAILED',
          userData.error.message || 'Failed to get user information from Facebook.',
          ['Please try again'],
          400
        );
      }

      const fbUserId = userData.id;
      const fbName = userData.name;
      const fbEmail = userData.email;
      const fbPicture = userData.picture?.data?.url;

      if (!fbEmail) {
        return errorResponse(
          'EMAIL_REQUIRED',
          'Email permission is required.',
          ['Please try again and allow email access when prompted by Facebook'],
          400
        );
      }

      console.log(`[FB-AUTH-LOGIN] User authenticated: ${fbEmail}, name: ${fbName}`);

      // Return user data to frontend (frontend will call complete-login)
      return new Response(
        JSON.stringify({
          success: true,
          userData: {
            facebookId: fbUserId,
            email: fbEmail,
            name: fbName || '',
            picture: fbPicture || ''
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Legacy callback action (kept for backwards compatibility, but frontend now handles this)
    if (action === "callback") {
      // Redirect to frontend callback handler which will call exchange-code
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      const errorDescription = url.searchParams.get("error_description");
      
      // Build redirect URL to frontend callback
      let frontendCallback = defaultRedirectUri;
      if (code) {
        frontendCallback += `?code=${encodeURIComponent(code)}`;
      } else if (error) {
        frontendCallback += `?error=${encodeURIComponent(error)}`;
        if (errorDescription) {
          frontendCallback += `&error_description=${encodeURIComponent(errorDescription)}`;
        }
      }
      
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": frontendCallback,
        }
      });
    }

    // Action: Complete login (called from frontend after popup callback)
    if (action === "complete-login") {
      const { email, name, picture, facebookId } = bodyData;

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
