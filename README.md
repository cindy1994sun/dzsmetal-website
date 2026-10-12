# DZS Metal website

English website for custom metal manufacturing inquiries at **marketings@china-casting.com**. Includes the home page, Casting, CNC Machining, Forging, Sheet Metal Fabrication and Request a Quote pages. The production URL is **https://dzsmetal.com/**.

This implementation was rebuilt from the requested scope. The original source and Git object for `8c656c1` were not available in this checkout; the new implementation has its own commit history.

## Local development

Requires Node.js 20 or later (Node.js 24 is used in CI). No third-party runtime or build dependencies are required.

```sh
cd /workspace/dzsmetal-website
npm ci
npm test
npm run dev
```

The local development server uses port 3000, rebuilds when `src/` or `assets/` changes, and serves `dist/`. Refresh the browser after editing. `HOST` and `PORT` can override the listen address and port. Each cloud task already has an isolated checkout; use it directly without creating a Git worktree.

## Build and deploy

```sh
npm run build
```

Upload the contents of `dist/` to a static website host. The build outputs six HTML pages, local CSS/JavaScript/SVG assets, `robots.txt`, `sitemap.xml` and `.nojekyll`. No application server or database is required in production. This repository's GitHub Actions workflow runs tests and builds; it does not publish the website or configure DNS.

The default canonical origin is `https://dzsmetal.com/`. For a different deployment URL or subdirectory, rebuild with:

```sh
SITE_URL=https://example.com/metal/ npm run build
```

Setting `SITE_URL` to an empty string deliberately omits canonical URLs and the sitemap for deployments whose public URL is not yet known. Asset and page links remain relative, so the site also works under a subdirectory. Deployment hosts must serve the explicit `.html` service routes.

## Content and behavior

- `src/templates.mjs`: shared layout, English home page, service page template and inquiry page.
- `src/services.mjs`: the four services, purchasing guidance, materials, applications and FAQs.
- `src/site.mjs`: brand, email and default production URL.
- `assets/`: responsive styles, accessible mobile navigation, inquiry behavior and original SVG illustrations. No remote fonts or images.
- `scripts/`: dependency-free build and local development server.

The quote form validates the required name, reply email and project details, then prepares an email draft addressed to `marketings@china-casting.com`. The visitor chooses **Open email draft** to launch their email application and **must send the email from that application**. The draft link opens separately so form entries remain available if the browser has no email handler. It is not a server-side submission system. Drawings can be attached in the email application; a direct email link and plain address are provided as alternatives. The page does not upload attachments or persist form entries on a server.

SEO includes unique titles and descriptions, English language metadata, Open Graph metadata, one main heading per page, canonical URLs, structured data, a sitemap and robots guidance. Production metadata uses the configured domain; the build does not establish domain ownership or enable hosting.

## Verification

`npm test` checks page coverage, distinct SEO metadata, internal links and fragments, asset references, structured data, canonical base paths and required inquiry fields. CI runs these checks and the production build on pushes and pull requests.

For optional real-browser checks, install Python Playwright with its Chromium browser in your testing environment, start the development server, and run:

```sh
python3 tests/browser_smoke.py
```

The browser checks desktop and mobile pages, overflow, navigation, service preselection, form validation and the generated inquiry draft. Set `CHROMIUM_PATH` if using a system Chromium installation, and `TEST_URL` if the server address differs from the default.
