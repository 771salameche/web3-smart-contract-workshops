// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InvestmentStorage
 * @dev Ce contrat permet de stocker les montants d'investissement pour chaque adresse de portefeuille
 *      et de suivre le nombre total d'investisseurs uniques. Seul le propriétaire peut
 *      effectuer des fonctions administratives comme le retrait des fonds.
 *      Ce contrat inclut la gestion des accès via OpenZeppelin Ownable et émet des événements
 *      pour toutes les actions importantes.
 */
contract InvestmentStorage is Ownable {
    // Mapping pour stocker le montant d'investissement de chaque adresse.
    // Chaque adresse peut enregistrer un montant, qui est cumulatif.
    mapping(address => uint256) private investments;

    // Mapping pour savoir si une adresse a déjà investi, afin de compter les investisseurs uniques.
    mapping(address => bool) private hasInvested;

    // Nombre total d'investisseurs uniques ayant effectué un investissement.
    uint256 private totalInvestors;

    // --- Événements ---

    /**
     * @dev Émis lorsque qu'un investissement est enregistré ou mis à jour par un utilisateur.
     * @param investor L'adresse de l'investisseur.
     * @param amount Le montant total investi par cet investisseur après cette transaction.
     */
    event InvestmentRecorded(address indexed investor, uint256 amount);

    /**
     * @dev Émis lorsque le propriétaire retire des fonds du contrat.
     * @param owner L'adresse du propriétaire ayant effectué le retrait.
     * @param amount Le montant retiré du contrat.
     */
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // --- Constructeur ---

    /**
     * @dev Le constructeur du contrat. Définit le déployeur du contrat comme propriétaire.
     * @param owner_ L'adresse qui deviendra le propriétaire du contrat.
     */
    constructor(address owner_) Ownable(owner_) {}

    // --- Fonctions Utilisateur ---

    /**
     * @dev Permet à un utilisateur d'enregistrer son montant d'investissement.
     *      L'utilisateur peut envoyer de l'ETH avec cette transaction.
     *      Si c'est le premier investissement de cette adresse, le nombre total d'investisseurs est incrémenté.
     *      Le montant investi est cumulatif.
     * @param amount Le montant d'investissement que l'utilisateur souhaite enregistrer ou ajouter.
     *      Doit être supérieur à zéro.
     */
    function setInvestment(uint256 amount) public payable {
        require(amount > 0, "Investment amount must be greater than zero.");
        
        // Validation pour s'assurer que l'adresse de l'appelant n'est pas l'adresse zéro
        // afin d'éviter les problèmes avec le mapping et les événements.
        require(msg.sender != address(0), "Sender address cannot be the zero address.");

        // Si l'investisseur est nouveau, incrémenter le compteur total.
        if (!hasInvested[msg.sender]) {
            hasInvested[msg.sender] = true;
            totalInvestors++;
        }

        investments[msg.sender] += amount; // Montant cumulatif
        emit InvestmentRecorded(msg.sender, investments[msg.sender]);
    }

    /**
     * @dev Permet à quiconque de vérifier le montant total investi par une adresse donnée.
     * @param investor L'adresse de l'investisseur dont on veut connaître le montant.
     *      Ne peut pas être l'adresse zéro.
     * @return Le montant total que l'investisseur spécifié a enregistré.
     */
    function getInvestment(address investor) public view returns (uint256) {
        require(investor != address(0), "Investor address cannot be the zero address.");
        return investments[investor];
    }

    /**
     * @dev Retourne le nombre total d'investisseurs uniques qui ont enregistré un investissement.
     * @return Le nombre total d'investisseurs.
     */
    function getTotalInvestors() public view returns (uint256) {
        return totalInvestors;
    }

    // --- Fonctions Propriétaire (Administratives) ---

    /**
     * @dev Permet au propriétaire du contrat de retirer tous les fonds (ETH) détenus par le contrat.
     *      Cette fonction ne peut être appelée que par le propriétaire.
     *      Elle envoie tous les ETH présents dans le contrat à l'adresse du propriétaire.
     */
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");
        
        // Transférer tous les fonds au propriétaire.
        // Utilisation de call pour une meilleure sécurité contre les attaques reentrancy.
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Failed to withdraw funds.");

        emit FundsWithdrawn(owner(), balance);
    }
}
