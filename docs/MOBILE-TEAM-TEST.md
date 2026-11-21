# Aperçu mobile pour les testeurs NewGbonhi

La version de test se construit avec `npm run mobile:build:preview` dans `dist-mobile-preview/`. Elle se publie comme site statique HTTPS et fonctionne sans ordinateur personnel allumé ni compilation GitHub Actions.

Elle utilise les mêmes pages, le même catalogue et la même navigation mobile que l’application préparée. L’icône NG est disponible pour le raccourci Safari. Elle permet de tester l’affichage, les collections, les choix de produit et le panier. Les plugins natifs et l’installation iOS restent à vérifier dans l’application compilée.

Le bandeau « Version de test » explique les essais et le format des retours. Les requêtes qui écrivent dans l’API réelle (commandes, paiements, inscriptions et administration) reçoivent une réponse locale de mode test avant tout envoi. Les lectures restent disponibles. Ce mécanisme évite les envois involontaires dans cet aperçu ; l’API réelle conserve ses propres contrôles.

## Message à transmettre aux testeurs

Ouvrez le lien de test sur votre téléphone. Essayez les pages, les collections, les tailles, les couleurs et le panier. Les commandes, paiements et inscriptions sont désactivés sur cette version.

Pour chaque retour, indiquez :
- le modèle de téléphone et le navigateur ;
- la page concernée ;
- l’action essayée et le résultat attendu ;
- le résultat obtenu ;
- une capture si possible.

Sur iPhone, vous pouvez ajouter le lien depuis Safari avec Partager > Sur l’écran d’accueil.

## Hébergement

Publier la branche contenant ces changements avec la commande `npm ci && npm run mobile:build:preview`, le dossier `dist-mobile-preview`, Node 22 et `SKIP_IMAGE_OPTIMIZER=true`. Définir `SKIP_INSTALL_DEPS=true` sur Render puisque la commande exécute déjà `npm ci`. Ne pas attendre les vérifications GitHub pour ce déploiement : le but est de rendre l’aperçu disponible pendant le traitement du blocage GitHub Actions.
