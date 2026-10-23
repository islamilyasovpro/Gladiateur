// Assemble src/ en un seul fichier jouable : dist/index.html
// (ouvrable tel quel dans un navigateur, ou publiable comme artifact).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const read = p => readFileSync(join(src, p), 'utf8').replace(/\n$/, '');

// Les scripts partagent une seule portée : l'ordre des fichiers (préfixe numérique) compte.
const js = readdirSync(join(src, 'js')).filter(f => f.endsWith('.js')).sort()
  .map(f => read(join('js', f))).join('\n');

// Illustrations : assets/<nom>.webp|jpg|png devient la classe .p-<nom>, embarquée dans le fichier
// (un seul fichier à partager, aucune requête réseau).
const MIME = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
const assets = join(root, 'assets');
const images = (existsSync(assets) ? readdirSync(assets) : []).map(f => f.match(/^([a-z0-9-]+)\.(webp|jpe?g|png)$/)).filter(Boolean).sort();
const paintCss = images.map(([f, name, ext]) => `.p-${name}{background-image:url(data:${MIME[ext]};base64,${readFileSync(join(assets, f)).toString('base64')})}`).join('\n');

const html = read('index.html')
  .replace('/*@STYLE@*/', () => read('style.css'))
  .replace('/*@PAINT_CSS@*/', () => paintCss)
  .replace('/*@SCRIPT@*/', () => js.replace('/*@PAINT@*/[]', JSON.stringify(images.map(m => m[1]))));

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'index.html'), html + '\n');
console.log(`dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} Ko, ${images.length} illustration(s)${images.length ? ' : ' + images.map(m => m[1]).join(', ') : ''})`);
