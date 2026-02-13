// Import des modules nécessaires de Hardhat, Ethers.js, et les utilitaires de fichier
// Importing necessary modules from Hardhat, Ethers.js, and file utilities
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Note: Ce script est conçu pour interagir avec le contrat InvestmentStorage sur le réseau de test Polygon Amoy.
    // Note: This script is designed to interact with the InvestmentStorage contract on the Polygon Amoy testnet.

    console.log("Démarrage de l'interaction avec le contrat InvestmentStorage...");

    try {
        // 1. Charger les informations de déploiement du contrat
        // Load contract deployment information
        const deploymentFilePath = path.join(__dirname, "../deployments/amoy.json");
        if (!fs.existsSync(deploymentFilePath)) {
            throw new Error(`Fichier de déploiement introuvable à : ${deploymentFilePath}`);
        }
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));
        const contractAddress = deploymentInfo.address;
        const deployerAddress = deploymentInfo.deployer;

        console.log(`Contrat InvestmentStorage déployé à l'adresse : ${contractAddress}`);
        console.log(`Déployé par : ${deployerAddress}`);

        // 2. Récupérer le signataire (utilisateur interagissant)
        // Get the interacting signatory (user)
        const [signer] = await ethers.getSigners();
        console.log(`Interaction en tant que : ${signer.address}`);

        // 3. Connecter au contrat déployé
        // Connect to the deployed contract
        const InvestmentStorage = await ethers.getContractFactory("InvestmentStorage");
        const investmentStorage = InvestmentStorage.attach(contractAddress);

        // --- Séquence d'actions ---

        // Action 1: Enregistrer un investissement (setInvestment)
        console.log("\n--- Action 1: Enregistrement d'un investissement ---");
        const amountToInvest = ethers.parseEther("0.001"); // Investir 0.001 ETH (MATIC sur Amoy)
        console.log(`Envoi de ${ethers.formatEther(amountToInvest)} MATIC comme investissement...`);

        const setInvestmentTx = await investmentStorage.setInvestment(amountToInvest, {
            value: amountToInvest, // Envoyer des fonds avec la transaction
        });
        console.log(`Transaction 'setInvestment' envoyée. Hash: ${setInvestmentTx.hash}`);
        console.log(`Lien PolygonScan (Amoy) : https://amoy.polygonscan.com/tx/${setInvestmentTx.hash}`);

        // Attendre 2 confirmations de bloc
        // Wait for 2 block confirmations
        const receiptSetInvestment = await setInvestmentTx.wait(2);
        console.log("Transaction 'setInvestment' confirmée !");
        if (receiptSetInvestment) {
            console.log(`Block Number: ${receiptSetInvestment.blockNumber}`);
            console.log(`Gas Used: ${receiptSetInvestment.gasUsed.toString()}`);
        }

        // Action 2: Lire l'investissement (getInvestment)
        console.log("\n--- Action 2: Lecture de l'investissement ---");
        const currentInvestment = await investmentStorage.getInvestment(signer.address);
        console.log(`Votre investissement actuel est de : ${ethers.formatEther(currentInvestment)} MATIC`);

        // Action 3: Obtenir le nombre total d'investisseurs
        console.log("\n--- Action 3: Obtention du nombre total d'investisseurs ---");
        const totalInvestors = await investmentStorage.getTotalInvestors();
        console.log(`Nombre total d'investisseurs uniques : ${totalInvestors.toString()}`);

        // Note: Si vous souhaitez tester le retrait des fonds (withdrawFunds),
        //      cela doit être fait par le propriétaire du contrat.
        //      Décommentez le bloc ci-dessous et assurez-vous que 'signer' est le propriétaire.
        /*
        console.log("\n--- Action Optionnelle: Retrait des fonds par le propriétaire ---");
        if (signer.address === deployerAddress) {
            console.log("Tentative de retrait des fonds par le propriétaire...");
            const withdrawTx = await investmentStorage.withdrawFunds();
            console.log(`Transaction 'withdrawFunds' envoyée. Hash: ${withdrawTx.hash}`);
            console.log(`Lien PolygonScan (Amoy) : https://amoy.polygonscan.com/tx/${withdrawTx.hash}`);
            const receiptWithdraw = await withdrawTx.wait(2);
            console.log("Transaction 'withdrawFunds' confirmée !");
            if (receiptWithdraw) {
                console.log(`Block Number: ${receiptWithdraw.blockNumber}`);
                console.log(`Gas Used: ${receiptWithdraw.gasUsed.toString()}`);
            }
        } else {
            console.log("Le signataire actuel n'est pas le propriétaire du contrat, le retrait n'est pas possible.");
        }
        */

        console.log("\nInteraction avec le contrat InvestmentStorage terminée avec succès.");

    } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de l'interaction avec le contrat :", error);
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