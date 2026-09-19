import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function serializeMemorial(memorial) {
  return {
    id: memorial.id,
    name: memorial.name,
    birthDate: formatDate(memorial.birthDate),
    deathDate: formatDate(memorial.deathDate),
    bio: memorial.bio ?? "",
    photoUrl: memorial.photoUrl,
    audioUrl: memorial.audioUrl,
    x: memorial.positionX,
    y: memorial.positionY,
    z: memorial.positionZ,
    isPet: memorial.isPet,
    timeline: memorial.timeline.map((event) => ({
      year: event.year,
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
    })),
    gifts: memorial.gifts.map((gift) => ({
      id: gift.id,
      giftType: gift.giftType,
      activeUntil: gift.activeUntil.toISOString(),
    })),
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
  if (!process.env.DATABASE_URL && !process.env.TURSO_DATABASE_URL) return NextResponse.json({ memorials: [], source: "empty" });

  try {
    const memorials = await prisma.memorial.findMany({
      where: { familyId: user.family.id, privacy: "PRIVATE" },
      include: {
        timeline: { orderBy: { year: "asc" } },
        gifts: { where: { activeUntil: { gt: new Date() } }, orderBy: { activeUntil: "desc" } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ memorials: memorials.map(serializeMemorial), source: process.env.TURSO_DATABASE_URL ? "turso" : "sqlite" });
  } catch (error) {
    console.error("Failed to load memorials", error);
    return NextResponse.json({ error: "Memorijali trenutno nisu dostupni." }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
    return NextResponse.json({ error: "Memorijal se aktivira nakon plaćanja." }, { status: 402 });
  } catch (error) {
    console.error("Failed to create memorial", error);
    return NextResponse.json({ error: "Memorijal nije moguće sačuvati." }, { status: 500 });
  }
}