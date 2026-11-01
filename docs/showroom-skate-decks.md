# Decks NG du showroom

Asset : `src/assets/showroom/ng-skate-decks.webp`.
Outil : image_gen intégré. Les deux photos fournies par l’utilisateur servent de références stylistiques.
Les trois colonnes de l’atlas sont appliquées séparément à trois meshes de decks, avec épaisseur, nez et tail relevés, chants bois et fixations. Le bouton « Le mur skate » cadre ce mur.

## Prompt

Use case: stylized-concept. Asset: one texture atlas for THREE original New Gbonhi skateboard deck graphics. User's two latest attached photos are style references only for handpainted skateboard graphics. Create a flat square 1536x1536 image, divided into EXACTLY THREE equal width vertical rectangular columns, each column filled edge to edge with its own painted artwork. No visible boards, deck outlines, rounded edges, perspective, wall, room, shadows, wheels, trucks or photography; these are flat print-ready graphic textures to apply to curved wooden deck meshes. Column 1: charcoal black painted surface, large aggressive ivory handpainted vertical graffiti lettering 'NEW GBONHI', small red NG crown and fine white splatter, raw energetic brush calligraphy. Column 2: warm ivory painted surface, one original bold cartoon face of the NG curly-haired crew mascot with sleepy red heart eyes, black ink contours, small NG tag, small purple accent, scuffed paint and tiny crowns, graphic aesthetic. Column 3: near black painted surface, expressive abstract silver/ivory calligraphic NG monogram sweeping vertically, subtle scarlet spray haze, little 'ABIDJAN' handwritten near the lower end, deliberate elegant negative space. Palette coordinated black ivory red with tiny purple. Paint marker strokes, brush grain, drips, slightly worn handmade finish, striking underground skate aesthetic. All important designs within center 75% width of each column and middle 85% height so rounded deck silhouettes will not crop important features. No borrowed brand names, no watermark.

## Troisième deck — version premium

Asset : `src/assets/showroom/ng-skate-premium.webp`. Édition via image_gen intégré, puis extraction de la troisième colonne pour garder les deux premières textures intactes.

Prompt :

Edit ONLY the RIGHTMOST THIRD of this square three-column skateboard graphic atlas. Preserve the first and second columns exactly unchanged. Replace the entire third column with a more premium, fresh original NEWGBONHI skate graphic: deep clean charcoal black base with very subtle tactile paint grain, a single strong interlocked N G monogram in polished liquid silver chrome, crisp sculptural fluid lettering, legible NG, placed vertically in the central 60% of the column. Small precise red handwritten NEWGBONHI signature beneath the monogram, tiny ivory ABIDJAN / NG. at the bottom. One tiny red crown near the upper end, restrained. Sophisticated underground Abidjan streetwear aesthetic, bold recognizable graphic identity, excellent negative space, deliberate refined composition. No large splatters, no scattered decorative marks, no messy ivory calligraphy, no generic luxury symbols or borrowed brands. It must feel like an exclusive NewGbonhi art deck. Keep image square and exactly three equal vertical columns, flat edge-to-edge print textures with no skateboard outlines, room, perspective, shadows or frames. Important design stays within center 70% width and center 80% height of right third. Only rightmost column changes.

## Détourages et présentoir au sol du showroom

Les volumes des decks, roues, trucks et fixations ont été remplacés par des images à fond transparent. Le mur droit affiche Underground, Renaissance et Lilies. Les deux skates au sol utilisent des photomontages ; ils se tournent vers la caméra comme les sneakers et conservent un angle photographique fixe.

Le présentoir est un objet indépendant posé au sol dans le showroom, décalé vers la zone libre à droite. Les trois planches photographiques accrochées au mur et les deux skates complets au sol restent en place. `src/components/skateDisplay.js` ajoute un socle, un pied métallique et un anneau rotatif portant six visuels détourés. La rotation fonctionne avec les commandes affichées en vue skate et un glissement horizontal directement sur une planche du présentoir. La rotation automatique est activable et n’avance que lorsque le coin skate est affiché ; la préférence de réduction des animations la désactive. Le Lab ne contient plus de présentoir.

