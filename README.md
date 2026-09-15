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

## Baza: lokalni SQLite ili Turso

Lokalni razvoj koristi `prisma/dev.db`. Za Vercel koristi Turso, hostovani SQLite koji je kompatibilan sa Prisma modelom i radi trajno između deploy-a.

```bash
npx prisma generate
npm run db:deploy
npm run db:seed
```

`prisma/migrations/20260915181608_init_sqlite/migration.sql` automatski kreira sve tabele. `prisma/seed.js` automatski ubacuje četiri demo memorijala, timeline događaje i aktivne digitalne poklone, tako da nije potrebno ručno unositi podatke.

### Turso na Vercelu

1. Otvoriti `https://turso.tech`, napraviti nalog i instalirati Turso CLI.
2. Pokrenuti `turso db create virtualni-memorijal`.
3. Pokrenuti `turso db show virtualni-memorijal` i uzeti libSQL URL.
4. Pokrenuti `turso db tokens create virtualni-memorijal` i sačuvati token.
5. Lokalno postaviti `TURSO_DATABASE_URL` i `TURSO_AUTH_TOKEN`, pa pokrenuti `npm run db:turso:setup` i `npm run db:seed`.
6. Na Vercelu dodati iste dve environment promenljive za `Production`.

`npm run db:turso:setup` šalje postojeću Prisma SQL migraciju direktno u Turso; `npm run db:seed` zatim ubacuje sve mock podatke.

API `GET /api/memorials` čita javne memorijale, timeline događaje i aktivne poklone iz lokalne SQLite baze. Ako baza nije dostupna, početni ekran koristi lokalne demo memorijale kako bi aplikacija i dalje mogla da se pregleda.

Supabase klijenti ostaju u projektu kao opcioni budući adapter, ali nisu potrebni za lokalni rad.

## Napomena o podacima

Početni ekran koristi lokalni seed u `app/page.js` kako bi iskustvo bilo odmah vidljivo. `Memorial`, `GiftTransaction`, `TimelineEvent` i `Condolence` modeli su spremni za zamenu seed podataka server-side upitima. Privatnost i PIN proveru treba sprovesti na serveru pre vraćanja memorijala javnom klijentu.
