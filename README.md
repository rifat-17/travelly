# Travel Planner

A small Next.js app for planning trips: destinations, dates, notes, and a per-user trip list.

## Stack

- Next.js 16 (App Router, Turbopack, React Compiler)
- React 19 + Tailwind CSS v4 + shadcn/ui (Base UI)
- Prisma 7 with the `pg` driver adapter (Prisma Postgres)
- Neon Auth (hosted Better Auth) for email/password sessions

## Environment

Create a `.env` file with:

```bash
DATABASE_URL="postgresql://..."
NEON_AUTH_BASE_URL="https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth"
NEON_AUTH_COOKIE_SECRET="<at least 32 random characters>"
```

Generate a cookie secret with:

```bash
openssl rand -base64 32
```

## Neon Auth setup

1. Open your project at [console.neon.tech](https://console.neon.tech).
2. Open **Auth** (Better Auth) and click **Enable Auth**.
3. Copy the Auth URL from **Settings → Better Auth → Project Info**.
4. Paste it into `NEON_AUTH_BASE_URL` in `.env`.
5. Restart the dev server.

The app uses Neon Auth as the auth provider only; trip data stays in your own Postgres database (`DATABASE_URL`).

## Getting started

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start adding trips.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Notes

- `/trips` and `/trips/new` are protected by `src/proxy.ts` and require a signed-in user.
- Trips are scoped by `Trip.userId`. Trips created before auth was enabled (with a `null` owner) are claimed by the first user who signs in.
