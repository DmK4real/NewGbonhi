# NewGbonhi

## Development

Install dependencies:

```bash
npm install
```

Run the API server (terminal 1):

```bash
npm run api:dev
```

Run the Vue app (terminal 2):

```bash
npm run dev
```

By default:
- frontend runs on Vite (`http://localhost:4000`)
- API runs on `http://localhost:8787`
- Vite proxies `/api` requests to the API server

## Build

```bash
npm run build
npm run preview
npm test
```

SEO files are generated automatically during build:
- `public/sitemap.xml`
- `public/robots.txt`

Optional: set canonical site URL before build:

```bash
# PowerShell
$env:SITE_URL="https://dmk4real.github.io/NewGbonhi"
npm run build
```

## Product Data

Build `src/data/products.json` from an HTML export:

```bash
npm run products:build -- path/to/products.html src/data/products.json --multiplier=1000
```

## Image Optimization (WebP)

```bash
npm run images:optimize
```

## Payments (Manual)

The checkout page generates a WhatsApp message with the order summary.
Configure your contact details and Mobile Money numbers in `.env`:

```env
VITE_WHATSAPP_NUMBER=2250700000000
VITE_CONTACT_EMAIL=hello@newgbonhi.com
VITE_MOMO_WAVE=Wave 07 00 00 00 00
VITE_MOMO_ORANGE=Orange 07 00 00 00 00
VITE_MOMO_MTN=MTN 05 00 00 00 00
VITE_MOMO_MOOV=Moov 01 00 00 00 00
VITE_MOMO_ADDITIONAL=Mobile Money 05 05 20 15 15
VITE_PAYMENT_NOTE=Carte sur demande via WhatsApp.
```

Notes:
- Use the international WhatsApp format without spaces or `+` (example: `2250700000000`).
- The customer pays via Mobile Money and sends proof on WhatsApp.
- Delivery fees are defined in `src/utils/checkout.ts`.
- The frontend logs config warnings if `VITE_WHATSAPP_NUMBER` or `VITE_CONTACT_EMAIL` is missing, or if no Mobile Money number is configured.

## Orders API & Admin Access

Local development API:
- `api/server.js` (Node, file storage in `api/orders.json`)

Cloud deployment API:
- `api/worker/index.js` (Cloudflare Worker + Durable Object storage)

Set an admin password in `.env` for local Node API:

```env
ADMIN_PASSWORD=change-me
```

Optional API settings for local Node API:

```env
VITE_PORT=4000
API_PORT=8787
ADMIN_TOKEN_TTL_MS=28800000
VITE_API_BASE=/api
```

Compatibility note:
- if `ADMIN_PASSWORD` is not set, the API falls back to `VITE_ADMIN_PASSWORD`.
- the local Node API logs a startup warning if `ADMIN_PASSWORD` is missing, and also warns when the deprecated `VITE_ADMIN_PASSWORD` fallback is being used.

## GeniusPay Mobile Payments

The checkout creates a NewGbonhi order first, then requests a GeniusPay hosted
checkout URL for the item subtotal. Delivery fees stay payable on arrival, like
the manual Mobile Money flow.

Local `.env` values for sandbox testing:

```env
GENIUSPAY_API_KEY=pk_sandbox_xxx
GENIUSPAY_API_SECRET=sk_sandbox_xxx
GENIUSPAY_WEBHOOK_SECRET=whsec_xxx
GENIUSPAY_BASE_URL=https://geniuspay.ci/api/v1/merchant
SITE_URL=http://localhost:5173
GENIUSPAY_SUCCESS_URL=http://localhost:5173/checkout?payment=success
GENIUSPAY_ERROR_URL=http://localhost:5173/checkout?payment=failed
```

Cloudflare Worker secrets:

```sh
npx wrangler secret put GENIUSPAY_API_KEY
npx wrangler secret put GENIUSPAY_API_SECRET
npx wrangler secret put GENIUSPAY_WEBHOOK_SECRET
```

Configure this webhook URL in the GeniusPay merchant dashboard:

```text
https://newgbonhi-api.dominiquekouakou2.workers.dev/api/payments/geniuspay/webhook
```

Webhook signatures are verified with `X-Webhook-Signature` and
`X-Webhook-Timestamp`. A valid `payment.success` / `completed` event marks the
order as `paid` automatically.

## Orders History

Visit `/orders` in the frontend.
- admin login is verified by the backend API
- order read/update/delete operations require an authenticated API token

## Deployment

### GitHub Pages (Free URL)

This repository includes an automatic GitHub Pages workflow:
- file: `.github/workflows/deploy-pages.yml`
- trigger: push on `main`

Expected public URL:
- `https://dmk4real.github.io/NewGbonhi/`

Notes:
- Pages build uses `--base=/NewGbonhi/`
- router uses HTML5 history mode and the workflow copies `index.html` to `404.html` as SPA fallback
- frontend API URL is injected from repository variable `VITE_API_BASE`
- optional repository variable `SITE_URL` is used to generate canonical `sitemap.xml` / `robots.txt`

### Cloudflare API (Free URL)

This repository includes a Worker deployment workflow:
- file: `.github/workflows/deploy-worker.yml`
- trigger: push on `main` when API files change

`wrangler.toml` is already configured for:
- Worker name: `newgbonhi-api`
- Durable Object binding: `ORDERS_STORE`

Before the first deployment, configure GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Then configure the Worker admin password in Cloudflare dashboard:
1. Cloudflare dashboard -> Workers & Pages -> `newgbonhi-api`
2. Settings -> Variables and Secrets
3. Add secret: `ADMIN_PASSWORD`

Order email notifications use:
- `ORDER_TO_EMAIL`: internal NewGbonhi order inbox, defaults to `newgbonhifamily@gmail.com`
- `ORDER_FROM_EMAIL`: sender used for customer and internal order emails
- `ORDER_DASHBOARD_URL`: admin order dashboard linked from internal notifications
- `BRAND_LOGO_URL`: public logo used inside NewGbonhi email templates

Internal order notifications only include the order ID and event type. Customer
details remain behind the authenticated `/orders` dashboard.

Email sender avatars are controlled by inbox providers, not by the email HTML.
Use the public `BRAND_LOGO_URL` asset for Google/Outlook profile photos,
Gravatar, Apple Branded Mail, or BIMI DNS setup.

After the Worker is deployed, set GitHub repository variable:
- `VITE_API_BASE=https://<your-workers-url>/api`

Then re-run the Pages workflow to rebuild the frontend with the API URL.

## Google Indexing (Free)

1. Deploy latest `main` branch (GitHub Pages workflow).
2. Confirm these URLs are live:
   - `https://dmk4real.github.io/NewGbonhi/`
   - `https://dmk4real.github.io/NewGbonhi/robots.txt`
   - `https://dmk4real.github.io/NewGbonhi/sitemap.xml`
3. Open Google Search Console and add URL prefix property:
   - `https://dmk4real.github.io/NewGbonhi/`
4. In Search Console, submit sitemap:
   - `https://dmk4real.github.io/NewGbonhi/sitemap.xml`
5. Use URL Inspection on the home page and request indexing.

After submission, indexing can take from a few days to a few weeks.

### Useful scripts

```bash
npm run api:dev          # Local Node API
npm run api:worker:dev   # Local Worker dev (requires Wrangler)
npm run api:worker:deploy
npm test                 # Unit tests
```
