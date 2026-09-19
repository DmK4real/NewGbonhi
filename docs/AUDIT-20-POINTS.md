# Audit des 20 points — NewGbonhi

Date : 19 septembre 2026. Périmètre : copie locale du projet, frontend Vue/Vite, API Node et Worker, configuration Cloudflare Pages. Les changements ne sont pas déployés en production.

« Corrigé » signifie implémenté et vérifié dans le code ou les tests indiqués ; cela ne remplace pas une vérification de l’hébergement et du rendu dans un navigateur.

| # | Point | Résultat et action |
|---|---|---|
| 1 | Page RGPD | Page `/confidentialite` créée : données des commandes, Lab, newsletter, destinataires, stockage local, statistiques et droits. Gestion par Dominik Kouakou, Wadja Bright et Yohann Munier indiquée à la suite de la précision de Dominik. À finaliser avec le statut de l’activité, les coordonnées professionnelles, les durées effectivement appliquées, les éventuels transferts internationaux et leurs garanties. Cette page seule ne certifie pas la conformité RGPD. |
| 2 | Page CGU | Page `/cgu` créée et liée au pied de page. Objet, usages, créations, commandes, services externes et contact. Les trois personnes qui gèrent NewGbonhi sont nommées ; le statut de l’activité reste à préciser. Les conditions commerciales détaillées (CGV, retours, garanties, etc.) restent à définir avec l’exploitant ; elles ne sont pas inventées ici. |
| 3 | API hors frontend | API déjà séparée. Retrait du mot de passe Studio du JavaScript public et vérification côté API. Suppression du repli `VITE_ADMIN_PASSWORD`, suppression de l’empreinte admin codée en dur ; usage du secret backend configuré. Vite bloque les noms de variables exposant manifestement des secrets. La déclaration de paiement exige maintenant le jeton de la commande sur les deux backends. Le verrou Studio reste un verrou d’interface : les fichiers statiques distribués sont publics. |
| 4 | HTTPS forcé | Redirection HTTP du domaine principal vers HTTPS ajoutée au middleware Cloudflare, redirection www conservée et HSTS ajouté. Tests des redirections réussis. Vérification du certificat et des réglages de l’hébergement réel à effectuer après déploiement ; pour GitHub Pages, activer Enforce HTTPS. |
| 5 | Bannière cookies | Préférences ajoutées au niveau global, stockage du choix pendant six mois, refus et acceptation de même présentation lorsqu’un outil est configuré, lien permanent de gestion en pied de page. Pas de script analytics sans configuration et accord. Les stockages fonctionnels sont expliqués. |
| 6 | Meta title | Titres et descriptions par route déjà présents ; nouvelles pages légales et 404 intégrées. Titres des produits et noindex des espaces privés conservés. Les titres spécifiques des routes sont appliqués côté client ; le HTML initial de cette SPA reste commun aux routes. |
| 7 | Image réseaux | Carte de marque JPEG 1200 × 630 créée, environ 39 Ko, URL absolue Open Graph et Twitter, description alternative et carte Twitter grand format. Générateur reproductible `npm run images:social`. L’URL publique sera disponible après déploiement. |
| 8 | Favicon | ICO, PNG 32 × 32 et Apple touch icon déjà présents, déclarations et fichiers vérifiés. |
| 9 | Sitemap + robots | Génération déjà présente et vérifiée. CGU et confidentialité ajoutées ; Studio retiré du sitemap car noindex. 18 routes indexables. Les pages de commande et d’administration ne figurent pas dans le sitemap. |
| 10 | Textes images | Les 46 balises image des templates possèdent un attribut alt statique ou dynamique. Les illustrations décoratives conservent un alt vide. La pertinence éditoriale de chaque texte dynamique et le rendu nécessitent une revue visuelle complémentaire. |
| 11 | Compression | WebP et variantes 400/800 pixels générés pour les images à la racine de `src/assets`, catalogue et 29 références statiques orientés vers les fichiers compressés disponibles. Environ 12,07 Mo d’originaux pour 1,75 Mo de WebP pleine taille, soit 85,5 % de réduction sur ce groupe (hors variantes). L’optimiseur du build compresse aussi les autres images ; les originaux sont conservés. |
| 12 | Vitesse | Chargement différé des routes et de nombreuses images déjà présent, priorité de l’image principale conservée, davantage de WebP servis. Build réussi ; fichier JavaScript d’entrée environ 95,26 Ko, 34,57 Ko gzip (hors autres chunks). Pas de score Lighthouse ni de mesure LCP/INP/CLS réalisée : aucun navigateur pilotable disponible. |
| 13 | Contraste | Couleurs explicites sur les nouvelles pages et la bannière, focus clavier visible, labels principaux ajustés en mode sombre et liens de confidentialité soulignés. Ratios calculés : texte légal 17,03:1, liens légaux 8,22:1, labels ajustés sur fond sombre 7,22:1. Les superpositions sur photos et tous les états interactifs n’ont pas été mesurés dans un navigateur. |
| 14 | Responsive | Breakpoints existants examinés ; nouvelles pages fluides, bannière limitée à la largeur de l’écran et à 80dvh avec défilement, champs bornés en largeur et taille mobile de 16 px. Validation visuelle à 320/375/768/1440 px et tests tactiles restant à réaliser. |
| 15 | 404 custom | Route Vue de repli et page dédiée créées, retour vers la boutique et noindex. Le middleware Pages retourne aussi HTTP 404 pour les routes et produits inconnus, testé. Le serveur de développement Vite sert normalement la SPA avec HTTP 200 : le statut de production dépend du middleware. |
| 16 | Liens cassés | 51 références internes statiques et les fichiers référencés par `new URL` contrôlés, contact du footer aligné sur la configuration du checkout, liens légaux ajoutés. Le script contrôle aussi les routes du sitemap. Les liens dynamiques et les services externes (réseaux sociaux/paiement) ne sont pas certifiés par ce contrôle statique. |
| 17 | Validation formulaires | Validations frontend existantes conservées, longueurs email limitées, mentions de confidentialité ajoutées près des formulaires. Email/téléphone et quantités/prix invalides rejetés côté serveur. Tests de rejets réussis. Les références, tailles du catalogue, prix catalogue/Studio et frais de livraison sont aussi validés côté serveur ; le barème de livraison est partagé entre frontend et API. |
| 18 | Anti-spam | Honeypots newsletter/Lab déjà présents. Limitation ajoutée aux connexions, commandes, newsletter, candidatures et actions de paiement : 10 tentatives/minute/client/groupe de route. Tests de réponse 429 réussis. Compteurs bornés, temporaires et en mémoire ; réinitialisation lors d’un redémarrage, pas une protection distribuée ou un CAPTCHA. |
| 19 | Analytics | Intégration Plausible préparée, désactivée tant que `VITE_PLAUSIBLE_SCRIPT_URL` n’est pas renseigné. Chargement après accord seulement, arrêt des événements lors du retrait, navigation privée exclue, URL produit agrégée et paramètres non transmis. Tests avec SDK simulé réussis. URL du script propre au compte et vérification de réception réelle nécessaires pour activer ce point. Aucun compte payant créé. |
| 20 | Un seul CTA | Le hero d’accueil conserve un seul bouton principal « Voir les articles » ; le bouton concurrent de détails est retiré. Navigation, actions panier et actions propres aux autres sections conservées. |

