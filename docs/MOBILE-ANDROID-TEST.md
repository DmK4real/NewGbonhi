# Essayer NewGbonhi sur Android

La version installable doit d'abord être compilée. Le script de génération place l'APK réussi dans `deliverables/mobile/NewGbonhi-android-test.apk`, accompagné de son empreinte SHA-256 et des informations de compilation. La présence de ce guide ne signifie pas qu'un APK a déjà été généré ou testé.

## Version de test du 20 novembre 2026

L'APK `deliverables/mobile/NewGbonhi-android-test.apk` est genere : version **1.0-test**, Android 7 / API 24 minimum, cible API 36, environ **92 Mo**. La signature v2, l'integrite de l'archive, les fichiers de la boutique et les six extensions natives ont ete verifies. Le rapport detaille se trouve dans `deliverables/mobile/verification.json`.

Les essais sur telephone restent a faire. Le numero WhatsApp professionnel doit encore etre confirme et configure ; aucune commande ni aucun paiement reel n'a ete envoye pendant ces controles. La version iOS n'a pas ete compilee sur cette machine Windows.

## Générer l'APK

Prérequis : JDK 21 à 24, SDK Android plateforme 36 et build-tools 35.0.0. Définir `ANDROID_HOME` si le SDK n'est pas dans `.codex-tmp/android-sdk`. Le script peut utiliser le JBR 21 fourni par Android Studio sous Windows.

```sh
npm run mobile:apk
# Si le build dist-mobile est déjà à jour :
npm run mobile:apk -- --skip-web-build
```

Le script synchronise les fichiers Android, utilise un seul processus de compilation, génère une version `1.0-test` signée avec une clé de débogage locale, puis copie le résultat dans `deliverables/mobile/`. Cette signature est destinée aux essais. La distribution Google Play utilisera une version signée pour publication.

## Installer la version de test

Sur un téléphone Android 7 ou plus récent, ouvrir l'APK généré et suivre les indications Android pour autoriser son installation depuis l'application utilisée pour l'ouvrir. Les libellés varient selon le téléphone. Le nom de l'application est NewGbonhi.

Avec un téléphone déjà connecté pour le développement et autorisé pour le débogage USB :

```sh
adb install -r deliverables/mobile/NewGbonhi-android-test.apk
```

## Parcours à vérifier

1. Ouvrir l'application, passer entre Boutique, Collections et Faces.
2. Ouvrir un produit, choisir une taille et une couleur, puis l'ajouter au panier.
3. Fermer et rouvrir l'application : vérifier que le panier est conservé.
4. Utiliser le bouton retour Android : fermeture du panier/menu, puis retour entre les pages.
5. Ouvrir le formulaire de commande et vérifier l'affichage avec le clavier.
6. Essayer le partage, le presse-papiers et WhatsApp, une fois le numéro professionnel configuré.
7. Vérifier le mode sombre, l'encoche et les boutons en bas de l'écran.
8. Couper la connexion, ouvrir l'application et consulter le catalogue embarqué ; rétablir la connexion avant une commande.

Cette version utilise l'API actuelle de NewGbonhi : envoyer le formulaire crée une commande réelle. Les essais de paiement doivent utiliser les moyens de test du prestataire. Aucune commande ni aucun paiement n'est envoyé automatiquement par le script de compilation.

Pour signaler un problème : noter le modèle du téléphone, la version Android, la page concernée, l'action effectuée et ce qui s'est affiché.

## Si Windows refuse de démarrer Java

Le message « le fichier de pagination est trop petit » ou `There is insufficient memory for the Java Runtime Environment` indique un manque de mémoire disponible sur la machine. Fermer les applications inutilisées avant de relancer. Le script limite déjà les processus et la mémoire du compilateur ; il ne modifie pas les réglages mémoire de Windows.
