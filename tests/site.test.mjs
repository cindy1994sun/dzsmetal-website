import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build, output } from '../scripts/build.mjs';
import { renderPages } from '../src/templates.mjs';
import { services } from '../src/services.mjs';
import { normalizeSiteUrl, email } from '../src/site.mjs';

const pages = renderPages();
test('site contains a home page, four service pages and a quote page', () => {
  assert.equal(services.length, 4);
  assert.equal(new Set(services.map(s => s.slug)).size, 4);
  assert.equal(pages.size, 6);
  for (const name of ['index.html', 'request-quote.html', ...services.map(s => `services/${s.slug}.html`)]) assert.ok(pages.has(name));
});
test('every page has distinct SEO metadata, one main heading and contact details', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [name, html] of pages) {
    assert.match(html, /<html lang="en">/, name);
    assert.match(html, /name="viewport"/, name);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, name);
    assert.equal((html.match(/<main[ >]/g) || []).length, 1, name);
    titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
    descriptions.add(html.match(/name="description" content="([^"]+)"/)[1]);
    assert.ok(html.includes(`mailto:${email}`), name);
    const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(json['@context'], 'https://schema.org');
    assert.ok(!html.includes('rel="canonical"'), 'Do not guess an unconfigured production URL');
  }
  assert.equal(titles.size, pages.size);
  assert.equal(descriptions.size, pages.size);
});
test('internal pages, assets and fragment links resolve', () => {
  for (const [name, html] of pages) {
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:)/.test(value)) continue;
      const target = new URL(value, `https://test.invalid/${name}`);
      const file = target.pathname.slice(1);
      if (pages.has(file)) {
        if (target.hash) assert.ok(pages.get(file).includes(`id="${target.hash.slice(1)}"`), `${name}: ${value}`);
      } else assert.ok(existsSync(path.resolve('assets', file.replace(/^assets\//, ''))), `${name}: missing ${value}`);
    }
  }
});
test('configured SEO URLs preserve a deployment base path', () => {
  const siteUrl = normalizeSiteUrl('https://example.com/metal');
  assert.equal(siteUrl, 'https://example.com/metal/');
  for (const [name, html] of renderPages(siteUrl)) {
    const expected = new URL(name === 'index.html' ? './' : name, siteUrl).href;
    assert.ok(html.includes(`rel="canonical" href="${expected}"`));
    assert.ok(html.includes(`property="og:url" content="${expected}"`));
  }
  assert.throws(() => normalizeSiteUrl('javascript:alert(1)'));
  assert.throws(() => normalizeSiteUrl('https://user:password@example.com/'));
});
test('quote form requires reply details and uses the correct inquiry address', () => {
  const html = pages.get('request-quote.html');
  assert.ok(html.includes(`action="mailto:${email}"`));
  assert.match(html, /id="email"[^>]*type="email"[^>]*required/);
  assert.match(html, /id="name"[^>]*required/);
  assert.match(html, /id="message"[^>]*required/);
  assert.ok(html.includes('send it from your email application'));
  for (const service of services) assert.ok(html.includes(`value="${service.slug}"`));
});
test('production build writes a six-page sitemap and drops stale URLs when unconfigured', async () => {
  await build('https://example.com/metal/');
  const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 6);
  for (const name of pages.keys()) {
    const url = new URL(name === 'index.html' ? './' : name, 'https://example.com/metal/').href;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
    assert.ok(existsSync(path.join(output, name)));
  }
  const robots = await readFile(path.join(output, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Sitemap: https://example.com/metal/sitemap.xml'));
  await build('');
  assert.ok(!existsSync(path.join(output, 'sitemap.xml')));
  assert.ok(!(await readFile(path.join(output, 'index.html'), 'utf8')).includes('rel="canonical"'));
  await build();
  assert.ok((await readFile(path.join(output, 'sitemap.xml'), 'utf8')).includes('https://dzsmetal.com/'));
});
