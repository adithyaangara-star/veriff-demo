# Veriff Expo Demo

Expo managed React Native app with strict TypeScript and feature-based Veriff integration.

## What this project demonstrates

- Expo managed workflow (no direct `ios/` or `android/` edits)
- Strict TypeScript architecture
- Feature-based Veriff module under `src/features/veriff`
- Flow mode toggle:
  - `doc-only`
  - `doc-selfie`
- Frontend + separate backend pattern for secure Veriff integration

## App setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
cp .env.example .env
```

3. Set `EXPO_PUBLIC_API_BASE_URL` to your backend service URL.

4. Start app:

```bash
npx expo start
```

## Mobile API contract

- `GET /health` — health check
- `POST /veriff/session` — creates a Veriff session and returns `verificationUrl`

## Security notes

- Never keep `API_SECRET` in the Expo app.
- Keep Veriff secrets in backend env only.
- Rotate keys after sharing them in plaintext.
