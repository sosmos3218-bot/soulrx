# SoulRx

감정 처방전 — 오늘의 마음에 맞는 성경 구절을 처방합니다.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Clerk 인증 (`/sign-in`, `/sign-up`)
- Neon Postgres — 로그인 사용자 히스토리·일일 한도 클라우드 동기화
- 비로그인 사용자는 localStorage 폴백

## Local setup

```bash
npm install
# .env.local 에 Clerk + DATABASE_URL 설정 (커밋하지 않음)
npm run dev
```

## Env (Vercel / local)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `DATABASE_URL` (Neon)

Do not commit secrets.

## Deploy

Production: https://soulrx.vercel.app
