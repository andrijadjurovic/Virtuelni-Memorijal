import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  if (!process.env.DATABASE_URL && !process.env.TURSO_DATABASE_URL) return NextResponse.json({ memorials: [], source: "demo" });

  try {
    const memorials = await prisma.memorial.findMany({
      where: { privacy: "PUBLIC" },
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
    const body = await request.json();
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Ime memorijala je obavezno." }, { status: 400 });

    const memorial = await prisma.memorial.create({
      data: {
        name,
        bio: body.bio?.trim() || null,
        birthDate: body.birthDate ? new Date(`${body.birthDate}T00:00:00.000Z`) : null,
        deathDate: body.deathDate ? new Date(`${body.deathDate}T00:00:00.000Z`) : null,
        isPet: Boolean(body.isPet),
        privacy: "PUBLIC",
        positionX: Number(body.positionX) || 0,
        positionZ: Number(body.positionZ) || 0,
      },
    });
    return NextResponse.json({ memorial }, { status: 201 });
  } catch (error) {
    console.error("Failed to create memorial", error);
    return NextResponse.json({ error: "Memorijal nije moguće sačuvati." }, { status: 500 });
  }
}