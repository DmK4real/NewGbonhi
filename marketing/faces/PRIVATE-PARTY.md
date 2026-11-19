# FACES — sélection des 30 invités dans Resend

La soirée a lieu le **19 décembre 2026 de 17 h à minuit**, heure d'Abidjan. Le **drop en ligne reste à 18 h**. La soirée accueille 30 invités choisis manuellement parmi les abonnés, y compris ceux déjà inscrits.

## Ce qui se passe à l'inscription

Le formulaire continue d'inscrire uniquement à la newsletter **NewGbonhi Newsletter**. Il ne crée pas de place à la soirée et n'envoie pas d'invitation. Le mail de bienvenue confirme explicitement l'inscription à la newsletter et précise que l'invitation aux événements privés est séparée.

Les annonces de la collection peuvent partir à toute la newsletter. L'affiche d'invitation et le petit mot sont réservés au groupe de personnes retenues. L'affiche complète et les coordonnées de la soirée ne sont pas publiées sur la page Faces.

## Préparer le groupe privé

Dans Resend, créer un segment nommé **FACES — Private Party — Invités**. Ce groupe n'a pas été créé depuis cette session : aucun accès au compte Resend n'est connecté ici.

1. Ouvrir Contacts et consulter le segment **NewGbonhi Newsletter**.
2. Choisir personnellement les abonnés à inviter, puis les ajouter au segment privé, sans les retirer de la newsletter.
3. Garder au maximum **30 personnes retenues**. La limite est gérée par votre sélection : Resend n'impose pas automatiquement ce plafond au segment.
4. Ne pas réabonner les contacts désinscrits. Les membres non retenus restent abonnés et continuent de recevoir les nouvelles de la collection.

Les segments sont des groupes internes ; un même contact peut appartenir à la newsletter et au groupe privé. Documentation officielle : https://resend.com/docs/dashboard/contacts/manage-segments

## Préparer et envoyer l'invitation

Les versions française et anglaise de l'invitation et du petit mot sont préparées localement dans le dossier `output/FACES-PRIVATE-PARTY-19-DECEMBRE-2026` du workspace de création NewGbonhi Design. L'aperçu est un fichier local, pas une invitation publique ni une confirmation de place.

1. Dans **Broadcasts**, créer un brouillon avec l'expéditeur vérifié **NewGbonhi <news@newgbonhi.com>**.
2. Choisir **uniquement FACES — Private Party — Invités** comme destinataires. Ne pas sélectionner la newsletter générale en plus.
3. Copier le sujet et le petit mot français dans l'éditeur, puis importer le visuel français fourni. La version anglaise est disponible si nécessaire ; ne pas envoyer les deux versions aux mêmes personnes par erreur.
4. Le bouton de confirmation ouvre un email vers **newgbonhifamily@gmail.com**, l'adresse de contact existante du site. Configurer cette même adresse pour les réponses si l'éditeur le permet.
5. Conserver le pied de page de désinscription de Resend. Contrôler le groupe et le nombre réel de destinataires avant l'envoi. Prévisualiser, puis envoyer un test à votre propre adresse avant la campagne.
6. Envoyer l'invitation après validation de votre sélection. Aucun envoi n'est programmé par le site ni par les fichiers préparés.

Les images du dossier local sont prêtes à importer dans l'éditeur. Si vous utilisez un bloc HTML au lieu de l'éditeur visuel, remplacer l'image locale de l'aperçu par l'image importée dans Resend. Ne pas coller une URL `file://` ou un chemin local dans un mail envoyé.

Documentation officielle des campagnes : https://resend.com/docs/dashboard/broadcasts/introduction

## Suivre les confirmations

Les invités confirment leur présence par mail. Vous pouvez les ajouter manuellement à un second segment **FACES — Private Party — Confirmés**, puis leur envoyer les dernières informations pratiques. L'invitation est personnelle et valable pour une personne.

En cas de désistement, choisissez vous-mêmes une autre personne et adressez-lui l'invitation. N'envoyez pas à nouveau la campagne aux 30 premiers destinataires pour inviter un seul remplaçant. Aucune invitation ni confirmation automatique n'est liée à une nouvelle inscription.
