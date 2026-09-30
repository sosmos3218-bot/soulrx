import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
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

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "krw",
          unit_amount: 3900,
          recurring: { interval: "month" },
          product_data: {
            name: "SoulRx 무제한",
            description: "하루 처방 횟수 제한 없이 말씀 처방을 이용합니다.",
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

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
