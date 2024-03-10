const SimpleJsonDB = require('simple-json-db');
const db = new SimpleJsonDB('database.json'); // Créez une base de données pour stocker les prix des actions

// Fonction pour stocker les prix des actions
function setStockPrice(symbol, price) {
  const stockPrices = db.get('stockPrices',)||{};
  stockPrices[symbol] = price;
  db.set('stockPrices', stockPrices);
}

// Exemple : stockez le prix de l'action AAPL à 150.00 dollars
setStockPrice('AAPL', 150.00);

// Fonction pour calculer le montant de la vente en fonction du symbole de l'action et de la quantité
function calculateSaleAmount(symbol, quantity) {
  const stockPrices = db.get('stockPrices' )||{};
  
  // Vérifiez si le symbole de l'action existe dans les prix stockés
  if (symbol in stockPrices) {
    const pricePerShare = stockPrices[symbol];
    const saleAmount = pricePerShare * quantity;
    return saleAmount;
  } else {
    // Gérez le cas où le symbole de l'action n'est pas trouvé
    console.error(`Prix de l'action inconnu pour le symbole : ${symbol}`);
    return 0; // Aucune vente
  }
}

// Exemple d'utilisation de la fonction calculateSaleAmount
const saleAmount = calculateSaleAmount('AAPL', 10); // Calculez le montant de la vente de 10 actions AAPL
console.log(`Montant de la vente : $${saleAmount.toFixed(2)}`);
const { v4: uuidv4 } = require('uuid');

class BankAccount {
  constructor(initialBalance = 0) {
    this.id = uuidv4();
    this.balance = initialBalance;
    this.stocks = []; // Tableau pour stocker les actions
  }

  deposit(amount) {
    this.balance += amount;
  }

  withdraw(amount) {
    if (amount <= this.balance) {
      this.balance -= amount;
      return true; // Retrait réussi
    } else {
      return false; // Solde insuffisant
    }
  }

  getBalance() {
    return this.balance.toFixed(2);
  }

  // Méthode pour ajouter des actions au compte
  addStock(symbol, quantity) {
    this.stocks.push({ symbol, quantity });
  }

  // Méthode pour vérifier le nombre d'actions d'un symbole particulier
  getStockQuantity(symbol) {
    const stock = this.stocks.find((s) => s.symbol === symbol);
    return stock ? stock.quantity : 0;
  }

  // Méthode pour vendre des actions
  sellStock(symbol, quantity) {
    const stockIndex = this.stocks.findIndex((s) => s.symbol === symbol);

    if (stockIndex !== -1) {
      const stock = this.stocks[stockIndex];

      if (stock.quantity >= quantity) {
        // Réduire la quantité d'actions détenues
        stock.quantity -= quantity;

        // Mettre à jour le solde du compte en fonction du produit de la vente
        const saleAmount = calculateSaleAmount(symbol, quantity); // Vous devez implémenter cette fonction
        this.balance += saleAmount;

        // Supprimer l'entrée du tableau si la quantité est maintenant zéro
        if (stock.quantity === 0) {
          this.stocks.splice(stockIndex, 1);
        }

        return true; // Vente réussie
      }
    }

    return false; // Vente échouée (insuffisance d'actions ou symbole non trouvé)
  }
}

module.exports = BankAccount;
