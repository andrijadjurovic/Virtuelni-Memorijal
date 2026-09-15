import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoMemorials = [
  {
    id: "demo-milena-petrovic",
    name: "Milena Petrović",
    birthDate: new Date("1948-03-12"),
    deathDate: new Date("2021-06-04"),
    bio: "Učiteljica, baštovanka i tiha snaga naše porodice. Volela je jutarnju kafu, miris lipe i decu koja postavljaju mnogo pitanja.",
    positionX: -4,
    positionZ: -2,
    timeline: [
      { year: 1948, title: "Rođena u Beogradu", description: "Prvi dan proleća doneo je porodici Petrović najmlađu ćerku." },
      { year: 1972, title: "Postala učiteljica", description: "Četrdeset generacija učenika nosilo je njenu dobrotu sa sobom." },
    ],
  },
  {
    id: "demo-luna",
    name: "Luna",
    birthDate: new Date("2010-01-01"),
    deathDate: new Date("2024-05-18"),
    bio: "Najmekše šape u kući i najbrži trk do kapije. Luna je sve dočekivala kao da se vraćamo posle dugog putovanja.",
    positionX: 5,
    positionZ: 3,
    isPet: true,
    timeline: [{ year: 2010, title: "Stigla je Luna", description: "Mala, bela šapa koja je promenila ritam čitave kuće." }],
  },
];

async function main() {
  for (const memorial of demoMemorials) {
    const { timeline, ...data } = memorial;
    await prisma.memorial.upsert({
      where: { id: memorial.id },
      update: data,
      create: { ...data, timeline: { create: timeline } },
    });
  }
}

main().finally(() => prisma.$disconnect());