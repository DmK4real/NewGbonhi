# Vérification mobile du showroom

Contrôles effectués sur le build de production local avec Chromium headless : 320, 390, 600 et 768 px, hauteur 844 px, français, navigation tactile sur les petits écrans.

- Affichage 3D et catalogue, absence de débordement horizontal.
- Ouverture d’une pièce et affichage des miniatures.
- Choix de la taille M, ajout au panier avec couleur White et prix 13 000 FCFA.
- Passage au formulaire de commande : sept champs obligatoires présents, aucune commande envoyée.
- Aucune erreur JavaScript pendant ces parcours.

Correction : fiche mobile portée à 82dvh, images et miniatures compactées pour afficher les tailles dès l’ouverture en 320/390/600 px. La fiche conserve son défilement sur tablette.

## Mesure indicative du chargement

Même build servi localement, écran 390 × 844, débit simulé 10 Mb/s, latence 80 ms, CPU ralenti ×4 et WebGL logiciel :

| Mesure | Avant limitation des textures | Après |
| --- | ---: | ---: |
| Fin du chargement des vêtements | 10,7 s | 6,2 s |
| Première requête décorative | 13,1 s | 7,9 s |

Les textures des vêtements sont traitées avec un côté maximal de 768 px sur téléphone et 1536 px sur grand écran, sans agrandir les sources plus petites. Le décor reste chargé après les vêtements. Ces mesures uniques en environnement simulé ne remplacent pas des mesures répétées sur appareils réels ou en production.
