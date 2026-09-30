import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  periodEndFromSubscription,
  upsertFromStripeSubscription,
  upsertSubscription,
} from "@/lib/subscription";
import type Stripe from "stripe";

/**
 * Backup sync when webhooks are delayed/unconfigured:
 * success page calls this with the Checkout session_id to upsert entitlement.
 */
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const sessionUserId =
    session.client_reference_id ||
    session.metadata?.userId ||
    null;

  if (sessionUserId && sessionUserId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.mode !== "subscription") {
    return NextResponse.json({ error: "Not a subscription session" }, { status: 400 });
  }

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
  } else {
    await upsertSubscription({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: null,
      status:
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required"
          ? "active"
          : "inactive",
      currentPeriodEnd: null,
    });
  }

  return NextResponse.json({
    ok: true,
    status: subscription?.status ?? "synced",
    periodEnd: subscription
      ? periodEndFromSubscription(subscription)?.toISOString() ?? null
      : null,
  });
}
