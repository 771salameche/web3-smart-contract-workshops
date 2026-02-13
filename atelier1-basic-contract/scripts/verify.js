const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de vérification automatisée pour PolygonScan Amoy.
 * Ce script lit les informations de déploiement et tente de vérifier le contrat.
 */
async function main() {
    // Vérifier si nous sommes sur le bon réseau
    if (network.name !== "amoy") {
        console.warn("⚠️ Ce script est optimisé pour le réseau 'amoy'.");
    }

    // 1. Charger les informations de déploiement
    const deploymentPath = path.join(__dirname, "../deployments/amoy.json");
    
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Fichier amoy.json introuvable. Veuillez d'abord déployer le contrat.");
        return;
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = deployment.address;
    const ownerAddress = deployment.deployer; // Dans notre deploy.js, le deployer est le propriétaire initial

    console.log(`🔍 Début de la vérification pour le contrat : ${contractAddress}`);
    console.log(`📝 Arguments du constructeur : [${ownerAddress}]`);
    console.log("⏳ Note : La vérification sur Amoy peut prendre 1 à 2 minutes après le déploiement...");

    // 2. Logique de vérification avec gestion des erreurs et tentatives
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [ownerAddress],
        });

        console.log("✅ Vérification réussie !");
        console.log(`🔗 URL : https://amoy.polygonscan.com/address/${contractAddress}#code`);

    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("ℹ️ Le contrat est déjà vérifié sur PolygonScan.");
        } else if (error.message.toLowerCase().includes("does not have bytecode")) {
            console.error("❌ Erreur : Le bytecode n'est pas encore disponible. Attendez quelques secondes et réessayez.");
        } else {
            console.error("❌ Erreur lors de la vérification :");
            console.error(error);
        }
    }
}

// Exécution du script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
