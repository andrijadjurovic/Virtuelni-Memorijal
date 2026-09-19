import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });

    const existing = await prisma.memorial.count({ where: { familyId: user.family.id } });
    const memorial = await prisma.memorial.create({
      data: {
        ownerId: user.id,
        familyId: user.family.id,
        name: `Demo memorijal ${existing + 1}`,
        birthDate: new Date("1948-03-12T00:00:00.000Z"),
        deathDate: new Date("2021-06-04T00:00:00.000Z"),
        bio: "Testni memorijal za proveru scene, poklona i porodične bašte.",
        privacy: "PRIVATE",
        positionX: -4 + (existing % 3) * 4,
        positionZ: -2 + (existing % 2) * 5,
        timeline: { create: [{ year: 1972, title: "Demo događaj", description: "Testni zapis u vremenskoj liniji." }] },
        gifts: {
          create: [
            { giftType: "DIGITAL_CANDLE", activeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), amount: 0 },
            { giftType: "FLOWER_BOUQUET", activeUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), amount: 0 },
          ],
        },
      },
      include: { gifts: true },
    });

    return NextResponse.json({ memorial }, { status: 201 });
  } catch (error) {
    console.error("Failed to create demo memorial", error);
    return NextResponse.json({ error: "Demo memorijal nije moguće dodati." }, { status: 500 });
  }
}