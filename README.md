# CompellingCore

A Vercel-ready Next.js drop platform with Discord OAuth, live role verification, four drop categories, private Cloudflare R2 attachments, PostgreSQL persistence, and automatic Discord webhook embeds.

> Use the Accounts category only for accounts, licences, or credentials you own and are authorized to distribute. Never publish third-party passwords, session tokens, cookies, or stolen access.

## What is hosted where

- **Vercel:** Next.js website and API routes
- **Cloudflare R2:** private uploaded attachments
- **PostgreSQL:** drop records and metadata
- **Discord:** OAuth login, role verification, and webhook embeds

A separate 24/7 bot host is not required for the website's Discord login or role checks. It is only needed for a Gateway-connected Discord bot with commands or live events.

## Install

```bash
npm install
cp .env.example .env.local
```

Use Node.js 20.19 or newer.

## Discord setup

1. Create an application in the Discord Developer Portal.
2. Under OAuth2, add these redirect URIs:
   - `http://localhost:3000/api/auth/callback/discord`
   - `https://YOUR-DOMAIN/api/auth/callback/discord`
3. Add the Client ID and Client Secret to `.env.local`.
4. Create a bot for the same application, copy its token, and invite it to your server.
5. Copy the server ID and each role ID that should receive access.

Multiple role IDs are supported:

```env
DISCORD_ALLOWED_ROLE_IDS=ROLE_ID_ONE,ROLE_ID_TWO
```

The OAuth login requests only Discord's `identify` scope. The server-side bot performs the live guild-member role lookup, so the bot does not need Administrator.

## Database

Create a PostgreSQL database and set `DATABASE_URL`.

```bash
npm run db:setup
```

Run the same setup command once against your production database before the first deployment.

## Cloudflare R2 setup

### 1. Create the private bucket

In the Cloudflare dashboard, open **R2 Object Storage** and create a bucket, for example:

```text
compellingcore
```

Keep the bucket private. Do not enable a public `r2.dev` URL.

### 2. Create an R2 API token

Under **R2 → Manage R2 API Tokens**, create an **Object Read & Write** token scoped only to this bucket. Copy these values immediately:

- Account ID
- Access Key ID
- Secret Access Key
- Bucket name

Add them to `.env.local` and later to Vercel:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=compellingcore
```

### 3. Configure browser-upload CORS

Open the bucket's **Settings → CORS Policy** and paste the contents of:

```text
r2-cors.example.json
```

Replace `https://YOUR-DOMAIN.com` with your real production domain. Keep `http://localhost:3000` while developing locally. Add your Vercel preview domain too when testing preview deployments.

The website creates a short-lived, role-authorized presigned PUT URL. The browser uploads directly to R2, so 15 MB files do not pass through Vercel's function request limit.

## Private attachment flow

1. The logged-in member requests an upload URL.
2. The API repeats the live Discord role check.
3. The browser uploads directly to a private R2 object using a two-minute presigned URL.
4. Before publishing, the server checks that the object belongs to that Discord user, exists, uses an approved type, and is no larger than 15 MB.
5. Downloads go through `/api/files`, repeat the role check, and redirect to a one-minute presigned R2 download URL.
6. Deleting a drop also deletes its R2 object.

Allowed types are JPEG, PNG, WebP, GIF, PDF, TXT, and ZIP.

## Discord embed

Create a Discord channel webhook and add it as `DISCORD_WEBHOOK_URL`. The implementation is in `src/lib/discord-webhook.ts`. Each published drop sends a branded embed linking back to the role-gated drop page; private R2 object URLs are never posted in Discord.

## Logo and OG image

The supplied logo is already placed at:

```text
public/logo.png
public/brand-mark.png
```

Replace this file with your already-made social sharing image:

```text
public/og.png
```

Recommended OG size: **1200 × 630 px**.

## Deploy to Vercel

1. Push this folder to GitHub and import it into Vercel.
2. Add every variable from `.env.example` in **Vercel → Project Settings → Environment Variables**.
3. Create or connect the PostgreSQL database.
4. Run `npm run db:setup` against production once.
5. Add the final production Discord OAuth redirect URI.
6. Put the production domain into the R2 CORS policy.
7. Deploy.

You do **not** need to create or connect a Vercel Blob store. `BLOB_READ_WRITE_TOKEN` is no longer used.

## Important security notes

- Keep `.env.local`, Discord tokens, OAuth secrets, database URLs, and R2 credentials out of Git.
- Scope the R2 token to only the CompellingCore bucket.
- Discord access is checked on protected pages, API writes, upload authorization, downloads, and deletion.
- Removing a member's allowed Discord role removes access on their next protected request.
- Presigned upload URLs expire after two minutes; download URLs expire after one minute.
- Put only first-party Codespectre accounts or access codes that you are authorized to distribute in the Accounts category.
