# Ludus Magnus

Jeu de gestion et de combat de gladiateurs, en HTML/CSS/JS sans dépendance, jouable sur téléphone.

## Structure

- `src/index.html` : squelette de la page
- `src/style.css` : tout le style
- `src/js/` : le code, chargé dans l'ordre des préfixes (portée partagée)
  - `01-art.js` : dessins SVG (gladiateurs, arène, icônes)
  - `02-sfx.js` : sons générés (Web Audio)
  - `03-game.js` : règles du jeu (`G`), sans DOM, testable dans Node
  - `10-state.js` à `15-actions.js` : sauvegarde, écrans, combat, actions
- `build.mjs` : assemble le tout en un seul fichier `dist/index.html`

## Commandes

```sh
npm install      # une fois (Playwright, pour les tests)
npm run build    # produit dist/index.html, à ouvrir dans un navigateur
npm test         # build + test de fumée dans un vrai navigateur
```
