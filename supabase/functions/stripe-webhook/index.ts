import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY not configured");
    return new Response("Webhook Error: Missing configuration", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(body) as Stripe.Event;
      console.log("Warning: Webhook signature verification skipped");
    }
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook Error: ${errMessage}`, { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log("Processing webhook event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planId = session.metadata?.plan_id;

        if (!userId || !planId) {
          console.error("Missing metadata in session:", session.id);
          break;
        }

        // Record payment
        const { error: paymentError } = await supabaseAdmin
          .from("payments")
          .insert({
            user_id: userId,
            plan_id: planId,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || "USD",
            status: "completed",
            gateway: "stripe",
            gateway_payment_id: session.payment_intent as string || session.id,
            gateway_response: session,
          });

        if (paymentError) {
          console.error("Error recording payment:", paymentError);
        }

        // Create or update subscription
        const isSubscription = session.mode === "subscription";
        
        const subscriptionData = {
          user_id: userId,
          plan_id: planId,
          status: "active" as const,
          started_at: new Date().toISOString(),
          gateway: "stripe",
          gateway_subscription_id: isSubscription ? session.subscription as string : null,
          ...(isSubscription && {
            renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }),
          ...(!isSubscription && {
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        };

        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .insert(subscriptionData);

        if (subError) {
          console.error("Error creating subscription:", subError);
        } else {
          console.log("Subscription created for user:", userId);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer
        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.supabase_user_id;

        if (userId) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status === "active" ? "active" : "cancelled",
              renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("gateway_subscription_id", subscription.id);

          if (error) console.error("Error updating subscription:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "cancelled",
            expires_at: new Date().toISOString(),
          })
          .eq("gateway_subscription_id", subscription.id);

        if (error) console.error("Error cancelling subscription:", error);
        console.log("Subscription cancelled:", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("gateway_subscription_id", subscriptionId);

          if (error) console.error("Error updating failed subscription:", error);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    // Log webhook event for audit
    await supabaseAdmin.from("audit_logs").insert({
      action: "stripe_webhook",
      entity: "payment",
      changes: { event_type: event.type, event_id: event.id },
    });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook Error: ${errorMessage}`, { status: 500 });
  }
});
