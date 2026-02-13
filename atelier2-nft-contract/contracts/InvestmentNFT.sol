// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InvestmentNFT
 * @dev Ce contrat transforme les parts d'investissement en jetons non-fongibles (NFT).
 * 
 * --- POURQUOI UTILISER DES NFTS POUR LE SUIVI DES INVESTISSEMENTS ? ---
 * 1. Traçabilité unique : Chaque part d'investissement est identifiée par un ID unique.
 * 2. Preuve de propriété : Le détenteur du NFT possède la preuve mathématique de sa part.
 * 3. Standardisation : Utiliser l'ERC721 permet l'interopérabilité avec les portefeuilles (MetaMask)
 *    et les futurs outils de l'écosystème DARVEST.
 * 
 * --- LIEN AVEC LE CAS D'USAGE DARVEST ---
 * Dans le projet DARVEST, ces NFTs représentent des parts de projets réels (immobilier, agriculture, etc.).
 * Contrairement à une simple ligne dans une base de données, le NFT est "incassable", 
 * auditable par tous sur la blockchain, et appartient réellement à l'investisseur.
 * 
 * --- AVANTAGES PAR RAPPORT À UNE BASE DE DONNÉES CLASSIQUE ---
 * - Transparence : Personne ne peut manipuler les montants en secret.
 * - Auditabilité : N'importe quel tiers peut vérifier le nombre total de parts émises.
 * - Résilience : Les données ne dépendent pas d'un serveur central qui pourrait s'arrêter.
 */
contract InvestmentNFT is ERC721, Ownable {
    // --- Stockage ---

    // Mapping pour associer chaque Token ID à son montant d'investissement initial.
    mapping(uint256 => uint256) private _investmentAmounts;

    // Compteur interne pour les IDs de tokens.
    uint256 private _tokenIdCounter;

    // Cumul total des investissements enregistrés via ce contrat.
    uint256 private _totalInvestment;

    // --- Événements ---

    /**
     * @dev Émis lors de la création (mint) d'une nouvelle part d'investissement.
     * @param investor L'adresse de l'investisseur recevant le NFT.
     * @param tokenId L'identifiant unique de la part.
     * @param amount Le montant investi associé à ce NFT.
     */
    event NFTMinted(address indexed investor, uint256 tokenId, uint256 amount);

    // --- Constructeur ---

    /**
     * @dev Initialise le contrat avec un nom et un symbole personnalisables.
     * @param initialOwner L'adresse qui aura les droits d'administration.
     * @param name Le nom de la collection NFT.
     * @param symbol Le symbole de la collection NFT.
     */
    constructor(address initialOwner, string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(initialOwner) 
    {}

    // --- Fonctions Principales ---

    /**
     * @dev Crée (mint) un nouveau NFT représentant une part d'investissement.
     * @param investmentAmount Le montant de l'investissement à l'origine de cette part.
     * @return Le Token ID généré.
     */
    function mintInvestmentNFT(uint256 investmentAmount) public returns (uint256) {
        require(investmentAmount > 0, "Le montant doit etre superieur a zero.");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        // On enregistre les données d'investissement avant de minter.
        _investmentAmounts[newTokenId] = investmentAmount;
        _totalInvestment += investmentAmount;

        // Création du NFT pour l'appelant.
        _safeMint(msg.sender, newTokenId);

        emit NFTMinted(msg.sender, newTokenId, investmentAmount);

        return newTokenId;
    }

    /**
     * @dev Retourne le montant d'investissement associé à un NFT spécifique.
     * @param tokenId L'identifiant du token à consulter.
     */
    function getInvestmentAmount(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return _investmentAmounts[tokenId];
    }

    /**
     * @dev Retourne le nombre total de NFTs (parts) créés.
     */
    function getTotalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Retourne le montant total investi à travers tous les NFTs.
     */
    function getTotalInvestment() public view returns (uint256) {
        return _totalInvestment;
    }

    /**
     * @dev Retourne l'URI des métadonnées pour un token donné.
     * @param tokenId L'identifiant du token.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        // Pour cet atelier, nous utilisons un préfixe statique.
        // Dans un projet réel, cela pointerait vers un serveur ou IPFS.
        return string(abi.encodePacked("https://api.darvest.io/metadata/share/", _toString(tokenId)));
    }

    // --- Sécurité et Restrictions (Soulbound) ---

    /**
     * @dev Override de la fonction _update pour empêcher le transfert des NFTs.
     * Les parts d'investissement sont nominatives et liées à l'investisseur (Soulbound).
     * Les seuls transferts autorisés sont la création (mint) et la destruction (burn).
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Si 'from' n'est pas l'adresse zéro ET que 'to' n'est pas l'adresse zéro,
        // c'est une tentative de transfert entre deux portefeuilles.
        if (from != address(0) && to != address(0)) {
            revert("Transferts interdits : les parts DARVEST sont liees a votre identite.");
        }
        
        return super._update(to, tokenId, auth);
    }

    // Fonction utilitaire interne pour convertir uint en string (utilisée pour tokenURI)
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
