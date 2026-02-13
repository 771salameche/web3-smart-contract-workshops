require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Récupération des variables d'environnement
// Fetching environment variables
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com";
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology"; // RPC URL pour Polygon Amoy
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x_YOUR_PRIVATE_KEY"; // Clé privée du compte de déploiement
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY"; // Clé API pour Etherscan/Polygonscan

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Configuration du compilateur Solidity
  // Solidity compiler configuration
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // Configuration des réseaux pour le déploiement
  // Network configuration for deployment
  networks: {
    hardhat: {
      // Paramètres spécifiques pour le réseau Hardhat local
      // Specific parameters for the local Hardhat network
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: PRIVATE_KEY !== "0x_YOUR_PRIVATE_KEY" ? [PRIVATE_KEY] : [],
      chainId: 80001,
      // Paramètres de gas pour Mumbai (ajuster si nécessaire)
      // Gas settings for Mumbai (adjust if needed)
      gasPrice: 20000000000, // 20 Gwei
      gasLimit: 8000000, // Limite de gas
    },
    amoy: {
      url: AMOY_RPC_URL,
      accounts: PRIVATE_KEY !== "0x_YOUR_PRIVATE_KEY" ? [PRIVATE_KEY] : [],
      chainId: 80002,
      // Paramètres de gas optimisés pour Amoy (à ajuster selon les besoins)
      // Gas settings optimized for Amoy (adjust as needed)
      gasPrice: 30000000000, // 30 Gwei pour satisfaire le minimum requis (25 Gwei)
      gasLimit: 8000000, // Exemple: 8 millions de gas. Ajustez selon la complexité du contrat.
    },
  },
  // Configuration pour la vérification des contrats sur les explorateurs de blocs
  // Configuration for contract verification on block explorers
  etherscan: {
    apiKey: {
      polygonMumbai: ETHERSCAN_API_KEY,
      polygonAmoy: ETHERSCAN_API_KEY, // Utilisation de la même clé API pour Amoy (api.polygonscan.com)
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api", // URL de l'API Polygonscan pour Amoy
          browserURL: "https://amoy.polygonscan.com" // URL de l'explorateur Polygonscan pour Amoy
        }
      }
    ]
  },
  // Configuration pour Sourcify (vérification de code source décentralisée)
  // Configuration for Sourcify (decentralized source code verification)
  sourcify: {
    enabled: true
  }
};