// Import des modules nécessaires de Hardhat et Ethers.js
// Importing necessary modules from Hardhat and Ethers.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Note: Ce script est conçu pour le déploiement sur le réseau de test Polygon Amoy.
    // Note: This script is designed for deployment on the Polygon Amoy testnet.

    console.log("Déploiement du contrat InvestmentStorage...");

    try {
        // 1. Récupérer le compte du déployeur
        // Get the deployer's account
        const [deployer] = await ethers.getSigners();
        console.log(`Déploiement des contrats avec le compte : ${deployer.address}`);

        // 2. Obtenir le contrat Factory pour InvestmentStorage
        // Get the Contract Factory for InvestmentStorage
        const InvestmentStorage = await ethers.getContractFactory("InvestmentStorage");

        // 3. Déployer le contrat
        // Le constructeur de InvestmentStorage attend un argument pour le propriétaire.
        // Ici, l'adresse du déployeur est utilisée comme propriétaire initial.
        // Deploy the contract
        // The InvestmentStorage constructor expects an owner argument.
        // Here, the deployer's address is used as the initial owner.
        const investmentStorage = await InvestmentStorage.deploy(deployer.address);
        await investmentStorage.waitForDeployment(); // Attendre la confirmation du déploiement

        const deployTx = investmentStorage.deploymentTransaction();
        let receipt;
        if (deployTx) {
            receipt = await deployTx.wait(2); // Attendre 2 confirmations de bloc
            console.log("Déploiement confirmé sur 2 blocs.");
        } else {
            console.warn("Impossible de récupérer la transaction de déploiement pour attendre les confirmations.");
        }

        // 4. Log des informations de déploiement
        // Log deployment information
        const contractAddress = await investmentStorage.getAddress();
        console.log(`Contrat InvestmentStorage déployé à l'adresse : ${contractAddress}`);
        console.log(`Transaction Hash : ${deployTx ? deployTx.hash : 'N/A'}`);
        console.log(`Déployé par : ${deployer.address}`);

        if (receipt) {
            console.log(`Numéro de bloc : ${receipt.blockNumber}`);
            console.log(`Gas utilisé : ${receipt.gasUsed.toString()}`);
        } else {
             console.log(`Numéro de bloc : N/A`);
             console.log(`Gas utilisé : N/A`);
        }
        
        // 5. Sauvegarder les informations de déploiement dans un fichier JSON
        // Save deployment information to a JSON file
        const deploymentsDir = path.join(__dirname, "../deployments");
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
        }

        const deploymentInfo = {
            contractName: "InvestmentStorage",
            address: contractAddress,
            deployer: deployer.address,
            transactionHash: deployTx ? deployTx.hash : 'N/A',
            blockNumber: receipt ? receipt.blockNumber : 'N/A',
            gasUsed: receipt ? receipt.gasUsed.toString() : 'N/A',
            timestamp: new Date().toISOString(),
            network: "amoy",
        };

        const deploymentFilePath = path.join(deploymentsDir, "amoy.json");
        fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`Informations de déploiement sauvegardées dans : ${deploymentFilePath}`);

    } catch (error) {
        // 6. Gestion des erreurs
        // Error handling
        console.error("Erreur lors du déploiement du contrat :", error);
        process.exitCode = 1; // Indiquer un échec
    }
}

// Exécuter la fonction principale et gérer les erreurs non capturées
// Execute the main function and handle uncaught errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });