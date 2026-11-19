# FACES — page et campagne

Drop confirmé : **19 décembre 2026 à 18 h, heure d'Abidjan (GMT)**.

## Page

- Page : `https://newgbonhi.com/faces`.
- Entrées depuis l'accueil, le menu et le pied de page.
- Le formulaire utilise `/api/newsletter/subscribe` et le segment Resend existant **NewGbonhi Newsletter**. Pas de deuxième liste à importer.
- Le mail de bienvenue existant « TU ES DANS LE GBONHI. » reste en service. Un abonné ayant déjà reçu ce mail n'en reçoit pas une nouvelle copie.
- Les trois fragments sont issus du portrait Faces déjà fourni. Ce teaser ne présente pas les essais du dossier graphique comme des produits déjà disponibles.
- L'échéance est définie dans `src/data/facesDrop.js`, en UTC : `2026-12-19T18:00:00Z`.
- Après l'échéance, la page montre les produits du catalogue portant le tag exact `faces`, si des produits existent. Ajouter les vrais modèles, images, prix, tailles et stocks au catalogue avant le drop. Le temps écoulé seul ne déclenche pas de message « disponible ».
- Le fichier agenda est `public/faces/drop-faces.ics`.

## Emails préparés

Ouvrir `apercus.html` pour voir les quatre brouillons. Les fichiers `emails/*.html` sans suffixe `-apercu` sont les versions destinées à Resend ; les `.txt` sont leurs équivalents texte. Les aperçus locaux utilisent l'image du dossier public.

Les sujets, textes, dates proposées et liens se trouvent dans `campaigns.json`. Pour régénérer les fichiers après une modification :

```sh
node scripts/prepare-faces-emails.mjs
```

Le deuxième mail attend un nouveau visuel de pièce confirmé : ajouter son URL publique au champ `image` de la campagne, puis régénérer. Le quatrième mail annonce une vente ouverte : l'envoyer seulement lorsque les pièces sont effectivement achetables.

**Aucun email n'a été envoyé ou programmé.** Le flux public `public/newsletter-feed.json` reste vide. Les brouillons ne sont pas consommés par l'automatisation.

## Envoyer aux abonnés existants

1. Ouvrir Resend, rubrique **Broadcasts**.
2. Créer un brouillon pour chaque campagne et sélectionner le segment existant **NewGbonhi Newsletter**.
3. Utiliser l'expéditeur vérifié `NewGbonhi <news@newgbonhi.com>` et reprendre le sujet, le texte et le visuel des fichiers préparés. Si l'éditeur permet le HTML, utiliser le fichier de production ; sinon recréer la mise en page dans l'éditeur.
4. Conserver le lien Resend de désinscription `{{{RESEND_UNSUBSCRIBE_URL}}}`. Les personnes désabonnées restent exclues ; ne pas réimporter ou réabonner la liste.
5. Vérifier un aperçu et les liens, puis envoyer un test à une adresse interne avant l'envoi de la campagne. L'image publique sera accessible après le déploiement de la page.
6. Programmer les mails validés avec un fuseau explicite : Abidjan / GMT. La date de l'annonce est proposée au 20 novembre, l'aperçu au 5 décembre et le rappel au 17 décembre. Le mail d'ouverture part après vérification de la vente le 19 décembre à 18 h.

Documentation officielle : https://resend.com/docs/dashboard/broadcasts/introduction

L'automatisation du code actuel utilise un autre chemin : elle lit `public/newsletter-feed.json` toutes les six heures et envoie les entrées actives qui n'ont pas déjà été envoyées. Ne pas activer les mêmes campagnes dans ce flux si elles sont envoyées depuis Broadcasts, pour éviter les doublons.

## Images

Les exports WebP et le visuel de partage sont suivis dans Git. Pour les refaire à partir des fragments existants :

```sh
node scripts/prepare-faces-assets.mjs "CHEMIN/02-CARRES-PNG-750"
```
