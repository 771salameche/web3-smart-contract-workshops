const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script pour minter (créer) un NFT d'investissement DARVEST sur Polygon Amoy.
 */
async function main() {
    console.log("🎨 Préparation du Minting NFT...");

    // 1. Charger les informations du contrat déployé
    const deploymentPath = path.join(__dirname, "../deployments/amoy-nft.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Erreur : Le fichier de déploiement amoy-nft.json est introuvable.");
        console.log("Veuillez d'abord déployer le contrat : npx hardhat run scripts/deploy.js --network amoy");
        return;
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = deployment.address;

    // 2. Connexion au contrat
    const [minter] = await ethers.getSigners();
    const InvestmentNFT = await ethers.getContractFactory("InvestmentNFT");
    const contract = InvestmentNFT.attach(contractAddress);

    console.log(`🔗 Connecté au contrat : ${contractAddress}`);
    console.log(`👤 Minter : ${minter.address}`);

    try {
        // 3. Définition du montant (via variable d'env ou défaut)
        const amount = process.env.MINT_AMOUNT || 1000;
        console.log(`💰 Montant de l'investissement : ${amount} unités`);

        // 4. Appel de la fonction de mint
        console.log("🛰️ Envoi de la transaction de minting...");
        const tx = await contract.mintInvestmentNFT(amount);
        
        console.log("⏳ Attente de la confirmation de la blockchain...");
        const receipt = await tx.wait();

        // 5. Récupération du Token ID depuis l'événement NFTMinted
        // Dans Ethers v6, les logs sont analysés via l'interface du contrat
        const event = receipt.logs
            .map((log) => {
                try { return contract.interface.parseLog(log); } catch (e) { return null; }
            })
            .find((parsedLog) => parsedLog && parsedLog.name === "NFTMinted");

        if (!event) {
            throw new Error("Événement NFTMinted non trouvé dans la transaction.");
        }

        const tokenId = event.args.tokenId.toString();
        const investor = event.args.investor;
        const mintedAmount = event.args.amount.toString();

        // 6. Affichage des résultats détaillés
        console.log("\n✨ NFT Minté avec succès !");
        console.log("--------------------------------------------------");
        console.log(`🆔 Token ID          : ${tokenId}`);
        console.log(`👤 Propriétaire      : ${investor}`);
        console.log(`💰 Montant Associé   : ${mintedAmount}`);
        console.log(`📄 Hash Transaction  : ${receipt.hash}`);
        console.log(`⛽ Gas Utilisé       : ${receipt.gasUsed.toString()}`);
        console.log(`🔗 PolygonScan       : https://amoy.polygonscan.com/tx/${receipt.hash}`);
        console.log(`🖼️  OpenSea (Amoy)    : https://testnets.opensea.io/assets/amoy/${contractAddress}/${tokenId}`);
        console.log("--------------------------------------------------\n");

        // 7. Sauvegarde dans le registre local des NFTs mintés
        const registryPath = path.join(__dirname, "../minted-nfts.json");
        let mintedRegistry = [];
        if (fs.existsSync(registryPath)) {
            mintedRegistry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
        }

        const nftData = {
            tokenId,
            investor,
            amount: mintedAmount,
            txHash: receipt.hash,
            timestamp: new Date().toISOString()
        };

        mintedRegistry.push(nftData);
        fs.writeFileSync(registryPath, JSON.stringify(mintedRegistry, null, 2));
        console.log(`💾 NFT enregistré dans : ${registryPath}`);

    } catch (error) {
        console.error("❌ Erreur lors du minting :");
        if (error.message.includes("amount must be greater than zero")) {
            console.error("-> Le montant de l'investissement doit être supérieur à 0.");
        } else {
            console.error(error.message);
        }
        process.exitCode = 1;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
