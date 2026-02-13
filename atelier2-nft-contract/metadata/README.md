# 🖼️ Gestion des Métadonnées NFT - DARVEST

Ce dossier contient le modèle (template) de métadonnées utilisé pour nos NFTs d'investissement. Les métadonnées sont essentielles pour donner de la valeur et de l'information à un jeton numérique.

## ❓ Qu'est-ce que les métadonnées NFT ?

Un Smart Contract NFT ne contient généralement que des chiffres (ID de token, adresse du propriétaire). Les informations visuelles et descriptives (nom, image, attributs) sont stockées dans un fichier JSON externe.

Le lien entre la blockchain et ce fichier se fait via la fonction `tokenURI()` du contrat, qui renvoie l'adresse URL de ce fichier JSON.

## 💾 Où stocker ces données ?

### 1. En Production : IPFS
Pour garantir la décentralisation, nous utilisons **IPFS** (InterPlanetary File System). 
- **Pourquoi ?** Contrairement à un serveur classique, les données sur IPFS sont liées à leur contenu (Hash). Si le contenu change, l'URL change. Cela garantit que l'image de votre investissement ne sera jamais modifiée par un tiers.
- **Protocole :** Les URLs commencent par `ipfs://...`

### 2. En Test : Placeholders (Serveur Centralisé)
Pour nos ateliers sur le testnet Amoy, nous utilisons des placeholders (variables entre crochets comme `[AMOUNT]`). Dans un environnement de test, il est plus rapide d'utiliser un serveur web classique (API) pour générer ces JSON dynamiquement avant de les figer sur IPFS pour le lancement réel.

## 📊 Structure du Template (Standard OpenSea)

Le fichier `nft-metadata-template.json` respecte le standard d'OpenSea pour assurer un affichage correct sur toutes les places de marché :

- **name** : Titre unique incluant l'ID de la part.
- **description** : Texte explicatif sur le rôle de la part DARVEST.
- **image** : Lien vers le visuel de la part (certificat numérique).
- **attributes** : Données structurées (montant, date, réseau) qui permettent de filtrer et trier les NFTs.

## 📝 Note sur les Attributs
Les attributs comme "Investment Amount" sont critiques. Bien qu'ils soient présents dans le JSON pour l'affichage, la **vérité ultime** du montant reste stockée on-chain dans le contrat `InvestmentNFT.sol` pour une sécurité maximale.
