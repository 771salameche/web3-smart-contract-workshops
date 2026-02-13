const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de déploiement pour le contrat InvestmentNFT sur Polygon Amoy.
 */
async function main() {
    console.log("🚀 Début du déploiement du contrat InvestmentNFT...");

    try {
        // 1. Récupération du compte déployeur
        const [deployer] = await ethers.getSigners();
        console.log(`👤 Déploiement avec le compte : ${deployer.address}`);
        
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`💰 Solde du déployeur : ${ethers.formatEther(balance)} MATIC`);

        // 2. Configuration des paramètres du NFT
        const nftName = "DARVEST Investment Share";
        const nftSymbol = "DINV";
        
        console.log(`📦 Configuration : Nom="${nftName}", Symbole="${nftSymbol}"`);
        console.log("⛽ Note : Le déploiement d'un contrat NFT consomme plus de gaz qu'un contrat de stockage simple.");

        // 3. Déploiement du contrat
        const InvestmentNFT = await ethers.getContractFactory("InvestmentNFT");
        
        // On passe l'owner initial, le nom et le symbole au constructeur
        const investmentNFT = await InvestmentNFT.deploy(deployer.address, nftName, nftSymbol);
        
        console.log("⏳ Attente de la validation de la transaction...");
        await investmentNFT.waitForDeployment();

        const contractAddress = await investmentNFT.getAddress();
        const deployTx = investmentNFT.deploymentTransaction();
        
        // 4. Attente de confirmations (plus sécurisé sur Amoy)
        console.log("📡 Attente de 2 confirmations de bloc sur le réseau Amoy...");
        const receipt = await deployTx.wait(2);

        // 5. Affichage des informations de déploiement
        console.log("\n✅ Déploiement réussi !");
        console.log("--------------------------------------------------");
        console.log(`📍 Adresse du contrat : ${contractAddress}`);
        console.log(`📄 Hash de transaction : ${deployTx.hash}`);
        console.log(`🧱 Numéro de bloc     : ${receipt.blockNumber}`);
        console.log(`⛽ Gas utilisé        : ${receipt.gasUsed.toString()}`);
        console.log(`🏷️ Nom du NFT         : ${nftName}`);
        console.log(`🆔 Symbole du NFT     : ${nftSymbol}`);
        console.log("--------------------------------------------------\n");

        // 6. Sauvegarde des informations dans un fichier JSON
        const deploymentsDir = path.join(__dirname, "../deployments");
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
        }

        const deploymentInfo = {
            contractName: "InvestmentNFT",
            address: contractAddress,
            deployer: deployer.address,
            transactionHash: deployTx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            name: nftName,
            symbol: nftSymbol,
            network: network.name,
            timestamp: new Date().toISOString()
        };

        const filePath = path.join(deploymentsDir, "amoy-nft.json");
        fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`💾 Informations sauvegardées dans : ${filePath}`);

    } catch (error) {
        console.error("❌ Erreur lors du déploiement :");
        console.error(error);
        process.exitCode = 1;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });