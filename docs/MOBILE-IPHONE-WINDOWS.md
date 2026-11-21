# Tester NewGbonhi sur iPhone depuis Windows

Le projet est prepare pour une compilation sur un Mac heberge par GitHub Actions. Windows servira ensuite a l'installation personnelle sur l'iPhone. Le compte Apple Developer payant n'est pas necessaire pour la voie de test personnel avec AltStore Classic ; les applications installees avec un compte gratuit doivent etre renouvelees tous les sept jours.

## Etat actuel

- Appareil indique : iPhone 13, iOS 27.2.1.
- Compilation pour appareil physique reussie le 21 novembre 2026 dans `bderrr87/NewGbonhi-iOS-test`.
- Execution reussie : https://github.com/bderrr87/NewGbonhi-iOS-test/actions/runs/44950568797
- IPA genere : `deliverables/mobile/NewGbonhi-iOS-unsigned.ipa`. La signature personnelle et l'installation sur l'iPhone restent a effectuer.
- Compatibilite de l'installation AltStore Classic sur iOS 27.2.1 encore a verifier sur l'appareil. Un incident a ete rapporte sur une preversion AltStore 2.3.1rc avec iOS 27.2 ; ce signalement ne permet pas de conclure au fonctionnement de la version stable sur cet iPhone.
- L'APK Android et le ZIP de simulateur iOS ne sont pas installables sur l'iPhone.

## 1. Compiler sur GitHub

Le depot principal du projet est `DmK4real/NewGbonhi`. La copie de compilation iPhone se trouve dans `bderrr87/NewGbonhi-iOS-test`, branche `codex/ios-device-test/2026-11-21`. Cette copie contient uniquement le workflow mobile ; les workflows de deploiement du site ont ete exclus.

Le workflow demarre automatiquement sur les branches de test `codex/ios-device-test/**`, ce qui permet de compiler sans fusionner les changements sur `main`. Une fois le workflow disponible sur la branche par defaut du depot, il peut aussi etre lance manuellement dans Actions : choisir **Build mobile test apps**, puis **ios-device**.

Le Mac du service compile pour `iphoneos` et produit l'artefact **NewGbonhi-iPhone-unsigned**. Le fichier attendu est :

```text
deliverables/mobile/NewGbonhi-iOS-unsigned.ipa
```

Le script verifie que l'application cible un appareil iPhoneOS et contient le code ARM64, la configuration NewGbonhi et la boutique embarquee. Il prepare aussi l'empreinte SHA-256 et `iphone-build-info.json`.

Ce fichier n'est pas encore signe pour etre installe. Aucun identifiant Apple, certificat personnel ou mot de passe Apple ne doit etre ajoute au depot ou au workflow. La signature personnelle se fera avec l'outil d'installation, sous le controle du proprietaire du compte.

La facturation de GitHub Actions depend du depot et du quota du compte : les runners standard sont gratuits pour les depots publics ; les depots prives consomment le quota inclus, puis peuvent etre factures. Ne pas changer la visibilite du depot pour cette compilation.

## 2. Preparer l'installation personnelle

Suivre le guide officiel **AltStore Classic pour Windows**, en utilisant les versions officielles actuelles d'AltServer, iTunes et iCloud indiquees par ce guide. Garder l'iPhone et un cable de connexion disponibles.

1. Sur le PC Windows, installer iTunes et iCloud depuis les liens Apple du guide AltStore. Le guide propose aussi une procedure distincte si la version Microsoft Store d'iCloud est necessaire.
2. Toujours sur le PC, telecharger **AltServer for Windows**, extraire le ZIP et lancer `Setup.exe`.
3. Ouvrir AltServer depuis le menu Demarrer, puis brancher l'iPhone deverrouille au PC. Confirmer **Faire confiance** sur l'iPhone si demande.
4. Dans iTunes sur le PC, selectionner l'iPhone et activer sa synchronisation Wi-Fi selon le guide.
5. Dans les petites icones pres de l'horloge Windows, ouvrir AltServer, puis choisir **Install AltStore** et l'iPhone.
6. Se connecter au compte Apple directement dans AltServer et attendre la confirmation d'installation.
7. Sur l'iPhone, autoriser le profil dans **Reglages > General > VPN et gestion de l'appareil** si demande, puis activer **Reglages > Confidentialite et securite > Mode developpeur** et suivre les confirmations.

L'utilisateur effectue lui-meme la connexion a son compte Apple dans l'outil et les confirmations demandees sur l'iPhone. Son mot de passe et ses codes de verification n'ont pas a etre transmis dans la conversation ou a GitHub.

Verifier d'abord qu'AltStore Classic s'installe et s'ouvre sur cet iPhone. Ne pas considerer sa compatibilite iOS 27.2.1 comme acquise avant cet essai.

## 3. Installer et essayer l'IPA

Une fois la compilation terminee, extraire l'IPA de l'artefact GitHub et l'importer dans AltStore Classic pour le signer avec le compte personnel et l'installer. L'iPhone doit autoriser le profil de developpement et le mode Developpeur selon les instructions de l'outil. AltServer est utilise pour les renouvellements de signature.

Verifier ensuite : ouverture, navigation, choix taille/couleur, panier apres fermeture, clavier, partage, presse-papiers et reprise apres une coupure de reseau. Les commandes utilisent l'API actuelle de NewGbonhi : soumettre le formulaire cree une commande reelle. Les essais de paiement doivent utiliser les moyens de test du prestataire.

Cette methode ne publie pas l'application sur l'App Store ou TestFlight. Ces distributions feront l'objet d'une signature et d'une preparation distinctes.

## Sources

- AltStore Classic sur Windows : https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows
- Renouvellement et limites du compte gratuit : https://faq.altstore.io/altstore-classic/your-altstore
- Signalement sur AltStore 2.3.1rc / iOS 27.2 : https://github.com/altstoreio/AltStore/issues/1850
- Runners et facturation GitHub : https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job
