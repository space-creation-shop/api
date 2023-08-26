const { v4: uuidv4 } = require('uuid');
const SimpleJsonDB = require('simple-json-db');



class BankAccount {
  constructor(initialBalance = 0) {
    this.id = uuidv4();
    this.balance = initialBalance;
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
}

module.exports = BankAccount;


class Enterprise {
    constructor(name, initialStockPrice) {
      this.name = name;
      this.stockPrice = initialStockPrice;
      this.availableShares = 100;
    }
  
    updateStockPrice(newPrice) {
      this.stockPrice = newPrice;
    }
  
    getStockPrice() {
      return this.stockPrice.toFixed(2);
    }
  
    buyShares(amount) {
      if (amount <= this.availableShares) {
        this.availableShares -= amount;
        return true;
      } else {
        return false;
      }
    }
  
    sellShares(amount) {
      this.availableShares += amount;
    }
  
    getAvailableShares() {
      return this.availableShares;
    }
  }

 

  class Bourse {
    constructor(nomMonnaie, prixInitial, quantiteEnCirculation, maxqqt) {
      this.nomMonnaie = nomMonnaie;
      this.prixInitial = prixInitial;
      this.prixActuel = prixInitial;
      this.quantiteEnCirculation = quantiteEnCirculation;
      this.maxqqt = maxqqt;
      this.poidsMontee = 0.2;
      this.poidsDescente = 0.9;
  
      this.db = new SimpleJsonDB('database.json');
      this.bankAccounts = this.db.get('bankAccounts', []);
      this.enterprises = this.db.get('enterprises', []);
    }
  
    addBankAccount(initialBalance = 0) {
      const newAccount = {
        id: this.generateUniqueId(),
        balance: initialBalance,
      };
      this.bankAccounts.push(newAccount);
      this.saveBankAccounts();
      return newAccount.id;
    }
  
    generateUniqueId() {
      return Math.random().toString(36).substr(2, 9); // Crée un ID aléatoire
    }
  
    saveBankAccounts() {
      this.db.set('bankAccounts', this.bankAccounts).save();
    }
  
    deleteBankAccount(accountId) {
      const accountIndex = this.bankAccounts.findIndex((acc) => acc.id === accountId);
      if (accountIndex !== -1) {
        this.bankAccounts.splice(accountIndex, 1);
        this.saveBankAccounts();
        console.log(`Bank account ${accountId} has been deleted.`);
      } else {
        console.log("Account not found.");
      }
    }
  
    genererPrixAleatoire() {
      const random = Math.random() * 2;
  
      if (random < this.poidsMontee) {
        this.prixActuel *= 1.02;
      } else if (random < this.poidsMontee + this.poidsDescente) {
        this.prixActuel *= 0.98;
      }
  
      this.prixActuel *= 1 - this.quantiteEnCirculation / this.maxqqt;
  
      if (this.prixActuel > this.prixInitial) {
        this.poidsMontee -= 0.01;
        this.poidsDescente += 0.01;
      } else {
        this.poidsMontee += 0.01;
        this.poidsDescente -= 0.01;
      }
  
      this.poidsMontee = Math.max(0, Math.min(1, this.poidsMontee));
      this.poidsDescente = Math.max(0, Math.min(1, this.poidsDescente));
  
      const priceChange = this.prixActuel - this.prixInitial;
      this.enterprises.forEach((enterprise) => {
        if (priceChange > 0) {
          enterprise.stockPrice += priceChange;
        } else if (priceChange < 0) {
          const absPriceChange = Math.abs(priceChange);
          enterprise.stockPrice = Math.max(0, enterprise.stockPrice - absPriceChange);
        }
      });
  
      this.saveEnterprises();
    }
  
    // ... Autres méthodes de la classe Bourse ...
  
    saveEnterprises() {
      this.db.set('enterprises', this.enterprises).save();
    }
  
    // Méthode pour fermer l'application
    closeApp() {
      console.log('Application closed.');
    }
  }
  
  // Exemple d'utilisation :
  const bourse = new Bourse("BourseName", 100, 100, 500);
  
  const account1Id = bourse.addBankAccount(1000);
  const account2Id = bourse.addBankAccount(2000);
  
  // ... Ajoutez d'autres fonctionnalités et utilisez les méthodes de la classe Bourse ...
  
  // Fermez l'application lorsque vous avez terminé

  

// Exemple d'utilisation :


bourse.addEnterprise("Company A", 100);
bourse.addEnterprise("Company B", 200);

// ... Utilisez d'autres fonctionnalités de la classe Bourse ...

// Fermez l'application lorsque vous avez terminé
bourse.closeApp();
