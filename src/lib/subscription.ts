import "server-only";
import type Stripe from "stripe";
import { getSql } from "./db";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function periodEndFromSubscription(
  sub: Stripe.Subscription
): Date | null {
  const fromItem = sub.items?.data?.[0]?.current_period_end;
  // Fallback for older API shapes that still expose it on the subscription
  const fromSub = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  const ts = fromItem ?? fromSub;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}

export function isEntitled(row: {
  status: string | null;
  current_period_end: Date | string | null;
}): boolean {
  if (row.status && ACTIVE_STATUSES.has(row.status)) return true;
  if (row.current_period_end) {
    const end =
      row.current_period_end instanceof Date
        ? row.current_period_end
        : new Date(row.current_period_end);
    if (!Number.isNaN(end.getTime()) && end.getTime() > Date.now()) return true;
  }
  return false;
}

export async function getSubscriptionRow(userId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT user_id, stripe_customer_id, stripe_subscription_id, status,
           current_period_end, updated_at
    FROM subscriptions
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function isUserSubscribed(userId: string): Promise<boolean> {
  const row = await getSubscriptionRow(userId);
  if (!row) return false;
  return isEntitled({
    status: String(row.status ?? ""),
    current_period_end: (row.current_period_end as Date | string | null) ?? null,
  });
}

export async function upsertSubscription(params: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  currentPeriodEnd?: Date | null;
}): Promise<void> {
  const sql = getSql();
  const {
    userId,
    stripeCustomerId = null,
    stripeSubscriptionId = null,
    status,
    currentPeriodEnd = null,
  } = params;

  await sql`
    INSERT INTO subscriptions (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      status,
      current_period_end,
      updated_at
    )
    VALUES (
      ${userId},
      ${stripeCustomerId},
      ${stripeSubscriptionId},
      ${status},
      ${currentPeriodEnd ? currentPeriodEnd.toISOString() : null}::timestamptz,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      stripe_customer_id = COALESCE(
        EXCLUDED.stripe_customer_id,
        subscriptions.stripe_customer_id
      ),
      stripe_subscription_id = COALESCE(
        EXCLUDED.stripe_subscription_id,
        subscriptions.stripe_subscription_id
      ),
      status = EXCLUDED.status,
      current_period_end = COALESCE(
        EXCLUDED.current_period_end,
        subscriptions.current_period_end
      ),
      updated_at = NOW()
  `;
}

export async function upsertFromStripeSubscription(
  sub: Stripe.Subscription,
  fallbackUserId?: string | null
): Promise<string | null> {
  const userId =
    sub.metadata?.userId ||
    fallbackUserId ||
    (await lookupUserIdByCustomer(
      typeof sub.customer === "string" ? sub.customer : sub.customer?.id
    )) ||
    (await lookupUserIdBySubscription(sub.id));

  if (!userId) return null;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    status: sub.status,
    currentPeriodEnd: periodEndFromSubscription(sub),
  });

  return userId;
}

async function lookupUserIdByCustomer(
  customerId: string | null | undefined
): Promise<string | null> {
  if (!customerId) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT user_id FROM subscriptions
    WHERE stripe_customer_id = ${customerId}
    LIMIT 1
  `;
  return rows[0] ? String(rows[0].user_id) : null;
}

async function lookupUserIdBySubscription(
  subscriptionId: string
): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT user_id FROM subscriptions
    WHERE stripe_subscription_id = ${subscriptionId}
    LIMIT 1
  `;
  return rows[0] ? String(rows[0].user_id) : null;
}
