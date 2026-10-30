# Prompt : recréer Ludus Magnus

Copie tout ce qui se trouve sous la ligne. Si l'IA n'arrive pas à tout produire d'un coup,
demande-lui de procéder par étapes (voir « Ordre de construction » à la fin).

---

Crée un jeu web complet en français, **Ludus Magnus**, en un seul fichier HTML (HTML, CSS et JavaScript, sans bibliothèque ni image externe), pensé d'abord pour le téléphone (largeur 390 px, colonne de 560 px maximum sur ordinateur, zones tactiles d'au moins 44 px). La partie se sauvegarde automatiquement dans le navigateur (localStorage).

## Le concept

Le joueur est un esclave jeté dans un ludus (école de gladiateurs) de la Rome antique. Il s'entraîne, combat dans l'arène, gagne de la gloire et des sesterces, s'équipe, et gravit 11 rangs jusqu'à gagner sa liberté. Un rival personnel l'attend à chaque marche. Ton : sombre, épique, avec de l'humour sec. Tous les textes sont en français soigné, en tutoiement.

## Création du personnage

- Nom (bouton « Au hasard »), homme ou femme, 4 teints de peau, 3 coiffures (courts, longs, rasés), 4 couleurs de cheveux.
- Origine au choix, chacune avec un petit texte d'histoire :
  - **Captif de guerre** : +2 Force
  - **Débiteur ruiné** : +2 Agilité, +15 % de sesterces
  - **Forçat des carrières** : +2 Endurance
