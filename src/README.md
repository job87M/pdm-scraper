# AM Scraper (Cloudflare-ready)

Paste a product element’s HTML (or upload a saved page) to extract title, description, price, savings percentage, image, and deal countdown. Browse the collection in-browser and export to CSV.

**No backend. No database.** Everything runs client-side. Products live only in the current browser session; export to CSV when you are done.

## Why this version?

The original app used a Python FastAPI + SQLite backend. That is unsuitable for Cloudflare Pages/Workers (no persistent filesystem DB, and the data is only needed until CSV export). This version:

- Ports the scraper to pure JavaScript using the browser `DOMParser`
- Removes all API calls and SQLite storage
- Is a static SPA that deploys directly to Cloudflare Pages

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to Cloudflare Pages

### Option A – Cloudflare Dashboard

1. Push this folder to a GitHub/GitLab repo (or upload the `dist` folder).
2. In the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → connect the repo (or direct upload).
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Deploy.

### Option B – Wrangler CLI

```bash
npm install -g wrangler
npm run build
npx wrangler pages deploy dist --project-name=am-scraper
```

No environment variables are required.

## Usage

1. On Amazon, open a product listing / deal page.
2. Right-click a product card → Inspect → copy the outer HTML of the element that has `data-testid="product-card"`.
3. Paste it into the scraper (or save the page as HTML and upload the file).
4. Review the extracted products, then **Export CSV**.

## Notes

- Data is **not** persisted across page reloads or devices. Export the CSV before closing the tab if you need it.
- Countdown timers ("Ends in …") are resolved relative to the capture time of the HTML (file last-modified or “now”).
- Only Amazon product-card HTML is supported.
