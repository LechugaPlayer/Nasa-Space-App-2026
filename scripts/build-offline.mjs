import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
async function walk(dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'sw.js') continue
    const path = `${dir}/${entry.name}`
    files.push(...(entry.isDirectory() ? await walk(path) : [path]))
  }
  return files
}
const files = (await walk('dist')).sort(),
  hash = createHash('sha256')
for (const file of files) hash.update(file).update(await readFile(file))
const version = hash.digest('hex').slice(0, 16)
// No skipWaiting: a new version activates after old tabs close, avoiding mixed assets.
await writeFile(
  'dist/sw.js',
  `const CACHE = 'agriculture-${version}';
const FILES = ${JSON.stringify(files.map((f) => './' + f.slice(5)))};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('agriculture-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    if (event.request.mode === 'navigate') return (await cache.match('./index.html', { ignoreVary: true })) || fetch(event.request);
    // Only deployment-owned static files are precached. Ignore server Vary: Origin,
    // which otherwise distinguishes preload requests from same-origin module loads.
    return (await cache.match(event.request, { ignoreVary: true })) || fetch(event.request);
  }));
});\n`,
)
console.log('Offline shell', version, files.length, 'files')
