import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.split('/').some(part => part.startsWith('.'))) throw new Error('Not found');
    let path = resolve(root, '.' + pathname);
    if (!path.startsWith(root + sep) && path !== root) throw new Error('Not found');
    if (pathname === '/') path = resolve(root, 'index.html');
    else if (!extname(path)) path += '.html';
    if (!types[extname(path)] || !(await stat(path)).isFile()) throw new Error('Not found');
    for (const header of config.headers.find(rule => rule.source === '/(.*)').headers) {
      const value = header.key === 'Content-Security-Policy' ? header.value.replace('; upgrade-insecure-requests', '') : header.value;
      res.setHeader(header.key, value);
    }
    res.setHeader('Content-Type', types[extname(path)] + (/html|css|javascript|plain/.test(types[extname(path)]) ? '; charset=utf-8' : ''));
    res.setHeader('Cache-Control', 'no-store');
    res.end(await readFile(path));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});
server.listen(Number(process.env.PORT || 4177), '127.0.0.1', () => {
  console.log('Yudi Labs preview: http://127.0.0.1:' + server.address().port);
});
