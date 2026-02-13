const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Suite de tests pour le contrat InvestmentStorage
 * @dev Ces tests couvrent les fonctionnalités de déploiement, d'enregistrement,
 *      de lecture, de contrôle d'accès et les cas limites.
 */
describe("InvestmentStorage", function () {
    let InvestmentStorage;
    let investmentStorage;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    // Déploiement du contrat avant chaque test pour garantir l'indépendance
    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        InvestmentStorage = await ethers.getContractFactory("InvestmentStorage");
        investmentStorage = await InvestmentStorage.deploy(owner.address);
        await investmentStorage.waitForDeployment();
    });

    // --- 1. Tests de Déploiement ---
    describe("Déploiement", function () {
        it("Devrait déployer le contrat avec succès", async function () {
            expect(investmentStorage.target).to.be.properAddress;
        });

        it("Devrait définir le propriétaire (owner) correctement", async function () {
            expect(await investmentStorage.owner()).to.equal(owner.address);
        });

        it("L'état initial doit être correct (0 investisseur)", async function () {
            expect(await investmentStorage.getTotalInvestors()).to.equal(0);
        });
    });

    // --- 2. Tests d'enregistrement d'investissement ---
    describe("Enregistrement d'investissement", function () {
        it("Devrait enregistrer un investissement valide", async function () {
            const amount = ethers.parseEther("1.0");
            await expect(investmentStorage.connect(addr1).setInvestment(amount, { value: amount }))
                .to.emit(investmentStorage, "InvestmentRecorded")
                .withArgs(addr1.address, amount);
        });

        it("Devrait rejeter un investissement avec un montant de zéro", async function () {
            await expect(investmentStorage.connect(addr1).setInvestment(0, { value: 0 }))
                .to.be.revertedWith("Investment amount must be greater than zero.");
        });

        it("Devrait incrémenter le compteur d'investisseurs uniques", async function () {
            await investmentStorage.connect(addr1).setInvestment(ethers.parseEther("1"), { value: ethers.parseEther("1") });
            await investmentStorage.connect(addr2).setInvestment(ethers.parseEther("2"), { value: ethers.parseEther("2") });
            expect(await investmentStorage.getTotalInvestors()).to.equal(2);
        });

        it("Ne devrait pas incrémenter le compteur pour un investisseur récurrent", async function () {
            await investmentStorage.connect(addr1).setInvestment(ethers.parseEther("1"), { value: ethers.parseEther("1") });
            await investmentStorage.connect(addr1).setInvestment(ethers.parseEther("1"), { value: ethers.parseEther("1") });
            expect(await investmentStorage.getTotalInvestors()).to.equal(1);
        });
    });

    // --- 3. Tests de lecture des investissements ---
    describe("Lecture d'investissement", function () {
        it("Devrait permettre de lire son propre investissement", async function () {
            const amount = ethers.parseEther("5");
            await investmentStorage.connect(addr1).setInvestment(amount, { value: amount });
            expect(await investmentStorage.getInvestment(addr1.address)).to.equal(amount);
        });

        it("Devrait permettre de lire l'investissement d'une autre adresse", async function () {
            const amount = ethers.parseEther("3");
            await investmentStorage.connect(addr1).setInvestment(amount, { value: amount });
            expect(await investmentStorage.connect(addr2).getInvestment(addr1.address)).to.equal(amount);
        });

        it("Devrait retourner 0 pour une adresse qui n'a pas investi", async function () {
            expect(await investmentStorage.getInvestment(addr3.address)).to.equal(0);
        });
    });

    // --- 4. Tests de contrôle d'accès ---
    describe("Contrôle d'accès", function () {
        it("Le propriétaire peut retirer les fonds", async function () {
            const amount = ethers.parseEther("10");
            await investmentStorage.connect(addr1).setInvestment(amount, { value: amount });
            
            await expect(investmentStorage.connect(owner).withdrawFunds())
                .to.emit(investmentStorage, "FundsWithdrawn")
                .withArgs(owner.address, amount);
        });

        it("Un non-propriétaire ne peut pas retirer les fonds", async function () {
            const amount = ethers.parseEther("1");
            await investmentStorage.connect(addr1).setInvestment(amount, { value: amount });

            await expect(investmentStorage.connect(addr1).withdrawFunds())
                .to.be.revertedWithCustomError(investmentStorage, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });
    });

    // --- 5. Cas limites et gestion des erreurs ---
    describe("Cas limites", function () {
        it("Cumul de plusieurs investissements de la même adresse", async function () {
            const amount1 = ethers.parseEther("1");
            const amount2 = ethers.parseEther("2");
            await investmentStorage.connect(addr1).setInvestment(amount1, { value: amount1 });
            await investmentStorage.connect(addr1).setInvestment(amount2, { value: amount2 });
            
            expect(await investmentStorage.getInvestment(addr1.address)).to.equal(amount1 + amount2);
        });

        it("Gestion des grands nombres (montant élevé sans transfert excessif de valeur)", async function () {
            // On teste la capacité de stockage de uint256
            const veryLargeAmount = BigInt("1000000000000000000000000"); // 10^24
            // On n'envoie pas forcément cette valeur en ETH pour éviter les erreurs de solde, 
            // le contrat utilise le paramètre amount pour le mapping.
            await investmentStorage.connect(addr1).setInvestment(veryLargeAmount, { value: 0 });
            expect(await investmentStorage.getInvestment(addr1.address)).to.equal(veryLargeAmount);
        });

        it("Rejet du retrait si le contrat est vide", async function () {
            await expect(investmentStorage.connect(owner).withdrawFunds())
                .to.be.revertedWith("No funds to withdraw.");
        });

        it("Rejet de l'adresse zéro pour getInvestment", async function () {
            await expect(investmentStorage.getInvestment(ethers.ZeroAddress))
                .to.be.revertedWith("Investor address cannot be the zero address.");
        });
    });
});
