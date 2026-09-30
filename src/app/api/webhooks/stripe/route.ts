import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  upsertFromStripeSubscription,
  upsertSubscription,
} from "@/lib/subscription";

export const runtime = "nodejs";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription;
  if (typeof fromParent === "string") return fromParent;
  if (fromParent && typeof fromParent === "object" && "id" in fromParent) {
    return (fromParent as Stripe.Subscription).id;
  }
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;

  const userId =
    session.client_reference_id || session.metadata?.userId || null;
  if (!userId) {
    console.error("checkout.session.completed missing userId");
    return;
  }

  const stripe = getStripe();
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  let subscription: Stripe.Subscription | null = null;
  if (typeof session.subscription === "string") {
    subscription = await stripe.subscriptions.retrieve(session.subscription);
  } else if (session.subscription && typeof session.subscription === "object") {
    subscription = session.subscription as Stripe.Subscription;
  }

  if (subscription) {
    await upsertFromStripeSubscription(subscription, userId);
    return;
  }

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    status:
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"
        ? "active"
        : "inactive",
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (
          event.type === "checkout.session.completed" &&
          session.payment_status === "unpaid"
        ) {
          break;
        }
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertFromStripeSubscription(sub);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = subscriptionIdFromInvoice(invoice);
        if (subRef) {
          const sub = await stripe.subscriptions.retrieve(subRef);
          await upsertFromStripeSubscription(sub);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
