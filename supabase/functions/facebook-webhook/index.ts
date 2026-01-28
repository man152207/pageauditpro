import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Extract product from path (e.g., /facebook-webhook/user, /facebook-webhook/page)
  const pathParts = url.pathname.split('/').filter(Boolean);
  const product = pathParts[pathParts.length - 1] || 'unknown';

  console.log(`[Facebook Webhook] Method: ${req.method}, Product: ${product}`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET request = Facebook verification challenge
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log(`[Facebook Webhook] Verification request - mode: ${mode}, token: ${token ? '***' : 'missing'}`);

      if (mode !== 'subscribe') {
        console.error('[Facebook Webhook] Invalid mode:', mode);
        return new Response('Invalid mode', { status: 400, headers: corsHeaders });
      }

      if (!token || !challenge) {
        console.error('[Facebook Webhook] Missing token or challenge');
        return new Response('Missing parameters', { status: 400, headers: corsHeaders });
      }

      // Get verify token from settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('value_encrypted')
        .eq('key', 'facebook_webhook_verify_token')
        .eq('scope', 'global')
        .maybeSingle();

      if (settingsError) {
        console.error('[Facebook Webhook] Error fetching verify token:', settingsError);
        return new Response('Server error', { status: 500, headers: corsHeaders });
      }

      const storedToken = settingsData?.value_encrypted;

      if (!storedToken) {
        console.error('[Facebook Webhook] No verify token configured in settings');
        return new Response('Webhook not configured', { status: 403, headers: corsHeaders });
      }

      if (token !== storedToken) {
        console.error('[Facebook Webhook] Token mismatch');
        return new Response('Invalid token', { status: 403, headers: corsHeaders });
      }

      console.log('[Facebook Webhook] Verification successful, returning challenge');
      return new Response(challenge, { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      });
    }

    // POST request = Incoming webhook event
    if (req.method === 'POST') {
      const body = await req.json();
      
      console.log(`[Facebook Webhook] Received event for product: ${product}`);
      console.log('[Facebook Webhook] Event body:', JSON.stringify(body, null, 2));

      // Log the webhook event for debugging/auditing
      const eventType = body.object || 'unknown';
      const entries = body.entry || [];

      for (const entry of entries) {
        console.log(`[Facebook Webhook] Processing entry:`, {
          id: entry.id,
          time: entry.time,
          changes: entry.changes?.length || 0,
          messaging: entry.messaging?.length || 0,
        });

        // Handle specific event types
        if (entry.changes) {
          for (const change of entry.changes) {
            console.log(`[Facebook Webhook] Change field: ${change.field}`, change.value);
            
            // Handle deauthorization
            if (change.field === 'permissions' && change.value?.verb === 'revoked') {
              console.log('[Facebook Webhook] User revoked permissions:', change.value);
              // TODO: Handle permission revocation (e.g., deactivate fb_connection)
            }
          }
        }

        // Handle messaging events
        if (entry.messaging) {
          for (const message of entry.messaging) {
            console.log(`[Facebook Webhook] Messaging event:`, message);
          }
        }
      }

      // Always return 200 OK to acknowledge receipt
      return new Response(JSON.stringify({ success: true, received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    
  } catch (error) {
    console.error('[Facebook Webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
