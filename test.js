const SimpleJsonDB = require('simple-json-db');
const BankAccount = require('./bank-account'); // Assurez-vous d'avoir le fichier bank-account.js dans le même répertoire
const Enterprise = require('./entreprise'); // Assurez-vous d'avoir le fichier enterprise.js dans le même répertoire

class Bourse {
  constructor(nomMonnaie, prixInitial, quantiteEnCirculation, maxqqt) {
    this.db = new SimpleJsonDB('database.json');
    this.historiquePrix = this.db.get('historiquePrix')||[];
    this.nomMonnaie = nomMonnaie;
    this.prixInitial = this.historiquePrix[this.historiquePrix.length-1]||prixInitial
    this.prixActuel = prixInitial;
    this.quantiteEnCirculation = quantiteEnCirculation;
    this.maxqqt = maxqqt;
    this.poidsMontee = 0.7;
    this.poidsDescente = 0.5;

    
    this.bankAccounts = this.db.get('bankAccounts') ||[]
    this.enterprises = []
    
    this.coursEntreprises = this.db.get('coursEntreprises')||[];
  }
  load=()=>{
    if(!this.db.get('enterprises')){
      return this
    }
    this.db.get('enterprises').map((item)=>{
      console.log(item)
      this.addenterprise(item.name,item.StockPrice)
    })
    return this
  }
  getBalance(accountId) {
    const account = this.bankAccounts.find((acc) => acc.id === accountId);
    if (account) {
      return account.getBalance();
    } else {
      return "Invalid account ID.";
    }
  }
  
    // ...
    
    addenterprise(name, initialStockPrice) {
      // Vérifiez si une entreprise avec le même nom existe déjà
      const existingEnterprise = this.enterprises.find((enterprise) => enterprise.name === name);
      
      if (existingEnterprise) {
        console.log(`An enterprise with the name "${name}" already exists.`);
        return null; // Retournez null pour indiquer qu'une entreprise avec le même nom existe déjà
      }
      
      const newEnterprise = new Enterprise(name, initialStockPrice);
      this.enterprises.push(newEnterprise);
      return newEnterprise;
    }
  
    // ...
  
  
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
     // console.log('Historique des prix enregistré.');
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
      this.saveHistoriquePrix();
      
      const historiquePrix = this.historiquePrix
  
      // Calculer la tendance basée sur l'historique des prix
      const historicalChange = historiquePrix.length > 1 ? historiquePrix[historiquePrix.length - 1] - historiquePrix[historiquePrix.length - 2] : 0;
      console.log(this)
      const random = Math.random();
  
      if (random < this.poidsMontee) {
        console.log("augmentation")
        this.prixActuel *= 1.01; // Augmentation de 2%
      } else   {
        console.log("diminution")
        this.prixActuel *= 0.99; // Diminution de 2%
      }
  
      
  
      if (this.prixActuel > this.prixInitial) {
        this.poidsMontee -= 0.01; // Réduction du poids de la montée
        this.poidsDescente += 0.01; // Augmentation du poids de la descente
      } else {
        this.poidsMontee += 0.01; // Augmentation du poids de la montée
        this.poidsDescente -= 0.01; // Réduction du poids de la descente
      }
  
      this.poidsMontee = Math.max(0, Math.min(1, this.poidsMontee)); // Limitez les poids entre 0 et 1
      this.poidsDescente = 1-this.poidsMontee
  
