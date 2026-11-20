import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const BASE = '/Home-fit-ai';
const index = new URL('../dist/index.html', import.meta.url).pathname;

if (!existsSync(index)) {
  console.error('dist/index.html introuvable : exécute `npx expo export --platform web` avant.');
  process.exit(1);
}

let html = readFileSync(index, 'utf8');

if (!html.includes('manifest.webmanifest')) {
  const head =
    `<meta name="theme-color" content="#FF6A00" />\n` +
    `<link rel="manifest" href="${BASE}/manifest.webmanifest" />\n` +
    `<link rel="apple-touch-icon" href="${BASE}/icon-192.png" />\n` +
    `<meta name="apple-mobile-web-app-capable" content="yes" />\n` +
    `<meta name="apple-mobile-web-app-title" content="HOMEFIT" />\n`;
  html = html.replace('<head>', `<head>\n${head}`);
  writeFileSync(index, html);
  console.log('index.html : balises PWA injectées');
} else {
  console.log('index.html : balises PWA déjà présentes');
}

writeFileSync(new URL('../dist/.nojekyll', import.meta.url).pathname, '');
console.log('dist : prêt pour GitHub Pages');
