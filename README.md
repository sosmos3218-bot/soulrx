# SoulRx

감정에 처방을 내리는 따뜻한 웹앱.

## Stack

- Next.js (App Router)
- Clerk (auth)
- Neon (Postgres history)
- Stripe (monthly subscription)
- Vercel

## Local

```bash
npm install
npm run dev
```

Copy `.env.local` with:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `DATABASE_URL` (Neon)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)

## Production

https://soulrx.vercel.app
