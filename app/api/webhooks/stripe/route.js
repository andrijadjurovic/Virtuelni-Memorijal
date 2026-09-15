import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook nije konfigurisan." }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: `Webhook signature failed: ${error.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const days = Number(session.metadata?.activeDays ?? 2);
    const activeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await prisma.giftTransaction.create({
      data: {
        memorialId: session.metadata.memorialId,
        giftType: session.metadata.giftType,
        stripeSessionId: session.id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        activeUntil,
      },
    });
  }
  return NextResponse.json({ received: true });
}