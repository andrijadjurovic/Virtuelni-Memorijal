import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const giftCatalog = {
  DIGITAL_CANDLE: { label: "Digitalna sveća · 48h", amount: 299, days: 2 },
  FLOWER_BOUQUET: { label: "Buket cveća · 14 dana", amount: 699, days: 14 },
  PREMIUM_HEADSTONE: { label: "Premium spomenik", amount: 1499, days: 3650 },
};
const memorialPrice = { label: "Porodični memorijal", amount: 1999 };

export async function POST(request) {
  try {
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: "Stripe nije konfigurisan." }, { status: 503 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
    const { memorialId, giftType, productType, memorialData } = await request.json();
    if (productType === "MEMORIAL") {
      const name = memorialData?.name?.trim();
      if (!name) return NextResponse.json({ error: "Ime memorijala je obavezno." }, { status: 400 });
      const draft = await prisma.memorial.create({
        data: {
          ownerId: user.id,
          familyId: user.family.id,
          name,
          bio: memorialData.bio?.trim() || null,
          birthDate: memorialData.birthDate ? new Date(`${memorialData.birthDate}T00:00:00.000Z`) : null,
          deathDate: memorialData.deathDate ? new Date(`${memorialData.deathDate}T00:00:00.000Z`) : null,
          isPet: Boolean(memorialData.isPet),
          privacy: "PENDING",
        },
      });
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [{ price_data: { currency: "eur", product_data: { name: memorialPrice.label }, unit_amount: memorialPrice.amount }, quantity: 1 }],
          metadata: { productType, memorialId: draft.id, familyId: user.family.id },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?payment=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?payment=cancelled`,
        });
        return NextResponse.json({ url: session.url });
      } catch (error) {
        await prisma.memorial.delete({ where: { id: draft.id } }).catch(() => {});
        throw error;
      }
    }
    const gift = giftCatalog[giftType];
    if (!memorialId || !gift) return NextResponse.json({ error: "Neispravan poklon." }, { status: 400 });
    const memorial = await prisma.memorial.findFirst({ where: { id: memorialId, familyId: user.family.id } });
    if (!memorial) return NextResponse.json({ error: "Memorijal nije deo vaše porodice." }, { status: 403 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency: "eur", product_data: { name: gift.label }, unit_amount: gift.amount }, quantity: 1 }],
      metadata: { memorialId, giftType, activeDays: String(gift.days), familyId: user.family.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?payment=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}