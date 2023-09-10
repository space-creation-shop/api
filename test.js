const SimpleJsonDB = require('simple-json-db');
const BankAccount = require('./bank-account'); // Assurez-vous d'avoir le fichier bank-account.js dans le même répertoire
const Enterprise = require('./entreprise'); // Assurez-vous d'avoir le fichier enterprise.js dans le même répertoire

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
    this.bankAccounts = this.db.get('bankAccounts') ||[]
    this.enterprises = []
    this.historiquePrix = this.db.get('historiquePrix')||[];
    this.coursEntreprises = this.db.get('coursEntreprises')||[];
  }
  getBalance(accountId) {
    const account = this.bankAccounts.find((acc) => acc.id === accountId);
    if (account) {
      return account.getBalance();
    } else {
      return "Invalid account ID.";
    }
  }
  addEnterprise(name, initialStockPrice) {
    const enterprise = new Enterprise(name, initialStockPrice);
    this.enterprises.push(enterprise);
    this.saveEnterprises(); // Sauvegardez les entreprises dans la base de données
    return `Enterprise ${name} added.`;
  }
  addBankAccount(initialBalance = 0) {
    const newAccount = new BankAccount(initialBalance);
    this.bankAccounts.push(newAccount);
    this.saveBankAccounts();
    return newAccount.id;
  }
  saveHistoriquePrix() {
    try {
      this.historiquePrix.push(this.prixActuel);
      this.db.set('historiquePrix', this.historiquePrix);
      console.log('Historique des prix enregistré.');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'historique des prix :', error);
    }
  }

  // Méthode pour enregistrer le cours des entreprises dans la base de données
  saveCours() {
    try {
      this.db.set('coursEntreprises', this.enterprises);
      console.log('Cours des entreprises enregistré.');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du cours des entreprises :', error);
    }
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
    this.saveHistoriquePrix()
    const random = Math.random();
  
    if (random < this.poidsMontee) {
      this.prixActuel *= 1.02; // Augmentation de 2%
    } else if (random < this.poidsMontee + this.poidsDescente) {
      this.prixActuel *= 0.98; // Diminution de 2%
    }
  
    this.prixActuel *= (1 - this.quantiteEnCirculation / this.maxqqt);
  
    if (this.prixActuel > this.prixInitial) {
      this.poidsMontee -= 0.01; // Réduction du poids de la montée
      this.poidsDescente += 0.01; // Augmentation du poids de la descente
    } else {
      this.poidsMontee += 0.01; // Augmentation du poids de la montée
      this.poidsDescente -= 0.01; // Réduction du poids de la descente
    }
  
    this.poidsMontee = Math.max(0, Math.min(1, this.poidsMontee)); // Limitez les poids entre 0 et 1
    this.poidsDescente = Math.max(0, Math.min(1, this.poidsDescente));
  
    // Maintenant, mettez à jour les prix des entreprises dans la liste des entreprises
    const priceChange = this.prixActuel - this.prixInitial;
    this.enterprises.forEach((enterprise) => {
      if (priceChange > 0) {
        enterprise.updateStockPrice(enterprise.stockPrice + priceChange);
      } else if (priceChange < 0) {
        const absPriceChange = Math.abs(priceChange);
        enterprise.updateStockPrice(Math.max(0, enterprise.stockPrice - absPriceChange));
      }
    });
  
    // Enregistrez les modifications dans la base de données
    this.saveEnterprises();
  }
  

  updateEnterpriseStockPrice(enterpriseIndex, newPrice) {
    const enterprise = this.enterprises[enterpriseIndex];
    if (enterprise) {
      enterprise.updateStockPrice(newPrice);
      this.saveEnterprises();
      console.log(`Stock price for ${enterprise.name} updated to $${newPrice.toFixed(2)}.`);
    } else {
      console.log("Invalid enterprise index.");
    }
  }

  getEnterpriseStockPrice(enterpriseIndex) {
    const enterprise = this.enterprises[enterpriseIndex];
    return enterprise ? enterprise.stockPrice.toFixed(2) : "Invalid enterprise index.";
  }

  buyShares(accountId, enterpriseIndex, amount) {
    const account = this.bankAccounts.find((acc) => acc.id === accountId);
    const enterprise = this.enterprises[enterpriseIndex];
  
    if (!account || !enterprise) {
      console.log("Invalid account ID or enterprise index.");
      return false;
    }
  
    const totalCost = enterprise.stockPrice * amount;
  
    if (account.balance >= totalCost && enterprise.buyShares(amount)) {
      // Déduction du coût total du compte bancaire
      account.balance -= totalCost;
  
      // Mise à jour de la base de données pour le compte bancaire
      this.saveBankAccounts();
  
      // Mise à jour de la base de données pour l'entreprise
      this.saveEnterprises();
  
      console.log(`Purchase of ${amount} shares of ${enterprise.name} successful.`);
      return true;
    } else {
      console.log(`Purchase failed. Insufficient balance or available shares.`);
      return false;
    }
  }
  

  sellShares(accountId, enterpriseIndex, amount) {
    // Votre code pour vendre des actions ici
    // N'oubliez pas de mettre à jour les comptes bancaires, les entreprises et la base de données
  }

  saveBankAccounts() {
    this.db.set('bankAccounts', this.bankAccounts);
  }

  saveEnterprises() {
    this.db.set('enterprises', this.enterprises);
  }

  closeApp() {
    this.saveBankAccounts()
    this.saveEnterprises()
    console.log('Application closed.');
  }
  createBotAccount(initialBalance = 0) {
    const botAccount = new BankAccount(initialBalance);
    this.bankAccounts.push(botAccount);
    return botAccount.id;
  }
  saveBotAccount(botAccountId) {
    const botAccount = this.bankAccounts.find((account) => account.id === botAccountId);
    if (botAccount) {
      try {
        // Mettre à jour le compte bancaire du bot dans la liste des comptes bancaires
        const botAccountIndex = this.bankAccounts.findIndex((account) => account.id === botAccountId);
        if (botAccountIndex !== -1) {
          this.bankAccounts[botAccountIndex] = botAccount;
        }

        // Enregistrer la liste mise à jour des comptes bancaires dans la base de données
        this.db.set('bankAccounts', this.bankAccounts);

        console.log(`Bot account ${botAccountId} saved successfully.`);
      } catch (error) {
        console.error('Error while saving bot account:', error);
      }
    } else {
      console.error(`Bot account ${botAccountId} not found.`);
    }
  }

  // ...



}
 // Exportez la classe Bourse pour pouvoir l'utiliser dans d'autres fichiers

  
  // Exemple d'utilisation :
  const bourse = new Bourse("listembour", 100, 100, 500);
  
  const account1Id = bourse.addBankAccount(1000);
  const account2Id = bourse.addBankAccount(2000);
  
  // ... Ajoutez d'autres fonctionnalités et utilisez les méthodes de la classe Bourse ...
  
  // Fermez l'application lorsque vous avez terminé

  

