export const brand = 'DZS Metal';
export const email = 'marketings@china-casting.com';
export const defaultSiteUrl = 'https://dzsmetal.com/';

// Override SITE_URL at build time for a different production origin or base path.
// Example for a project site: https://example.com/dzsmetal-website/
export function normalizeSiteUrl(value = '') {
  if (!value.trim()) return '';
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTP(S) URL without credentials, query, or fragment.');
  }
  return url.href.replace(/\/?$/, '/');
}
