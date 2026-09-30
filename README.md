# SoulRx

그리스도 친화적 감정 처방 큐티 MVP.

- 라이브: https://soulrx.vercel.app
- 레포: https://github.com/sosmos3218-bot/soulrx

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.local`에 필요한 키 (값은 Vercel/Clerk에서 발급):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `DATABASE_URL` (Neon)

## 흐름

감정 선택 → 상황 → 처방전(구절·묵상·기도) → 이미지 저장 / 7일 기록 (하루 1회 무료)

## 인증 · 저장

- 게스트: localStorage (기존과 동일)
- 로그인 사용자: Neon `history_entries` / `daily_limits` API 동기화
- 로그인 후 기기에 남긴 기록이 있으면 「클라우드로 동기화」 안내

소스 작업 경로(에이전트 박스): `/workspace/soulrx`
