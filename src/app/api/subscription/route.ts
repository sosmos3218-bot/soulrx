import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  getSubscriptionRow,
  isEntitled,
  upsertFromStripeSubscription,
} from "@/lib/subscription";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let row = await getSubscriptionRow(userId);

  // Soft refresh from Stripe when we have a subscription id stored
  if (row?.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      const sub = await stripe.subscriptions.retrieve(
        String(row.stripe_subscription_id)
      );
      await upsertFromStripeSubscription(sub, userId);
      row = await getSubscriptionRow(userId);
    } catch {
      // keep cached row if Stripe retrieve fails
    }
  }

  const active = row
    ? isEntitled({
        status: String(row.status ?? ""),
        current_period_end:
          (row.current_period_end as Date | string | null) ?? null,
      })
    : false;

  return NextResponse.json({
    active,
    status: row ? String(row.status) : "inactive",
    currentPeriodEnd: row?.current_period_end
      ? row.current_period_end instanceof Date
        ? row.current_period_end.toISOString()
        : String(row.current_period_end)
      : null,
  });
}
