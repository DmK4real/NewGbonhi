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
- frontend runs on Vite (`http://localhost:5173`)
- API runs on `http://localhost:8787`
- Vite proxies `/api` requests to the API server

## Build

```bash
npm run build
npm run preview
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

Orders are stored server-side in `api/orders.json`.

Set an admin password in `.env`:

```env
ADMIN_PASSWORD=change-me
```

Optional API settings:

```env
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

### Frontend
Deploy `dist/` as usual (`npm run build`).

### API
Deploy `api/server.js` as a Node service and persist `api/orders.json` (or replace file storage with a database in production).

### GitHub Pages (Free URL)

This repository includes an automatic GitHub Pages workflow:
- file: `.github/workflows/deploy-pages.yml`
- trigger: push on `main`

Expected public URL:
- `https://dmk4real.github.io/NewGbonhi/`

Notes:
- Pages build uses `--base=/NewGbonhi/`
- router uses hash mode on Pages (`VITE_USE_HASH_ROUTER=true`) to avoid 404 on refresh
