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
    gifts: [{ giftType: "DIGITAL_CANDLE", activeUntil: new Date("2030-01-01"), amount: 299 }],
  },
  {
    id: "demo-vladimir-jovanovic",
    name: "Vladimir Jovanović",
    birthDate: new Date("1939-10-03"),
    deathDate: new Date("2018-01-18"),
    bio: "Arhitekta čiji su mostovi povezivali više od obala. U svakoj liniji crteža tražio je ravnotežu i svetlo.",
    positionX: 2,
    positionZ: -4,
    timeline: [
      { year: 1964, title: "Diplomirao arhitekturu", description: "Počinje karijeru u gradskom birou za urbanizam." },
      { year: 1989, title: "Mostovi za budućnost", description: "Njegov najvažniji projekat postaje novi gradski orijentir." },
    ],
    gifts: [{ giftType: "FLOWER_BOUQUET", activeUntil: new Date("2030-01-01"), amount: 699 }],
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
    timeline: [
      { year: 2010, title: "Stigla je Luna", description: "Mala, bela šapa koja je promenila ritam čitave kuće." },
      { year: 2024, title: "Zauvek dobra devojka", description: "Njeno mesto pod suncem čuva miris lavande." },
    ],
  },
  {
    id: "demo-ana-marko-ilic",
    name: "Ana i Marko Ilić",
    birthDate: new Date("1931-01-01"),
    deathDate: new Date("2009-01-01"),
    bio: "Dvoje ljudi, jedan dom i sedamdeset godina razgovora za istim stolom.",
    positionX: -1,
    positionZ: 5,
    timeline: [{ year: 1952, title: "Prvi susret", description: "Na stanici, dok je padao prvi sneg." }],
  },
];

async function main() {
  for (const memorial of demoMemorials) {
    const { timeline, gifts = [], ...data } = memorial;
    await prisma.memorial.upsert({
      where: { id: memorial.id },
      update: data,
      create: {
        ...data,
        timeline: { create: timeline },
        gifts: { create: gifts },
      },
    });
    await prisma.timelineEvent.deleteMany({ where: { memorialId: memorial.id } });
    await prisma.timelineEvent.createMany({ data: timeline.map((event) => ({ ...event, memorialId: memorial.id })) });
    if (gifts.length) {
      await prisma.giftTransaction.deleteMany({ where: { memorialId: memorial.id } });
      await prisma.giftTransaction.createMany({ data: gifts.map((gift) => ({ ...gift, memorialId: memorial.id, currency: "eur" })) });
    }
  }
}

main().finally(() => prisma.$disconnect());