// Exemple d'utilisation :


bourse.addEnterprise("Company A", 100);
bourse.addEnterprise("Company B", 200);

// ... Utilisez d'autres fonctionnalités de la classe Bourse ...

// Fermez l'application lorsque vous avez terminé


// Créez une instance de la classe Bourse


// Créez un compte bancaire pour le bot avec un solde initial de 1000



// Créez un objet pour enregistrer les prix initiaux de chaque entreprise
const initialPrices = {};

// Enregistrez les prix initiaux au démarrage du bot
bourse.enterprises.forEach((enterprise, enterpriseIndex) => {
  bourse.genererPrixAleatoire()
  if (enterprise) {
    initialPrices[enterpriseIndex] = enterprise.stockPrice;
  }
});

// Exemple d'utilisation :

const botAccountId = bourse.createBotAccount(50000000000000)

// Fonction pour que le bot prenne des décisions d'achat et de vente en fonction du pourcentage de changement
function makeBotDecisionsBasedOnPercentageChange() {
  bourse.saveBotAccount(botAccountId);
  bourse.enterprises.forEach((enterprise, enterpriseIndex) => {
 
  });
}
function makeBotDecisionsBasedOnPercentageChange() {
  bourse.saveBotAccount(botAccountId);

  for (let enterpriseIndex = 0; enterpriseIndex < bourse.enterprises.length; enterpriseIndex++) {
    const enterprise = bourse.enterprises[enterpriseIndex];
    console.log(enterprise)
    if (!enterprise) {
      console.log(`Invalid enterprise at index ${enterpriseIndex}.`);
      continue; // Passe à l'entreprise suivante en cas d'entreprise invalide
    }
    if (!enterprise) {
      console.log(`Invalid enterprise index for enterprise at index ${enterpriseIndex}.`);
      continue
      ;
    }

    // Calculez le pourcentage de changement par rapport au prix initial
    const initialPrice = initialPrices[enterpriseIndex];
    const currentPrice = enterprise.stockPrice;
    const percentageChange = ((currentPrice - initialPrice) / initialPrice) * 100;

    // Simulez la logique de décision du bot en fonction du pourcentage de changement.
    // Exemple : le bot achète autant d'actions que possible si le prix a baissé de 5% ou plus.

    if (percentageChange <= -5) {
      const currentSharesAvailable = enterprise.getAvailableShares(); // Nombre d'actions disponibles

      if (currentSharesAvailable > 0) {
        const amountToBuy = currentSharesAvailable; // Achetez autant d'actions que possible
        const totalCost = enterprise.stockPrice * amountToBuy;

        if (totalCost <= bourse.getBalance(botAccountId)) {
          const purchaseSuccess = bourse.buyShares(botAccountId, enterpriseIndex, amountToBuy);

          if (purchaseSuccess) {
            console.log(`Bot bought ${amountToBuy} shares of ${enterprise.name} at $${enterprise.stockPrice.toFixed(2)} each.`);
          } else {
            console.log("Bot purchase failed.");
          }
        } else {
          console.log(`Bot cannot buy shares of ${enterprise.name} due to insufficient funds.`);
        }
      } else {
        console.log(`Bot cannot buy shares of ${enterprise.name} due to insufficient available shares.`);
      }
    } else if (percentageChange >= 10) {
      const currentShares = enterprise.getAvailableShares();
      const amountToSell = currentShares;
      const earnings = enterprise.stockPrice * amountToSell;
      bourse.sellShares(botAccountId, enterpriseIndex, amountToSell);
      console.log(`Bot sold ${amountToSell} shares of ${enterprise.name} at $${enterprise.stockPrice.toFixed(2)} each and earned $${earnings.toFixed(2)}.`);
    }
    // ... (le reste de la logique de décision du bot)

    // Si vous voulez que le bot examine toutes les entreprises, vous pouvez supprimer la logique de décision ci-dessous et la remplacer par la vôtre.
  }
}




// Simulez les décisions du bot à intervalles réguliers (par exemple, toutes les secondes)
setInterval(makeBotDecisionsBasedOnPercentageChange, 1000);

// N'oubliez pas de fermer l'application lorsque vous avez terminé
setTimeout(() => {
  bourse.closeApp();
}, 10000); // Par exemple, fermez l'application après 10 secondes