### Assets actifs

- `src/assets/skate/deck-underground.webp`
- `src/assets/skate/deck-grillz.webp`
- `src/assets/skate/deck-handstyle.webp`
- `src/assets/skate/deck-renaissance.webp`
- `src/assets/skate/deck-eight-ball.webp`
- `src/assets/skate/deck-lilies.webp`
- `src/assets/skate/complete-wheels.webp`
- `src/assets/skate/complete-inverted.webp`

### Sources et traitement

Les six designs proviennent de l’image « Six Gritty Designer Skateboard Decks(1).png » fournie par l’utilisateur. Le fond est retiré avec image_gen intégré. Les silhouettes sont ensuite exportées en fichiers WebP individuels, sans modifier leurs graphismes. Les deux autres images fournies (« New Gbonhi Skateboard Art Wall.png » et « Ten Gritty Skateboard Decks Display.png ») servent de références d’ensemble.

Les skates complets sont des photomontages personnalisés NG via image_gen à partir de photographies produit CCS, pas des photographies de skates NG physiques existants :
- https://shop.ccs.com/products/ccs-logo-skateboard-complete-black
- https://cdn.shopify.com/s/files/1/0519/1388/3831/products/ccs-logo-skateboard-complete-black1_ed921c17-0667-4506-8922-f2accd16e9ad.jpg?v=1631139270
- https://cdn.shopify.com/s/files/1/0519/1388/3831/files/LogoBlack3.jpg?v=1743714113

### Prompt de détourage des six decks

Precisely extract the SIX skateboard decks from the supplied image into a transparent sprite atlas. Preserve their existing photographic appearance and ALL original designs EXACTLY, with no redesign or changes to lettering, textures, faces, flowers, ball, hardware holes or wooden contours. Remove ONLY the concrete wall and ALL cast shadows around the decks; make the exterior truly transparent, not gray. Keep all SIX decks in the SAME left-to-right order: black NEW GBONHI typography; black photographic face with grillz; ivory graffiti NEW GBONHI; black classical bust collage; ivory 8-ball; black white lilies with red NG. Each deck must be placed vertically centered within its own equal-width column (six equal columns), fully visible from nose to tail, all with equal height, with a small transparent margin around its curved wooden edges. Output a WIDE 3:2 transparent PNG atlas with six evenly spaced decks in a single horizontal row, flat front view as supplied. No new boards, no scene, no floor, no frames or backdrop. This image is for transparent photographic cutouts used directly in a website; do not turn decks into flat rectangular poster textures or CGI renders.

### Prompt des deux skates au sol

Photographic compositing/edit of the REAL skateboard product photographs in references1 and2. Output one transparent PNG atlas, WIDE LANDSCAPE 2:1, split into exactly TWO equal width square cells, each showing a complete REAL skateboard lying horizontally left-to-right, isolated on truly transparent background with empty margins. LEFT CELL: the actual photographed complete skateboard resting normally ON ITS FOUR WHEELS, black textured grip tape visible on top, natural maple rim, real aluminum trucks and off-white urethane wheels. Camera sees side and top from a modest 25 degree elevation, long axis horizontal, full board entirely visible, realistic product photograph not CGI. A small red handwritten NG on grip is sufficient. RIGHT CELL: same real complete skateboard turned UPSIDE DOWN resting on its deck so the metal trucks and four wheels point upward, underside graphics facing camera, matching reference2's upside-down real skateboard orientation, camera 25 degrees above floor. Replace only original CCS underside logo with the existing premium NEWGBONHI graphic from reference3, chrome NG monogram and red handwritten NEWGBONHI on black. Preserve authentic skateboard hardware, realistic shapes and original photograph finish; no modeled wheels or simplified fake forms. NO walls, NO visible floor, no baked ground shadows, no room mockup, no text outside boards. Two cutout photos should face same camera and have matching scale, full widths within own square cell, no overlap.