- Caractéristiques de départ : Force 3, Agilité 3, Endurance 3.
- Accroche : « Tu es enchaîné. Tu ne le resteras pas. »
- Héritage : chaque gladiateur affranchi donne +1 à toutes les caractéristiques de départ du suivant (jusqu'à +3).

## Le temps

Le temps de jeu s'écoule 60 fois plus vite que le temps réel et continue quand le jeu est fermé : au retour, on calcule ce qui s'est passé (vie récupérée, occupation terminée).

## Le ludus (écran principal)

Le joueur ne peut avoir qu'une occupation à la fois :

| Occupation | Durée de jeu | Effet |
|---|---|---|
| Entraînement (Force, Agilité ou Endurance) | 1 h 30 | progression dans la caractéristique choisie, un peu d'expérience |
| Travail | 1 h | des sesterces |
| Fouille de la cellule | 30 min | un objet trouvé, revendu |

- Les durées s'allongent de 30 % par rang.
- On peut payer le surveillant pour finir un entraînement tout de suite.
- La vie remonte seule avec le temps. Le médecin rend 50 % de la vie contre des sesterces.
- On peut améliorer sa cellule, 3 niveaux par élément :
  - **Paillasse** : la vie revient plus vite.
  - **Foyer et râtelier** : les entraînements sont plus courts.
  - **Cachette** : +15 % de sesterces par niveau.
- Une **offrande quotidienne** à ouvrir (coffre, jusqu'à 3 en réserve).
- Des **ordres du jour** : 3 missions racontées par les personnages du ludus (le lanista Cassius Rufus, le maître d'armes…), plus un défi, renouvelés chaque jour.
- Un **objectif guidé** pour les débutants, avec 8 étapes récompensées : s'entraîner, faire un sparring, gagner un combat, s'équiper, atteindre le niveau 3…
- Un **journal** des derniers événements.

## Les imprévus et l'histoire

- Toutes les 2 à 5 heures de jeu, un **imprévu** survient au ludus, avec 2 ou 3 choix et des conséquences : gagner ou perdre de l'or, de la vie, de la progression, ou un objet. Exemples : le marchand de potions, les dés des gardes, le guérisseur grec, le voleur à la tire, le tatoueur gaulois, la diseuse de bonne aventure, le prêteur sur gage (une dette qui revient plus tard), parier sur soi-même, le tonneau de vin. Il en faut beaucoup, au moins une quarantaine, avec une illustration ou une icône par famille.
- Une **histoire suivie** se débloque avec la progression. Un voisin ou une voisine de cellule devient un compagnon : partager sa gamelle, le sauver, le perdre… Les choix ont des conséquences et mènent à un épilogue lors de l'affranchissement.

## Les rangs et la gloire

Les 11 rangs, avec la gloire à atteindre pour défier le rival :

| Rang | Gloire |
|---|---|
| Esclave | 80 |
| Recrue | 380 |
| Gladiateur / Gladiatrice | 950 |
| Vétéran(e) | 1 650 |
| Quartus Palus | 2 450 |
| Tertius Palus | 3 400 |
| Secundus Palus | 4 500 |
| Champion(ne) | 5 800 |
| Héros / Héroïne de la plèbe | 7 300 |
| Légende vivante | 9 100 |
| Primus Palus | 11 100 |

- Pour monter de rang, il faut la gloire **et** une cote suffisante, puis battre son **rival** en duel.
- Chaque rang a sa réplique de défi et sa réplique de défaite du rival. Exemple, rang 1 : « Tu portes encore les chaînes et tu rêves d'arène ? Viens, que je te montre ce qui t'attend. »
- Battre le rival au dernier rang affranchit le gladiateur : fin de partie, épilogue, et un nouveau gladiateur peut commencer avec l'héritage.
- Une **pyramide des rangs** montre la progression.
- Les **niveaux** viennent de l'expérience. Chaque niveau donne un **talent** à choisir parmi 3, jusqu'au niveau 10, puis un niveau sur deux. Chaque niveau pair donne aussi +1 à une caractéristique.

## L'arène

- Chaque jour, 3 adversaires sont proposés : un plus faible, un à ta mesure, un plus fort.
- Chaque adversaire a :
  - un nom (« Delia le Fer », « Sabina la Numide »…) et un type : Mirmillon, Thraex, Rétiaire, Secutor, Provocator ou Hoplomaque ;
  - une cote façon classement Elo, de départ 900 ;
  - un trait de comportement : Prudent (se couvre souvent), Furieux (ne se couvre jamais, frappe fort), Rusé (cache ses intentions un tour sur trois), Opportuniste (frappe fort quand tu te couvres) ;
  - ses chances de victoire estimées par simulation.
- Il existe environ 60 gladiateurs fantômes répartis sur tous les rangs. Ils progressent eux aussi avec le temps.
- **Sparring** avec le maître d'armes : aucun risque, utile au début.
- Battre plusieurs fois le même adversaire rapporte de moins en moins (fatigue). Un adversaire combattu n'est plus disponible pendant 6 heures.
- **Contrats** sur certains combats :
  - **Butin ciblé** : une pièce d'une panoplie précise est garantie en cas de victoire.
  - **Pari** : on mise, et on touche le triple si on gagne.
  - **Prime de gloire** : +60 % de gloire en cas de victoire.
- **Conditions d'arène**, certains jours :
  - Arène en flammes : −2 vie par tour pour chacun.
  - Combat dans la fumée : on ne voit plus l'intention adverse.
  - Foule en délire : la faveur monte deux fois plus vite.
  - Tempête de sable : −12 % de chances de toucher pour tout le monde.
  - Sable lourd : 4 points d'action maximum.
- **Ennemis jurés** : un adversaire qui t'a battu revient avec une réplique (« Tu te souviens de moi ? Moi, oui. ») et rapporte +50 % s'il est vaincu.
- **Jeux du soir** : un combat spécial par jour sous une condition d'arène, mieux payé, avec un butin garanti.
- **Tournois** : accessibles après 10 victoires, tous les 2 jours, contre un droit d'entrée. Trois tours : quarts, demie, finale.
- **Clans** à rejoindre dès le rang 1 (+10 % de bonus) : les Lions de Capoue, la Garde de Pompéi, les Corbeaux de Ravenne, les Mirmillons d'Ostie. Un classement des joueurs et des clans est affiché.

## Le combat (au tour par tour, plein écran)

- Le joueur dispose de **points d'action** : 3 au départ, 6 au maximum.
- Chaque tour, l'**intention de l'adversaire** est annoncée : frapper, coup puissant, se couvrir ou boire une potion.
- Les actions :

| Action | Coût | Effet |
|---|---|---|
| Frapper | 1 PA | dégâts normaux |
| Coup puissant | 3 PA | dégâts × 2,2, un peu moins précis |
| Se couvrir | 0 PA | rend 2 PA et bloque le coup adverse |
| Panache | 2 PA | dégâts × 1,2, fait monter la faveur de la foule |

- L'ordre d'action dépend de l'Agilité. Les dégâts dépendent de la Force et de l'arme. L'armure absorbe une partie des dégâts et a sa propre jauge, qui s'use. Les coups peuvent rater, être critiques ou être esquivés.
- **Élan** : 3 touches d'affilée débloquent une attaque spéciale, propre à l'école du joueur.
- **Faveur de la foule** (0 à 100) : elle monte avec le spectacle (panache, critiques). En cas de défaite, une faveur élevée augmente les chances que la foule réclame ta grâce. En cas de victoire, l'ovation rend de la vie.
- **Potions** : jusqu'à 3 à la ceinture, utilisables en combat. Elles soignent (25 %, 45 % ou 70 % de la vie) ou donnent un bonus pendant 4 tours (Élixir de rage : +35 % de dégâts ; Huile de vif-argent : +20 % d'esquive). Les adversaires en boivent aussi.
- **Combat automatique** (« Laisser faire ») et vitesse ×1 / ×2.
- **Tactiques** réglables pour le combat automatique : règles de priorité comme « boire une potion sous X % de vie », « se couvrir face aux coups puissants », « panache quand il se couvre ».
- **Victoire** : gloire, sesterces, expérience, cote, parfois du butin.
- **Défaite** : grâce de la foule possible ; sinon on perd 20 % de son or et un peu de gloire, et on retombe à 1 de vie.
- **Mise en scène** : chiffres de dégâts qui s'envolent, étincelles, gouttes de sang, secousses de l'écran, bandeaux « CRITIQUE ! », foule animée selon la faveur, blessures visibles sur les combattants quand leur vie baisse, sons.

## Les écoles de combat

À choisir une fois la progression avancée, chacune avec son histoire et son maître.

| École | Bonus | Attaque d'élan |
|---|---|---|
| Thrace (vif et précis) | +8 % de critiques | **Estocade** : critique garanti si elle touche |
| Mirmillon (solide comme un mur) | +20 % d'armure, +6 de vie | **Choc de bouclier** : l'adversaire perd son prochain tour |
| Rétiaire (insaisissable) | +6 % d'esquive, +1 PA au départ | **Coup de filet** : l'adversaire touche bien moins pendant 2 tours |

Les écoles s'opposent entre elles : certaines prennent l'avantage sur d'autres, et le maître donne des conseils selon l'adversaire.

## Les talents

Ils se répartissent en six familles, et chaque talent peut être pris 1 à 3 fois :

- **Brute** : +3 Force, +10 % de dégâts, coups puissants renforcés, rage sous la moitié de la vie, critiques, lame empoisonnée, soif de sang…
- **Défense** : +3 Endurance, +14 de vie, −8 % de dégâts reçus, survivre une fois à un coup mortel, riposte quand on se couvre, régénération…
- **Vivacité** : +3 Agilité, toujours frapper en premier, +8 % de précision, +1 PA au départ…
- **Foule** : faveur de départ, faveur gagnée +50 %, ovation renforcée…
- **Fortune** : +30 % de sesterces, boutique −10 %, meilleure fouille, meilleur butin…
- **Croissance** : +15 % d'expérience, +15 % de gloire, entraînements plus courts, soins moins chers…

## L'équipement

- **7 emplacements** : arme, casque, plastron, bras, jambes, bouclier, amulette.
- **Armes** : 11 paliers, du Bâton d'entraînement à la Lame du Primus. Il existe 6 types d'arme :

| Type | Avantage | Inconvénient |
|---|---|---|
| Gladius | équilibré | aucun |
| Sica | +10 % de critiques | dégâts de base −8 % |
| Trident | saignement | dégâts de base −8 % |
| Hache | ignore 60 % de l'armure adverse | −4 % de chances de toucher |
| Masse | le coup puissant étourdit | −3 % de chances de toucher |
| Spatha | dégâts de base +12 % | coups puissants moins précis |

- **Rareté** : Commun, Rare, Épique, Légendaire. Les objets peuvent porter des effets : saignement, soif de sang, riposte, critiques, esquive, fortune, faveur.
- **Panoplies** : Cuir de recrue, Bronze de légionnaire, Panoplie du Thrace, du Mirmillon, du Rétiaire, du Champion, Panoplie impériale. Porter 2, 4 ou 5 pièces d'une même panoplie donne des bonus croissants.
- **Comparaison** : chaque objet affiche s'il améliore ou non ce qui est porté. Boutons « Équiper le meilleur » et « Vendre le bric-à-brac ».
- **Forge** : améliorer un objet, plusieurs niveaux.
- **Boutique** : armes, pièces de panoplie, potions. Inventaire limité.
- **Visuel** : l'équipement porté se voit sur le personnage (casque, plastron, bras, jambes, bouclier, arme), et une cape apparaît à partir du rang 3.

## L'interface

- **En haut**, un bandeau fixe avec : médaillon portrait, nom, rang, niveau, cote, sesterces, bouton son, jauges de vie et de gloire.
- **Au milieu**, une scène illustrée : la cour du ludus la nuit (le héros y est animé selon son occupation), ou l'arène avec la foule et les torches.
- **En dessous**, un panneau de cartes qui défile.
- **En bas**, une barre à 5 onglets : Ludus, Arène, Rang, Boutique, Perso, avec des pastilles quand une action attend.
- **Direction artistique** : vase grec à figures rouges, la nuit. Terracotta sur fond noir, bronze, or et rouge sang. Polices Cinzel pour les titres et Alegreya Sans pour le texte. Interface « cadre de pierre », boutons en relief, animations sobres, respect de « réduire les animations ».
- **Sons** générés par le navigateur (Web Audio), sans fichier audio : coups, foule, pièces, butin selon la rareté.

## Équilibrage visé

- Une montée en puissance régulière : le premier rang en une dizaine de minutes, puis des sessions courtes sur téléphone.
- L'affranchissement en environ 8 à 12 heures de jeu actif, pas plus.
- Le duel contre le rival est le moment fort de chaque rang : difficile, il demande parfois plusieurs tentatives.
- Les systèmes se débloquent au fil des rangs (forge, tournois, écoles…) plutôt que tous au début, pour ne pas noyer le joueur.

## Ordre de construction

Si tout ne tient pas en une réponse, procède dans cet ordre, en livrant à chaque fois un fichier complet qui fonctionne :

1. Création du personnage, ludus (occupations, temps, sauvegarde), combat au tour par tour, arène simple, rangs et rival.
2. Équipement, boutique, talents, potions.
3. Imprévus, missions, histoire et compagnon.
4. Écoles, panoplies, forge, tactiques, contrats, tournois, jeux du soir, clans.
5. Finitions visuelles et sonores.
