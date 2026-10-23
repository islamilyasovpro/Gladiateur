// Assemble src/ en un seul fichier jouable : dist/index.html
// (ouvrable tel quel dans un navigateur, ou publiable comme artifact).
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const read = p => readFileSync(join(src, p), 'utf8').replace(/\n$/, '');

// Les scripts partagent une seule portée : l'ordre des fichiers (préfixe numérique) compte.
const js = readdirSync(join(src, 'js')).filter(f => f.endsWith('.js')).sort()
  .map(f => read(join('js', f))).join('\n');

const html = read('index.html')
  .replace('/*@STYLE@*/', () => read('style.css'))
  .replace('/*@SCRIPT@*/', () => js);

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'index.html'), html + '\n');
console.log(`dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} Ko)`);
