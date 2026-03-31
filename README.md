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
VITE_PAYMENT_NOTE=Carte sur demande via WhatsApp.
```

Notes:
- Use the international WhatsApp format without spaces or `+` (example: `2250700000000`).
- The customer pays via Mobile Money and sends proof on WhatsApp.
- Delivery fees are defined in `src/utils/checkout.js`.

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
```
