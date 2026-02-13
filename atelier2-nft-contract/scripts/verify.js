const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de vérification pour le contrat InvestmentNFT sur Polygon Amoy.
 * La vérification permet de rendre le code source public et auditable sur l'explorateur.
 */
async function main() {
    console.log("🔍 Préparation de la vérification du contrat NFT...");

    // 1. Charger les informations de déploiement
    const deploymentPath = path.join(__dirname, "../deployments/amoy-nft.json");
    
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Erreur : Fichier amoy-nft.json introuvable. Déployez d'abord le contrat.");
        return;
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = deployment.address;
    const initialOwner = deployment.deployer;
    const nftName = deployment.name || "DARVEST Investment Share";
    const nftSymbol = deployment.symbol || "DINV";

    console.log(`📍 Adresse : ${contractAddress}`);
    console.log(`🏷️  Nom : ${nftName}`);
    console.log(`🆔 Symbole : ${nftSymbol}`);
    console.log(`👤 Owner : ${initialOwner}`);
    console.log("⏳ Note : La vérification sur Amoy peut être lente. Initialisation...");

    // 2. Exécution de la vérification
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [
                initialOwner,
                nftName,
                nftSymbol
            ],
        });

        console.log("
✅ Félicitations ! Votre contrat NFT est maintenant vérifié.");
        
        // 3. Informations d'aide après vérification
        console.log("
--- INFORMATIONS UTILES ---");
        console.log(`🌐 Explorateur : https://amoy.polygonscan.com/address/${contractAddress}#code`);
        console.log(`🎨 Voir la collection sur OpenSea : https://testnets.opensea.io/assets/amoy/${contractAddress}`);
        console.log(`🦊 Pour voir vos NFTs dans MetaMask :`);
        console.log(`   - Adresse du contrat : ${contractAddress}`);
        console.log(`   - Token ID : (voir vos transactions ou mint.js)`);
        console.log("---------------------------
");

    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("ℹ️ Le contrat est déjà vérifié sur PolygonScan.");
            console.log(`🌐 URL : https://amoy.polygonscan.com/address/${contractAddress}#code`);
        } else if (error.message.toLowerCase().includes("constructor arguments mismatch")) {
            console.error("❌ Erreur : Les arguments du constructeur ne correspondent pas.");
            console.error("Vérifiez les paramètres dans amoy-nft.json.");
        } else {
            console.error("❌ Une erreur est survenue lors de la vérification :");
            console.error(error.message);
            console.log("
💡 Conseil : Attendez 1 à 2 minutes après le déploiement avant de vérifier.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
