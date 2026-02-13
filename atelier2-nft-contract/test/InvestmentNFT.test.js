const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Suite de tests pour le contrat InvestmentNFT
 * @dev Cette suite valide le comportement du contrat ERC721 "Soulbound" pour DARVEST.
 */
describe("InvestmentNFT", function () {
    let InvestmentNFT;
    let investmentNFT;
    let owner;
    let addr1;
    let addr2;

    const NAME = "DARVEST Investment Share";
    const SYMBOL = "DINV";

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        InvestmentNFT = await ethers.getContractFactory("InvestmentNFT");
        investmentNFT = await InvestmentNFT.deploy(owner.address, NAME, SYMBOL);
        await investmentNFT.waitForDeployment();
    });

    // --- 1. Tests de Déploiement ---
    describe("Déploiement", function () {
        it("Devrait déployer le contrat avec une adresse valide", async function () {
            expect(investmentNFT.target).to.be.properAddress;
        });

        it("Devrait avoir le nom et le symbole corrects", async function () {
            expect(await investmentNFT.name()).to.equal(NAME);
            expect(await investmentNFT.symbol()).to.equal(SYMBOL);
        });

        it("Devrait définir le bon propriétaire (owner)", async function () {
            expect(await investmentNFT.owner()).to.equal(owner.address);
        });

        it("Le compteur initial de tokens doit être 0", async function () {
            expect(await investmentNFT.getTotalMinted()).to.equal(0);
        });
    });

    // --- 2. Tests de Minting (Création de parts) ---
    describe("Minting de NFT", function () {
        it("Devrait permettre de minter un NFT avec un montant valide", async function () {
            const amount = 1000;
            await expect(investmentNFT.connect(addr1).mintInvestmentNFT(amount))
                .to.emit(investmentNFT, "NFTMinted")
                .withArgs(addr1.address, 1, amount);
        });

        it("L'ID du token doit s'incrémenter à chaque création", async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(500);
            await investmentNFT.connect(addr2).mintInvestmentNFT(1500);
            expect(await investmentNFT.getTotalMinted()).to.equal(2);
        });

        it("Le montant investi doit être stocké correctement pour chaque NFT", async function () {
            const amount = 2500;
            await investmentNFT.connect(addr1).mintInvestmentNFT(amount);
            expect(await investmentNFT.getInvestmentAmount(1)).to.equal(amount);
        });

        it("L'investisseur doit être le propriétaire du NFT généré", async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(100);
            expect(await investmentNFT.ownerOf(1)).to.equal(addr1.address);
        });

        it("Devrait rejeter un investissement de montant zéro", async function () {
            await expect(investmentNFT.connect(addr1).mintInvestmentNFT(0))
                .to.be.revertedWith("Le montant doit etre superieur a zero.");
        });

        it("Devrait gérer plusieurs mints pour le même investisseur", async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(100);
            await investmentNFT.connect(addr1).mintInvestmentNFT(200);
            expect(await investmentNFT.balanceOf(addr1.address)).to.equal(2);
        });
    });

    // --- 3. Suivi des investissements globaux ---
    describe("Suivi des investissements", function () {
        it("Devrait calculer correctement le cumul total des investissements", async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(1000);
            await investmentNFT.connect(addr2).mintInvestmentNFT(2000);
            expect(await investmentNFT.getTotalInvestment()).to.equal(3000);
        });

        it("Devrait retourner le bon nombre de tokens via getTotalMinted", async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(100);
            await investmentNFT.connect(addr2).mintInvestmentNFT(100);
            await investmentNFT.connect(owner).mintInvestmentNFT(100);
            expect(await investmentNFT.getTotalMinted()).to.equal(3);
        });
    });

    // --- 4. Métadonnées ---
    describe("Métadonnées (tokenURI)", function () {
        it("tokenURI doit retourner le bon format d'URL", async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(1000);
            const uri = await investmentNFT.tokenURI(1);
            expect(uri).to.contain("https://api.darvest.io/metadata/share/1");
        });

        it("Doit échouer si on demande l'URI d'un token inexistant", async function () {
            // ERC721NonexistentToken est l'erreur standard d'OpenZeppelin v5
            await expect(investmentNFT.tokenURI(99))
                .to.be.revertedWithCustomError(investmentNFT, "ERC721NonexistentToken")
                .withArgs(99);
        });
    });

    // --- 5. Restriction des transferts (Soulbound) ---
    describe("Restrictions de transfert (Soulbound logic)", function () {
        beforeEach(async function () {
            await investmentNFT.connect(addr1).mintInvestmentNFT(1000);
        });

        it("Le propriétaire ne peut PAS transférer son NFT vers un autre compte", async function () {
            // Un NFT DARVEST est lié à l'investisseur. Le transfert doit échouer.
            await expect(investmentNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1))
                .to.be.revertedWith("Transferts interdits : les parts DARVEST sont liees a votre identite.");
        });

        it("safeTransferFrom doit également échouer", async function () {
            await expect(investmentNFT.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, addr2.address, 1))
                .to.be.revertedWith("Transferts interdits : les parts DARVEST sont liees a votre identite.");
        });

        it("L'approbation (approve) ne sert à rien si les transferts sont bloqués", async function () {
            // Même si approuvé, le transfert final via _update échouera.
            await investmentNFT.connect(addr1).approve(addr2.address, 1);
            await expect(investmentNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1))
                .to.be.revertedWith("Transferts interdits : les parts DARVEST sont liees a votre identite.");
        });
    });

    // --- 6. Contrôle d'Accès et Cas Limites ---
    describe("Contrôle d'accès et cas limites", function () {
        it("N'importe qui peut appeler mintInvestmentNFT (selon la logique actuelle)", async function () {
            // Dans cet atelier, le mint est public. On vérifie que addr2 peut minter.
            await expect(investmentNFT.connect(addr2).mintInvestmentNFT(500))
                .to.not.be.reverted;
        });

        it("Devrait gérer des montants d'investissement très élevés", async function () {
            const largeAmount = ethers.parseEther("1000000"); // 1 million
            await investmentNFT.connect(addr1).mintInvestmentNFT(largeAmount);
            expect(await investmentNFT.getInvestmentAmount(1)).to.equal(largeAmount);
        });

        it("getInvestmentAmount doit rejeter les IDs non valides", async function () {
            await expect(investmentNFT.getInvestmentAmount(500))
                .to.be.revertedWithCustomError(investmentNFT, "ERC721NonexistentToken");
        });
    });
});