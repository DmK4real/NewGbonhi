# NewGbonhi sur Android et iOS

Le projet utilise Vue + Capacitor 8. Les interfaces, le catalogue et les images sont embarques dans chaque application ; les commandes et formulaires utilisent l'API HTTPS existante. Le site web conserve son build habituel dans `dist/`.

## Premiere version preparee

- Android : projet `android/`, identifiant `com.newgbonhi.app`, Android 7 / API 24 minimum.
- iOS : projet `ios/App/App.xcodeproj`, meme identifiant, iOS 15 minimum, Swift Package Manager.
- Barre mobile Boutique / Collections / Faces / Panier, panier local persistant et message hors connexion.
- Retour Android : fermeture du panier ou du menu, retour dans l'historique, puis reduction de l'application a l'accueil.
- Liens WhatsApp ouverts par le systeme, pages de paiement dans le navigateur natif, partage et presse-papiers natifs.
- Logo NewGbonhi sur les icones et ecrans de lancement.
- Liens explicites `newgbonhi://app/faces` ou `newgbonhi://app/product/<slug>`.

Les liens HTTPS ouverts depuis une autre application restent des liens web : les Android App Links / iOS Universal Links ne sont pas configures. Le schema personnalise ne doit jamais servir de preuve de paiement ou de connexion. Le serveur reste responsable de la validation des paiements.

## Configuration

Node.js 22 ou plus recent est requis. Sur Windows, utiliser `npm.cmd` et `npx.cmd` si PowerShell bloque les scripts `.ps1`.

```sh
npm ci
```

`.env.mobile` contient uniquement la configuration publique : API `https://newgbonhi.com/api`, mode application et navigation par hash. Copier `.env.mobile.local.example` en `.env.mobile.local` et renseigner le numero WhatsApp professionnel au format international sans `+`, pour rendre cette action disponible. Ce numero n'est pas deduit des numeros de paiement. On peut aussi y configurer les memes coordonnees publiques que le site.

Ne jamais mettre de mot de passe, cle de paiement ou certificat de signature dans `VITE_*`. Ces valeurs sont embarquees et publiques. Les fichiers `.env.*.local` et les cles de signature sont ignores par Git.

```sh
npm run mobile:build    # produit dist-mobile/, separe du site web
npm run mobile:preview  # apercu HTTP local, port 4173
npm run mobile:sync     # reconstruit puis copie dans Android et iOS
npm run mobile:icons    # regenere les images natives depuis le logo existant
npm run mobile:apk      # compile et prepare un APK Android de test
```

L'apercu navigateur permet de voir l'interface application. Les plugins natifs ne sont executables que dans une application installee. Le catalogue embarque est celui de la compilation : une modification du catalogue ou de l'interface demande une nouvelle version de l'application.

## Android

Installer Android Studio 2025.2.1 ou plus recent, le SDK Android 36, les build-tools 35.0.0 et un JDK compatible avec le projet Gradle (JDK 21 recommande par Capacitor 8). Dans Android Studio, configurer le chemin du SDK local si necessaire.

Le guide [MOBILE-ANDROID-TEST.md](MOBILE-ANDROID-TEST.md) decrit la generation et les essais de l'APK. Les [textes des stores](MOBILE-STORE-TEXTS.md) sont prepares pour relecture ; ils ne sont pas publies.

```sh
npm run mobile:android
```

Choisir un emulateur ou un telephone Android avec le debogage USB. Pour un APK de test : menu Build > Build App Bundle(s) / APK(s) > Build APK(s), ou :

```sh
cd android
./gradlew assembleDebug
# Windows : .\gradlew.bat assembleDebug
```

Resultat : `android/app/build/outputs/apk/debug/app-debug.apk`. Pour Google Play, generer un **Android App Bundle signe (.aab)** via Build > Generate Signed Bundle / APK. Conserver la cle d'envoi dans un emplacement sur et incrementer `versionCode` pour chaque publication.

## iOS

Pour un test personnel depuis Windows avec compilation sur un Mac heberge, voir [le guide iPhone depuis Windows](MOBILE-IPHONE-WINDOWS.md). Le choix `ios-device` du workflow produit un IPA pour appareil physique, a signer personnellement avant installation ; `ios-simulator` produit une application pour simulateur.

La compilation et les tests iOS demandent un Mac avec Xcode 26 ou plus recent. Copier ou cloner le projet complet, puis :

```sh
npm ci
npm run mobile:ios
```

Dans Xcode : choisir la Team Apple Developer dans Signing & Capabilities, verifier l'identifiant, tester sur simulateur puis iPhone. Pour la distribution : Product > Archive > Distribute App > App Store Connect. Passer d'abord par TestFlight. Incrementer la version et le numero de build dans les reglages de la cible App.

Ce projet utilise Swift Package Manager ; ouvrir `App.xcodeproj`. Il ne demande pas de Podfile ou de workspace CocoaPods.

## Publication et verification sur appareil

Les projets sont prepares ; aucune publication ni signature de distribution n'est effectuee automatiquement.

1. Confirmer que `com.newgbonhi.app` est l'identifiant souhaite avant de creer les fiches stores.
2. Utiliser les comptes Google Play Console et Apple Developer de NewGbonhi et completer leur verification.
3. Tester sur Android et iPhone : petits ecrans, encoche, mode sombre, clavier, fermeture/reouverture, panier, choix taille/couleur et formulaire de commande.
4. Verifier WhatsApp avec et sans l'application installee ; tester les paiements avec des moyens de test du prestataire, y compris annulation et retour a l'application. Aucun paiement reel n'est valide par les tests unitaires.
5. Tester le demarrage hors connexion, les images embarquees, puis la reprise de connexion. Les commandes, inscriptions et paiements exigent Internet.
6. Preparer les captures d'ecran, descriptions, categorie, classification d'age, URL d'assistance et URL publique de confidentialite `https://newgbonhi.com/confidentialite`.
7. Remplir les declarations de donnees et de confidentialite d'apres les traitements reels de l'application et du serveur. Le projet n'ajoute pas de notifications push, compte client, camera ou geolocalisation.
8. Effectuer les tests demandes dans les consoles, puis soumettre a la validation de chaque store. L'acceptation depend de leur examen, notamment de la qualite et de la valeur fonctionnelle de l'application.

Le navigateur de paiement reste separe de la WebView de la boutique. Fermer ce navigateur rend la main a l'application. Les URL de retour des prestataires restent celles du serveur actuel : le retour automatique apres paiement par Universal Link n'est pas implemente.

## Verification technique

```sh
npm test -- --maxWorkers=1
npm run build
npm run mobile:sync
```

Le workflow `.github/workflows/mobile-build.yml` peut produire un APK Android de test, un IPA iPhone non signe et une application iOS pour simulateur sur des machines de compilation adaptees. Il ne signe pas pour les stores et ne publie rien. Les branches `codex/ios-device-test/**` lancent le test iPhone ; les autres plateformes peuvent etre selectionnees avec le lancement manuel lorsque le workflow est disponible sur la branche par defaut.

## Sources techniques

- Capacitor : https://capacitorjs.com/docs/getting-started
- Environnement Android/iOS : https://capacitorjs.com/docs/getting-started/environment-setup
- Minimum fonctionnel et examen Apple : https://developer.apple.com/app-store/review/
