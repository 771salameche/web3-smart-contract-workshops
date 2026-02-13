const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script d'interaction avec le contrat InvestmentNFT.
 * Ce script sert de tutoriel pour lire les données et tester les contraintes du contrat.
 */
async function main() {
    console.log("🔍 Exploration du Smart Contract InvestmentNFT...");

    // 1. Chargement de l'adresse du contrat depuis les déploiements
    const deploymentPath = path.join(__dirname, "../deployments/amoy-nft.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Erreur : Fichier amoy-nft.json introuvable.");
        return;
    }
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = deployment.address;

    // 2. Initialisation des signers (comptes)
    const [owner, secondAccount] = await ethers.getSigners();
    const otherAccountAddress = secondAccount ? secondAccount.address : "0x1234567890123456789012345678901234567890";
    
    // 3. Connexion au contrat
    const InvestmentNFT = await ethers.getContractFactory("InvestmentNFT");
    const contract = InvestmentNFT.attach(contractAddress);

    console.log(`📍 Contrat : ${contractAddress}`);
    console.log(`👤 Utilisateur actuel : ${owner.address}\n`);

    try {
        // --- ACTION 1 : Nombre total de NFTs ---
        const total = await contract.getTotalMinted();
        console.log(`📊 Total de parts d'investissement émises : ${total}`);

        if (total == 0) {
            console.log("⚠️ Aucun NFT n'a encore été minté. Lancez 'npx hardhat run scripts/mint.js --network amoy' d'abord.");
            return;
        }

        const targetId = 1; // On cible le premier NFT pour la démonstration
        console.log(`--- Analyse du Token ID: ${targetId} ---`);

        // --- ACTION 2 : Montant de l'investissement ---
        // Relation TokenID <-> Montant : Chaque ID est lié à une valeur unique on-chain.
        const amount = await contract.getInvestmentAmount(targetId);
        console.log(`💰 Montant de l'investissement associé : ${amount} unités`);

        // --- ACTION 3 : Propriétaire du NFT ---
        const currentOwner = await contract.ownerOf(targetId);
        console.log(`🔑 Détenteur actuel : ${currentOwner}`);

        // --- ACTION 4 : Métadonnées (URI) ---
        // Le lien vers le JSON externe (souvent stocké sur IPFS)
        const uri = await contract.tokenURI(targetId);
        console.log(`🖼️  URI des métadonnées : ${uri}`);

        // --- ACTION 5 : Test de Transfert (Doit échouer) ---
        /**
         * POURQUOI LES TRANSFERTS SONT BLOQUÉS ?
         * Dans DARVEST, les parts sont "Soulbound" pour éviter la spéculation sauvage 
         * et assurer que l'investisseur identifié reste le détenteur légal de la part.
         */
        console.log("\n🚫 Tentative de transfert (Test de sécurité Soulbound)...");
        console.log(`Essai de transfert du Token #${targetId} vers ${otherAccountAddress}`);

        try {
            // Tentative de transfert de owner vers otherAccountAddress
            const tx = await contract.transferFrom(owner.address, otherAccountAddress, targetId);
            await tx.wait();
            console.log("❌ Erreur : Le transfert a réussi, ce qui ne devrait pas arriver !");
        } catch (error) {
            console.log("✅ Succès du test : Le transfert a été REJETÉ par le Smart Contract.");
            console.log(`📝 Raison du rejet : ${error.reason || "Transferts interdits (Soulbound)"}`);
        }

        console.log("\n🔗 Vérifier le contrat sur PolygonScan :");
        console.log(`https://amoy.polygonscan.com/address/${contractAddress}`);

    } catch (error) {
        console.error("\n❌ Une erreur est survenue lors de l'interaction :");
        console.error(error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
