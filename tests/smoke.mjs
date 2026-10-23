// Test de fumée : crée un gladiateur puis clique au hasard, échoue à la moindre erreur JS.
// Usage : npm test (après npm run build)
import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const page_url = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.html');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto(page_url);
await page.fill('input[type=text]', 'Spartak');
await page.click('text=ENTRER DANS LE LUDUS');
for (let i = 0; i < 150; i++) {
  const buttons = await page.$$('button:not([disabled]):visible');
  if (!buttons.length) break;
  await buttons[Math.floor(Math.random() * buttons.length)].click({ timeout: 1000 }).catch(() => {});
  await page.waitForTimeout(150);
}
await page.screenshot({ path: join(dirname(fileURLToPath(import.meta.url)), 'last-run.png') });
await browser.close();

if (errors.length) { console.error('Erreurs :\n' + errors.join('\n')); process.exit(1); }
console.log('OK : aucune erreur JS');
