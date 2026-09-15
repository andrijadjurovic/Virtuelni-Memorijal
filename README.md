# Virtuelni Memorijal

Interaktivni 3D memorijalni park sa 2D profilima, digitalnim poklonima i porodičnim stablima.

## Arhitektura

```text
app/
  api/checkout/route.js              Stripe Checkout session
  api/webhooks/stripe/route.js       Gift activation webhook
  globals.css                        Visual language and responsive layout
  page.js                            Park shell, search and seeded data
components/
  3d/CemeteryScene.jsx               R3F terrain, controls, headstones, props
  ui/MemorialModal.jsx                Life story profile and gift actions
lib/
  prisma.js                           Singleton Prisma client
  stripe.js                           Stripe server client
prisma/
  schema.prisma                       SQLite models and relations
  migrations/                         Local database migrations
.env.example                          Required runtime configuration
```

## Pokretanje

1. Pokrenuti `npx prisma generate`.
2. Pokrenuti `npm run db:deploy`.
3. Pokrenuti `npm run db:seed`.
4. Pokrenuti `npm run dev` i otvoriti `http://localhost:3000`.

Za lokalne Stripe webhook događaje koristiti `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Lokalna SQLite baza

Projekat koristi lokalnu SQLite bazu u `prisma/dev.db`, bez naloga, cloud podešavanja ili connection string lozinke. Prisma ostaje ORM, a baza je spremna odmah nakon kloniranja projekta.

```bash
npx prisma generate
npm run db:deploy
npm run db:seed
```

`prisma/migrations/20260915181608_init_sqlite/migration.sql` automatski kreira sve tabele. `prisma/seed.js` automatski ubacuje četiri demo memorijala, timeline događaje i aktivne digitalne poklone, tako da nije potrebno ručno unositi podatke.

API `GET /api/memorials` čita javne memorijale, timeline događaje i aktivne poklone iz lokalne SQLite baze. Ako baza nije dostupna, početni ekran koristi lokalne demo memorijale kako bi aplikacija i dalje mogla da se pregleda.

Supabase klijenti ostaju u projektu kao opcioni budući adapter, ali nisu potrebni za lokalni rad.

## Napomena o podacima

Početni ekran koristi lokalni seed u `app/page.js` kako bi iskustvo bilo odmah vidljivo. `Memorial`, `GiftTransaction`, `TimelineEvent` i `Condolence` modeli su spremni za zamenu seed podataka server-side upitima. Privatnost i PIN proveru treba sprovesti na serveru pre vraćanja memorijala javnom klijentu.