      // Maintenant, mettez à jour les prix des entreprises dans la liste des entreprises
      const priceChange = this.prixActuel - this.prixInitial;
      this.enterprises.forEach((enterprise) => {
        console.log(priceChange)
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
  
    
  
  
  
  

  updateStockPrice(enterprises, newPrice) {
    const enterprise = enterprises;
    if (enterprise) {
      enterprise.updateStockPrice(newPrice);
      this.saveEnterprises();
      console.log(`Stock price for ${enterprise.name} updated to ${newPrice.toFixed(2)}.`);
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

        //console.log(`Bot account ${botAccountId} saved successfully.`);
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

  module.exports=Bourse
  // Exemple d'utilisation :
  const bourse = new Bourse("listembourg", 100, 100, 500)
  bourse.load()
  
  const account1Id = bourse.addBankAccount(1000);
  const account2Id = bourse.addBankAccount(2000);
  
  // ... Ajoutez d'autres fonctionnalités et utilisez les méthodes de la classe Bourse ...
  
  // Fermez l'application lorsque vous avez terminé

  

// Exemple d'utilisation :


bourse.addenterprise("Company A", 100);
bourse.addenterprise("Company B", 200);

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



// Fonction pour que le bot prenne des décisions d'achat et de vente en fonction du pourcentage de changement
class Bot {
  constructor(bourse, initialPrices) {
    this.botAccountId = bourse.addBankAccount(5*10e6); // Créer un compte bancaire pour le bot
    this.bourse = bourse;
    this.initialPrices = initialPrices;
  }

  makeDecisionsBasedOnPercentageChange(enterprise) {
    const enterpriseIndex = this.bourse.enterprises.indexOf(enterprise);

    if (enterpriseIndex === -1) {
      console.log(`Enterprise not found in the bourse.`);
      return; // Sort de la fonction si l'entreprise n'est pas trouvée
    }

    this.bourse.saveBotAccount(this.botAccountId);
    this.bourse.saveBankAccounts()
    // Calculez le pourcentage de changement par rapport au prix initial
    const initialPrice = this.initialPrices[enterpriseIndex];
    const currentPrice = enterprise.stockPrice;
    const percentageChange = ((currentPrice - initialPrice) / initialPrice) * 100;

    // Simulez la logique de décision du bot en fonction du pourcentage de changement.
    // Exemple : le bot achète autant d'actions que possible si le prix a baissé de 5% ou plus.

    if (percentageChange <= -5) {
      const currentSharesAvailable = enterprise.getAvailableShares(); // Nombre d'actions disponibles

      if (currentSharesAvailable > 0) {
        const amountToBuy = currentSharesAvailable; // Achetez autant d'actions que possible
        const totalCost = enterprise.stockPrice * amountToBuy;

        if (totalCost <= this.bourse.getBalance(this.botAccountId)) {
          const purchaseSuccess = this.bourse.buyShares(this.botAccountId, enterpriseIndex, amountToBuy);

          if (purchaseSuccess) {
            console.log(`Bot bought ${amountToBuy} shares of ${enterprise.name} at $${enterprise.stockPrice.toFixed(2)} each.`);
          } else {
            console.log("Bot purchase failed.");
          }
        } else {
          console.log(`Bot cannot buy shares of ${enterprise.name} due to insufficient funds.`);
        }
      } else {
       // console.log(`Bot cannot buy shares of ${enterprise.name} due to insufficient available shares.`);
      }
    } else if (percentageChange >= 10) {
      const currentShares = enterprise.getAvailableShares();
      const amountToSell = currentShares;
      const earnings = enterprise.stockPrice * amountToSell;
      this.bourse.sellShares(this.botAccountId, enterpriseIndex, amountToSell);
    //  console.log(`Bot sold ${amountToSell} shares of ${enterprise.name} at $${enterprise.stockPrice.toFixed(2)} each and earned $${earnings.toFixed(2)}.`);
    }
  }
}

// Exemple d'utilisation :
const bot = new Bot(bourse, initialPrices);
setInterval(() => {
  bourse.genererPrixAleatoire()
  for (let index = 0; index < bourse.enterprises.length; index++) {
    const element = bourse.enterprises[index];
    bot.makeDecisionsBasedOnPercentageChange(element);
  } 
}, 1000);

// Remplacez par l'entreprise que vous souhaitez que le bot surveille

