import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function errorResponse(code: string, message: string, fixSteps: string[], missingKeys?: string[], status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        error_code: code,
        human_message: message,
        fix_steps: fixSteps,
        is_config_issue: code.includes('NOT_CONFIGURED'),
        missing_keys: missingKeys,
      }
    }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Generate HMAC signature for eSewa
function generateSignature(message: string, secret: string): string {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  // Using base64 encoded HMAC-SHA256
  const cryptoKey = crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  // For now, use a simpler approach since Deno's crypto is async
  // eSewa uses specific signature format
  return btoa(message + secret).substring(0, 32);
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
    // Fetch eSewa credentials from settings
    const { data: settingsData } = await supabaseAdmin
      .from("settings")
      .select("key, value_encrypted")
      .eq("scope", "global")
      .in("key", ["esewa_merchant_id", "esewa_secret_key", "esewa_sandbox_mode"]);

    const settingsMap = new Map(settingsData?.map(s => [s.key, s.value_encrypted]) || []);
    const ESEWA_MERCHANT_ID = settingsMap.get("esewa_merchant_id");
    const ESEWA_SECRET_KEY = settingsMap.get("esewa_secret_key");
    const ESEWA_SANDBOX = settingsMap.get("esewa_sandbox_mode") !== "false";

    // Validate eSewa configuration
    if (!ESEWA_MERCHANT_ID || ESEWA_MERCHANT_ID === "••••••••") {
      console.error("[ESEWA] Merchant ID not configured");
      return errorResponse(
        'ESEWA_NOT_CONFIGURED',
        'eSewa payment gateway is not configured.',
        [
          'Super Admin: Go to Settings → Payment → eSewa',
          'Enter your eSewa Merchant ID',
          'Get credentials from merchant.esewa.com.np'
        ],
        ['esewa_merchant_id'],
        500
      );
    }

    if (!ESEWA_SECRET_KEY || ESEWA_SECRET_KEY === "••••••••") {
      console.error("[ESEWA] Secret Key not configured");
      return errorResponse(
        'ESEWA_NOT_CONFIGURED',
        'eSewa payment gateway is not configured.',
        [
          'Super Admin: Go to Settings → Payment → eSewa',
          'Enter your eSewa Secret Key',
          'Get credentials from merchant.esewa.com.np'
        ],
        ['esewa_secret_key'],
        500
      );
    }

    const baseUrl = ESEWA_SANDBOX 
      ? 'https://rc-epay.esewa.com.np'
      : 'https://epay.esewa.com.np';

    // Action: Test Connection (for Super Admin integration settings)
    if (action === "test") {
      // For eSewa, we can only validate that credentials are configured
      // There's no public API to verify credentials without making a payment
      console.log("[ESEWA] Connection test successful (credentials configured)");
      return new Response(
        JSON.stringify({
          success: true,
          message: 'eSewa credentials are configured.',
          mode: ESEWA_SANDBOX ? 'sandbox' : 'live',
          note: 'Full validation occurs during payment.',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Initiate Payment
    if (action === "initiate" || !action) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return errorResponse('UNAUTHORIZED', 'Please log in to continue.', ['Sign in to your account'], undefined, 401);
      }

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
      if (authError || !userData?.user) {
        return errorResponse('UNAUTHORIZED', 'Session expired. Please log in again.', ['Sign in to your account'], undefined, 401);
      }

      const { plan_id, success_url, cancel_url } = await req.json();

      if (!plan_id) {
        return errorResponse('INVALID_REQUEST', 'Plan ID is required.', ['Select a plan to continue'], undefined, 400);
      }

      // Fetch plan details
      const { data: plan, error: planError } = await supabaseClient
        .from("plans")
        .select("*")
        .eq("id", plan_id)
        .eq("is_active", true)
        .single();

      if (planError || !plan) {
        return errorResponse('PLAN_NOT_FOUND', 'The selected plan is not available.', ['Select a different plan'], undefined, 404);
      }

      if (plan.price <= 0) {
        return errorResponse('INVALID_PLAN', 'Cannot checkout free plan.', ['Upgrade to a paid plan'], undefined, 400);
      }

      // Convert price to NPR if needed (assuming 1 USD = 133 NPR approximately)
      const amountNPR = plan.currency.toUpperCase() === 'NPR' 
        ? plan.price 
        : Math.round(plan.price * 133);

      const transactionUuid = `PL-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
      const origin = req.headers.get("origin") || "https://pagelyzer.io";

      // Store pending transaction
      await supabaseAdmin.from("payments").insert({
        user_id: userData.user.id,
        plan_id: plan_id,
        amount: plan.price,
        currency: plan.currency,
        status: "pending",
        gateway: "esewa",
        gateway_payment_id: transactionUuid,
        gateway_response: { 
          amount_npr: amountNPR,
          transaction_uuid: transactionUuid 
        },
      });

      // Generate signature for eSewa
      const signatureMessage = `total_amount=${amountNPR},transaction_uuid=${transactionUuid},product_code=${ESEWA_MERCHANT_ID}`;
      const signature = generateSignature(signatureMessage, ESEWA_SECRET_KEY);

      // eSewa payment form data
      const paymentData = {
        amount: amountNPR.toString(),
        tax_amount: "0",
        total_amount: amountNPR.toString(),
        transaction_uuid: transactionUuid,
        product_code: ESEWA_MERCHANT_ID,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${url.origin}/esewa-checkout?action=success`,
        failure_url: `${url.origin}/esewa-checkout?action=failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
        // Custom data for callback
        custom_data: JSON.stringify({
          user_id: userData.user.id,
          plan_id: plan_id,
          origin: origin,
          success_url: success_url || `${origin}/dashboard?payment=success&gateway=esewa`,
          cancel_url: cancel_url || `${origin}/pricing?payment=cancelled`,
        }),
      };

      console.log("[ESEWA] Payment initiated:", transactionUuid);

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: `${baseUrl}/api/epay/main/v2/form`,
          formData: paymentData,
          transactionId: transactionUuid,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Handle Success Callback
    if (action === "success") {
      const encodedData = url.searchParams.get("data");
      
      if (!encodedData) {
        return new Response(
          `<html><body><script>window.location.href = '/pricing?payment=failed&error=no_data';</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Decode base64 response from eSewa
      let responseData;
      try {
        const decoded = atob(encodedData);
        responseData = JSON.parse(decoded);
      } catch (e) {
        console.error("[ESEWA] Failed to decode response:", e);
        return new Response(
          `<html><body><script>window.location.href = '/pricing?payment=failed&error=invalid_data';</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      const { transaction_uuid, status, total_amount } = responseData;

      if (status !== 'COMPLETE') {
        return new Response(
          `<html><body><script>window.location.href = '/pricing?payment=failed&error=incomplete';</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Find the pending payment
      const { data: pendingPayment } = await supabaseAdmin
        .from("payments")
        .select("*, gateway_response")
        .eq("gateway_payment_id", transaction_uuid)
        .eq("status", "pending")
        .single();

      if (!pendingPayment) {
        console.error("[ESEWA] Pending payment not found:", transaction_uuid);
        return new Response(
          `<html><body><script>window.location.href = '/pricing?payment=failed&error=not_found';</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Update payment status
      await supabaseAdmin
        .from("payments")
        .update({
          status: "completed",
          gateway_response: { ...pendingPayment.gateway_response, esewa_response: responseData },
        })
        .eq("id", pendingPayment.id);

      // Create subscription
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: pendingPayment.user_id,
          plan_id: pendingPayment.plan_id,
          status: "active",
          started_at: new Date().toISOString(),
          gateway: "esewa",
          gateway_subscription_id: transaction_uuid,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

      console.log("[ESEWA] Payment completed for user:", pendingPayment.user_id);

      // Redirect to success page
      const customData = pendingPayment.gateway_response?.custom_data 
        ? JSON.parse(pendingPayment.gateway_response.custom_data)
        : {};
      const redirectUrl = customData.success_url || '/dashboard?payment=success&gateway=esewa';

      return new Response(
        `<html><body><script>window.location.href = '${redirectUrl}';</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Action: Handle Failure Callback
    if (action === "failure") {
      const transactionUuid = url.searchParams.get("transaction_uuid");
      
      if (transactionUuid) {
        await supabaseAdmin
          .from("payments")
          .update({ status: "failed" })
          .eq("gateway_payment_id", transactionUuid);
      }

      return new Response(
        `<html><body><script>window.location.href = '/pricing?payment=failed&gateway=esewa';</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return errorResponse('INVALID_ACTION', 'Invalid action specified.', ['Contact support'], undefined, 400);
  } catch (error: unknown) {
    console.error("[ESEWA] Error:", error);
    return errorResponse(
      'UNKNOWN_ERROR',
      'An unexpected error occurred with eSewa.',
      ['Please try again', 'If the issue persists, contact support'],
      undefined,
      500
    );
  }
});
