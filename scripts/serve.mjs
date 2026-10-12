import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { build, output, root } from './build.mjs';

await build();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end('Method not allowed'); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    let file = path.resolve(output, `.${pathname}`);
    if (file !== output && !file.startsWith(`${output}${path.sep}`)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (err) {
    res.writeHead(err instanceof URIError ? 400 : 404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : 'Page not found');
  }
});
server.listen(port, host, () => console.log(`DZS Metal development server listening on ${host}:${port}`));
let timer;
let rebuilding = Promise.resolve();
const runFile = promisify(execFile);
const watchers = ['src', 'assets'].map(dir => watch(path.join(root, dir), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    // Run in a fresh process so template/content imports are not cached across edits.
    rebuilding = rebuilding.then(() => runFile(process.execPath, [path.join(root, 'scripts/build.mjs')], { cwd: root })).then(() => console.log('Site rebuilt. Refresh your browser.')).catch(err => console.error('Build failed:', err.message));
  }, 150);
}));
function stop() {
  clearTimeout(timer);
  watchers.forEach(w => w.close());
  server.close();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
