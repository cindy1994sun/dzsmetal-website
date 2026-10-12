import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { renderPages, escapeHtml } from '../src/templates.mjs';
import { normalizeSiteUrl, defaultSiteUrl } from '../src/site.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = path.join(root, 'dist');

export async function build(rawSiteUrl = process.env.SITE_URL ?? defaultSiteUrl) {
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const pages = renderPages(siteUrl);
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'services'), { recursive: true });
  for (const [name, html] of pages) await writeFile(path.join(output, name), html);
  await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  await writeFile(path.join(output, '.nojekyll'), '');
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n` : ''}`);
  if (siteUrl) {
    const urls = [...pages.keys()].map(p => new URL(p === 'index.html' ? './' : p, siteUrl).href);
    await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${escapeHtml(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  }
  return { pages, siteUrl };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await build();
  console.log(`Built ${result.pages.size} pages in ${output}.`);
  console.log(result.siteUrl ? `SEO URLs: ${result.siteUrl}` : 'SITE_URL is unset: canonical URLs and sitemap are omitted until the production URL is configured.');
}
