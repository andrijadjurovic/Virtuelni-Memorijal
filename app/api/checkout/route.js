import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const giftCatalog = {
  DIGITAL_CANDLE: { label: "Digitalna sveća · 48h", amount: 299, days: 2 },
  FLOWER_BOUQUET: { label: "Buket cveća · 14 dana", amount: 699, days: 14 },
  PREMIUM_HEADSTONE: { label: "Premium spomenik", amount: 1499, days: 3650 },
};

export async function POST(request) {
  try {
    if (!stripe) return NextResponse.json({ error: "Stripe nije konfigurisan." }, { status: 503 });
    const { memorialId, giftType } = await request.json();
    const gift = giftCatalog[giftType];
    if (!memorialId || !gift) return NextResponse.json({ error: "Neispravan poklon." }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency: "eur", product_data: { name: gift.label }, unit_amount: gift.amount }, quantity: 1 }],
      metadata: { memorialId, giftType, activeDays: String(gift.days) },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?payment=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}