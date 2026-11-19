# FACES — dévoilement et défi

Tous les horaires sont ceux d’Abidjan / GMT.

- 20 novembre au 16 décembre 2026 à 18 h : une nouvelle pièce au total par jour. Alternance Leila, Laury, Isis, neuf pièces contiguës par visage. Les pièces visibles sont placées dans le désordre.
- 17 décembre à 18 h : ouverture du puzzle interactif. Un toucher sur une pièce, puis une autre, échange leurs places. Les trois grilles sont validées ensemble.
- 18 décembre à 18 h : clôture du défi et reveal public des trois portraits en ordre, que le lot ait été remporté ou non.
- 19 décembre à 18 h : drop de la collection en ligne.

## Le T-shirt

Un T-shirt FACES est réservé à la première personne dont les trois grilles correctes sont acceptées par le serveur pendant le défi avec une adresse email vérifiée. L’acceptation des règles est obligatoire. Une personne peut essayer plusieurs fois ; la validation est limitée à dix essais par minute et par email, avec un plafond supplémentaire par IP. Il n’y a pas de confirmation partielle par pièce ou par grille.

L’email est vérifié grâce à un code demandé par le visiteur, valable dix minutes et utilisable une seule fois. Une vérification ne crée aucun abonnement. Les codes sont envoyés via les clés Resend déjà configurées sur le Worker ; aucun envoi réel n’est nécessaire au déploiement.

Le gagnant et sa référence restent dans le Durable Object de la campagne. Dans **/orders**, se connecter avec le compte d’administration habituel puis cliquer sur **Vérifier le gagnant**. Seuls l’email, la date de validation et la référence sont affichés. Contacter personnellement le gagnant pour convenir de la taille et de la remise du T-shirt. Le code ne déclenche pas cet email à votre place.

## Les emails de campagne

Cinq brouillons sont disponibles dans apercus.html : annonce le 20 novembre, point d’étape le 5 décembre, ouverture du défi le 17, reveal le 18 et drop le 19. Ils doivent être envoyés depuis Resend au segment newsletter. Le brouillon d’ouverture de collection reste conditionné à la publication effective des produits Faces.

Le flux newsletter-feed.json reste vide : aucun envoi de campagne n’a été déclenché ou programmé.

## Exploitation

Le calendrier est appliqué à chaque requête côté serveur, sans tâche quotidienne ni cron supplémentaire. Une page ouverte se rafraîchit toutes les quinze secondes et lors de son retour au premier plan.

Les images futures et la table de solution ne sont pas incluses dans les fichiers du navigateur. Les morceaux sont servis par /api/faces/tiles/:id.webp après leur date. Les identifiants publics sont dérivés avec un secret du serveur, séparé par contexte de campagne. Le secret utilise FACES_PUZZLE_SECRET lorsqu’il est configuré, sinon ADMIN_JWT_SECRET ou ADMIN_PASSWORD déjà configuré. Conserver ce secret stable pendant la campagne : une rotation changerait les identifiants et les parties sauvegardées seraient réinitialisées.

L’instance Durable Object faces-campaign-2026 est distincte des commandes et réutilise le binding OrdersStore existant ; aucune migration de commandes n’est nécessaire. La réservation du gagnant est transactionnelle. Elle évite deux attributions concurrentes, sans prétendre empêcher toute forme de bot.

Les emails, codes et sessions sont supprimés automatiquement le 19 mars 2027 par une alarme, en conservant seulement le statut anonyme du lot. La suppression est limitée aux clés de la campagne et ne touche pas les commandes.

## Sources confirmées

Les six photos fournies sont attribuées explicitement par l’utilisateur : 1 Leila ; 2–3 Isis ; 4–5 Ada ; 6 Laury. Ada reste dans la collection et n’est pas ajoutée au teasing de 27 jours. Les cadrages et copies des sources sont conservés dans le dossier de préparation local ; seuls les 27 morceaux techniques du jeu sont embarqués côté serveur.

Pour régénérer ces morceaux : `node scripts/prepare-faces-puzzle-assets.mjs <portrait-NB-Leila.png> <portrait-Laury.png> <portrait-Isis.png>`, depuis la racine du dépôt. Les cadrages par défaut correspondent aux sources conservées. Ne pas placer les portraits complets dans public/ et ne pas importer api/worker/faces-assets.js depuis le client.