## Vérifications exécutées

- `npm test` : 45 tests réussis, 9 fichiers. Nouveaux tests sur le consentement et son expiration, chargement analytics, exclusion des pages privées, retrait, limitation des requêtes, connexion admin/Studio, rejet des prix/frais falsifiés et acceptation d’une commande valide, confidentialité de la déclaration de paiement, redirections HTTPS et statuts 404.
- `npm run audit:site` : réussi, 21 composants/pages Vue, 46 balises image, 51 références internes statiques, fichiers SEO et routes sitemap.
- `npm run build` : réussi, compilation finale en 14,53 secondes. Le plugin d’optimisation indique environ 45 % de réduction sur les images qu’il traite ; ce chiffre n’est pas une mesure de vitesse de navigation.
- `node --check api/server.js` et `node --check api/worker/index.js` : réussis.
- Serveur local `http://127.0.0.1:4000/` : réponse HTTP 200 vérifiée.
- Contrôle visuel automatisé impossible : le fournisseur de navigateur intégré est indisponible et aucun autre navigateur n’est connecté. Aucun score d’accessibilité, de performance ou de responsive n’est annoncé.

## Informations et configuration restantes

1. Gestion confirmée par Dominik : Dominik Kouakou, Wadja Bright et Yohann Munier. Leurs noms figurent dans les deux pages légales. Restent à préciser le statut de l’activité, l’adresse professionnelle et l’immatriculation si applicable. Préciser aussi les règles réelles de conservation, les prestataires/contrats et les conditions de vente avant publication définitive des textes légaux.
2. URL du script fournie par le compte Plausible (ou choix d’un autre outil). Sans configuration, aucune statistique n’est envoyée.
3. Vérifier/configurer les secrets serveur `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET` et `STUDIO_PASSWORD` avant déploiement. Ne pas les préfixer avec `VITE_`. Aucun nouveau mot de passe n’a été choisi ou publié.
4. Déployer frontend et API ensemble pour bénéficier des protections ; confirmer HTTPS et les statuts sur le domaine réel. Le workflow Worker surveille désormais `api/**`, pour inclure le module de validation partagé.
5. Revue navigateur sur mobile et ordinateur, parcours d’achat et services externes, puis mesure de performance sur le site déployé. Les emails/newsletter/Lab et paiements dépendent aussi de leurs secrets et de leurs services configurés ; aucun envoi ni paiement réel effectué pendant cet audit.

## Références utilisées

- CNIL, information des personnes : https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence
- CNIL, gestion et retrait du consentement : https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/comment-mettre-mon-site-web-en-conformite
- Plausible, script propre au site : https://plausible.io/docs/plausible-script
- Plausible, pageviews manuelles et filtrage : https://plausible.io/docs/script-extensions
- Plausible, réduction des données dans les URL : https://plausible.io/docs/custom-locations

Ces références servent à orienter l’implémentation. Elles ne permettent pas, à elles seules, d’attester la conformité légale de l’activité en Côte d’Ivoire ou dans les autres pays concernés.
