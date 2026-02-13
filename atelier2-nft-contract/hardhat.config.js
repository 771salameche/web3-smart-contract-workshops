require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Récupération des variables d'environnement depuis le fichier .env
// Ces variables sont essentielles pour le déploiement sur le réseau Amoy
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x_YOUR_PRIVATE_KEY";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Configuration du compilateur Solidity optimisée pour les contrats NFT (ERC721)
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Réseau local Hardhat pour le développement et les tests rapides
    },
    // Configuration pour le testnet Polygon Amoy (successeur de Mumbai)
    amoy: {
      url: AMOY_RPC_URL,
      accounts: PRIVATE_KEY !== "0x_YOUR_PRIVATE_KEY" ? [PRIVATE_KEY] : [],
      chainId: 80002,
      // Paramètres de gas optimisés pour assurer la validation des transactions sur Amoy
      gasPrice: 30000000000, // 30 Gwei
      gasLimit: 5000000,
    },
  },
  // Configuration pour la vérification automatique des contrats sur PolygonScan
  etherscan: {
    apiKey: {
      polygonAmoy: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },
  // Option pour une vérification décentralisée via Sourcify
  sourcify: {
    enabled: true
  }
};