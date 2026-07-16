import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, email } = JSON.parse(body);
        if (!name || !email) throw new Error('Missing fields');
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: `Thanks ${name}. Our team will be in touch.` }));
      } catch {
        res.writeHead(400, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Please provide your name and email.' }));
      }
    });
    return;
  }

  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = join(root, normalize(requested));
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
}).listen(3000, () => console.log('Harborline running at http://localhost:3000'));
