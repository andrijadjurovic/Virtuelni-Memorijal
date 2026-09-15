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
  schema.prisma                       PostgreSQL models and relations
.env.example                          Required runtime configuration
```

## Pokretanje

1. Kopirati `.env.example` u `.env` i uneti PostgreSQL i Stripe vrednosti.
2. Pokrenuti `npx prisma generate` i zatim `npx prisma migrate dev --name init` kada je baza dostupna.
3. Pokrenuti `npm run dev` i otvoriti `http://localhost:3000`.

Za lokalne Stripe webhook događaje koristiti `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Napomena o podacima

Početni ekran koristi lokalni seed u `app/page.js` kako bi iskustvo bilo odmah vidljivo. `Memorial`, `GiftTransaction`, `TimelineEvent` i `Condolence` modeli su spremni za zamenu seed podataka server-side upitima. Privatnost i PIN proveru treba sprovesti na serveru pre vraćanja memorijala javnom klijentu.
