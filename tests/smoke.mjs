// Test de fumée : crée un gladiateur, mène un combat jusqu'au bout, puis clique au hasard.
// Échoue à la moindre erreur JS. Usage : npm test
import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const fail = msg => { console.error(msg + (errors.length ? '\nErreurs :\n' + errors.join('\n') : '')); process.exit(1); };

try {
  await page.goto('file://' + join(here, '..', 'dist', 'index.html'));
  await page.fill('input[type=text]', 'Spartak');
  await page.click('text=ENTRER DANS LE LUDUS');

  // un combat complet, en combat automatique et vitesse ×2
  await page.click('nav.tabs button:nth-child(2)');
  await page.click('[data-act="go"]');
  await page.click('#spd');
  await page.click('#auto');
  await page.waitForSelector('.battle .res', { timeout: 90000 });
  if (errors.length) fail('Erreur pendant le combat');
  await page.click('.battle .res button');

  // puis un peu de tout
  for (let i = 0; i < 80; i++) {
    const buttons = await page.$$('button:not([disabled]):visible');
    if (!buttons.length) break;
    await buttons[Math.floor(Math.random() * buttons.length)].click({ timeout: 1000 }).catch(() => {});
    await page.waitForTimeout(100);
  }
} catch (e) {
  await page.screenshot({ path: join(here, 'last-run.png') });
  fail('Échec : ' + e.message.split('\n')[0]);
}
await page.screenshot({ path: join(here, 'last-run.png') });
await browser.close();

if (errors.length) fail('Erreurs JS');
console.log('OK : combat mené à terme, aucune erreur JS');
