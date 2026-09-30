import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { PLANS, TRIAL_DAYS, parsePlan, type PlanId } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { getSubscriptionRow } from "@/lib/subscription";

function randomSuffix(len = 8): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function resolvePlan(req: Request): Promise<PlanId> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("plan");
  if (fromQuery === "monthly" || fromQuery === "annual") {
    return fromQuery;
  }

  try {
    const body = (await req.json()) as { plan?: unknown };
    return parsePlan(body?.plan);
  } catch {
    return "monthly";
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await resolvePlan(req);
  const planConfig = PLANS[plan];

  const stripe = getStripe();
  const appUrl = await getAppUrl();
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    undefined;

  const existing = await getSubscriptionRow(userId);
  const customerId = existing?.stripe_customer_id
    ? String(existing.stripe_customer_id)
    : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: userId,
    customer: customerId,
    customer_email: customerId ? undefined : email,
    metadata: { userId, plan },
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { userId, plan },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "krw",
          unit_amount: planConfig.unitAmount,
          recurring: { interval: planConfig.interval },
          product_data: {
            name: planConfig.productName,
            description: planConfig.productDescription,
          },
        },
      },
    ],
    success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?checkout=cancel`,
    integration_identifier: `soulrx-checkout-${randomSuffix()}`,
    locale: "ko",
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Checkout session URL missing" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: session.url,
    sessionId: session.id,
    plan,
  });
}
