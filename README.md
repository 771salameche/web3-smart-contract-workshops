# Axe 1 : Développement de Smart Contracts - Projet DARVEST

Ce dépôt contient les travaux réalisés dans le cadre de l'Axe 1 du projet **DARVEST**, une plateforme d'investissement basée sur la blockchain. L'objectif de cette section est de concevoir, développer et tester les contrats intelligents (Smart Contracts) nécessaires à la gestion des investissements et à la tokenisation des parts sous forme de NFTs.

Le projet est divisé en deux ateliers progressifs utilisant le framework **Hardhat**.

---

## 📂 Structure du Projet

Le dépôt est organisé en deux dossiers principaux :

### 1. `atelier1-basic-contract` (Stockage d'Investissements)
Cet atelier porte sur la création d'un contrat de base pour la gestion comptable des investissements.
- **Contrat :** `InvestmentStorage.sol`
- **Fonctionnalités :**
    - Enregistrement cumulatif des investissements par adresse.
    - Suivi du nombre total d'investisseurs uniques.
    - Gestion des accès (Ownable) pour permettre au propriétaire de retirer les fonds.
    - Émission d'événements pour la traçabilité on-chain.

### 2. `atelier2-nft-contract` (Tokenisation via NFTs)
Cet atelier introduit la notion de "Soulbound Tokens" (NFTs non-transférables) pour représenter des parts d'investissement.
- **Contrat :** `InvestmentNFT.sol`
- **Fonctionnalités :**
    - Implémentation du standard ERC721 (OpenZeppelin).
    - **Soulbound :** Les transferts entre portefeuilles sont désactivés pour lier la part à l'investisseur.
    - Association d'un montant d'investissement spécifique à chaque Token ID.
    - Génération d'URIs de métadonnées pour l'intégration avec des plateformes tierces.

---

## 🛠 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (v18.x ou supérieur recommandé)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

---

## 🚀 Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/771salameche/web3-smart-contract-workshops
   cd web3-smart-contract-workshops
   ```

2. Installez les dépendances pour chaque atelier :
   ```bash
   # Pour atelier 1
   cd atelier1-basic-contract
   npm install

   # Pour atelier 2
   cd ../atelier2-nft-contract
   npm install
   ```

3. Configurez les variables d'environnement (si nécessaire) :
   Copiez le fichier `.env.example` en `.env` dans chaque dossier et remplissez vos clés API (Infura/Alchemy) et clés privées.

---

## 📖 Utilisation

Les commandes suivantes sont valables pour les deux ateliers (à exécuter dans le dossier correspondant) :

### Compilation des contrats
```bash
npm run compile
```

### Exécution des tests
```bash
npm run test
```

### Déploiement
Pour déployer sur un réseau local ou de test (ex: Amoy/Polygon) :
```bash
# Modifier scripts/deploy.js si nécessaire
npm run deploy
```

---

## 🏗 Choix Techniques

- **Langage :** Solidity ^0.8.20
- **Framework :** Hardhat (Environnement de développement Ethereum)
- **Librairies :** OpenZeppelin (Standards de sécurité et tokens)
- **Tests :** Mocha & Chai pour assurer la fiabilité du code.

---

## 🔒 Sécurité et Transparence

Les contrats ont été conçus avec une attention particulière à la sécurité :
- Utilisation de `SafeMint` pour éviter la perte de tokens.
- Validation rigoureuse des entrées (rechecks, modifiers).
- Mécanisme de retrait sécurisé par `call` pour prévenir les attaques de réentrance.
