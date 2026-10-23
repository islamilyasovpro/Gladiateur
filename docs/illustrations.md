# Illustrations à générer

Les décors peints remplacent automatiquement les décors vectoriels : il suffit de déposer
l'image sous le bon nom. Une image manquante n'est pas un problème, le jeu garde alors
le dessin actuel. On peut donc avancer une image à la fois.

Les gladiateurs restent dessinés par le code (ils changent avec l'équipement et s'animent).
Ils se posent **par-dessus** les décors, donc les décors ne doivent contenir **personne
au premier plan**.

## Comment faire

1. Génère les images avec l'outil de ton choix (ChatGPT, Midjourney, etc.).
   Les prompts sont en anglais : ces outils les suivent mieux.
2. Commence par `arena`. Une fois qu'elle te plaît, donne-la comme **référence de style**
   pour toutes les suivantes (ChatGPT : joins l'image et ajoute « same painting style as
   the attached image » ; Midjourney : `--sref` avec l'image). C'est ce qui garantit que
   tout le jeu a l'air d'être peint par la même main.
3. Nomme chaque fichier exactement comme indiqué (`arena.png`, `ev-dice.jpg`…),
   puis envoie-le-moi dans la conversation ou dépose-le dans `assets/raw/` sur GitHub.
   Je m'occupe du redimensionnement, de la compression et de l'intégration.

## Le style commun (à coller au début de chaque prompt)

```
Dark painterly digital illustration, ancient Rome, warm flickering torchlight and deep
shadows, rich terracotta, bronze, ochre and black palette, cinematic lighting, high-end
mobile RPG concept art, visible brush texture, no text, no watermark, no people in the
foreground.
```

## Décors (format carré, 1:1)

Le décor est recadré différemment selon l'écran (large dans le ludus, haut en combat).
Il faut donc garder l'essentiel au centre, et un **sol vide et plat sur le tiers
inférieur**, où se tiennent les personnages.

| Fichier | Où il apparaît | Prompt (après le style commun) |
|---|---|---|
| `arena` | Onglet Arène et écran de combat | `Interior of a Roman amphitheater at night, seen at eye level from the sand. Tiered stone stands packed with a blurred, roaring crowd, flaming braziers, red and gold banners, dark arched gates in the arena wall. The empty, flat, evenly lit sand floor fills the lower third of the image. Square format.` |
| `ludus` | Onglet Ludus, et par défaut partout ailleurs | `Courtyard of a gladiator school at night, eye level. Moonlit stone walls with barred cell doors, a wooden training post, weapon racks, a glowing bronze brazier. The empty, flat packed-earth floor fills the lower third of the image. Square format.` |
| `create` | Écran de création du personnage | `A stone slave cell under a gladiator school at dawn, eye level. Heavy chains bolted to the wall, scattered straw, a single shaft of light through a barred window. The empty, flat floor fills the lower third of the image. Mood: captivity and hope. Square format.` |
| `shop` | Onglet Boutique | `A Roman armorer's forge at night, eye level. Glowing embers, an anvil, swords, shields and helmets hanging on the walls, sparks in the air. The empty, flat stone floor fills the lower third of the image. Square format.` |
| `rank` | Onglet Rang | `A torchlit hall of champions in ancient Rome, eye level. Marble statues of victorious gladiators, laurel wreaths, wax tablets with names carved on the walls. The empty, flat marble floor fills the lower third of the image. Square format.` |
| `hero` | Onglet Perso | `A gladiator's private quarters, eye level. A straw bed, a wooden chest, an armor stand, an oil lamp casting warm light. The empty, flat floor fills the lower third of the image. Square format.` |

## Vignettes des imprévus (format paysage, 3:2)

Elles s'affichent en haut des fenêtres d'événement. Chacune couvre une famille d'événements :
mieux vaut des **objets en nature morte**, sans visage.

| Fichier | Famille d'événements | Prompt (après le style commun) |
|---|---|---|
| `ev-potion` | Marchands, guérisseur, huiles | `Still life on a rough wooden table: glass and clay vials of colored potions, herbs, a mortar and pestle, lit by an oil lamp. Landscape 3:2.` |
| `ev-dice` | Jeux, paris, voleurs, jongleur | `Still life: bone dice and bronze coins scattered on top of a barrel in a dark corner, torchlight. Landscape 3:2.` |
| `ev-chest` | Cadeaux, paquets, admiratrice | `Still life: a small iron-bound wooden chest half open, spilling gold coins and a folded cloth bundle, warm light. Landscape 3:2.` |
| `ev-bread` | Repas, vin, cuisine | `Still life: a steaming bowl of stew, a loaf of bread, a clay cup and a wine amphora on a wooden table. Landscape 3:2.` |
| `ev-amulet` | Amulettes, diseuse, superstitions | `Still life: bronze and bone amulets laid out on a goat skin, a lit candle, tarot-like painted tiles. Landscape 3:2.` |
| `ev-scroll` | Rumeurs, dettes, lettrés, histoire | `Still life: wax tablets, a stylus, rolled papyrus scrolls and a few coins next to an oil lamp. Landscape 3:2.` |
| `ev-spear` | Forgeron, tatoueur, armes | `Still life: a spear, a gladius and a whetstone on a workbench, sparks from a forge in the background. Landscape 3:2.` |

## Pour moi (intégration technique)

`python3 tools/images.py` convertit `assets/raw/*` en `assets/<nom>.webp` (1600 px max,
900 px pour les vignettes). `npm run build` embarque ensuite chaque image dans
`dist/index.html` sous la classe `.p-<nom>`.
