const SimpleJsonDB = require('simple-json-db');
const db = new SimpleJsonDB('enterpriseData.json'); // Créez une base de données pour stocker les données de l'entreprise

class Enterprise {
  constructor(name, initialStockPrice) {
    this.name = name;
    this.stockPrice = initialStockPrice;
    this.dbKey = name; // Utilisez le nom de l'entreprise comme clé dans la base de données
    this.availableShares = db.get(this.dbKey)||100 // Chargez le nombre d'actions disponibles depuis la base de données
  }

  updateStockPrice(newPrice) {
    this.stockPrice = newPrice;
  }

  getStockPrice() {
    return this.stockPrice.toFixed(2);
  }

  getAvailableShares() {
    return this.availableShares;
  }

  buyShares(amount) {
    if (amount <= this.availableShares) {
      this.availableShares -= amount;
      this.saveData(); // Mettez à jour la base de données après un achat
      return true; // Achat réussi
    } else {
      return false; // Actions disponibles insuffisantes
    }
  }

  sellShares(amount) {
    this.availableShares += amount;
    this.saveData(); // Mettez à jour la base de données après une vente
  }

  saveData() {
    // Enregistrez les données de l'entreprise dans la base de données
    db.set(this.dbKey, this);
  }

  // Ajoutez d'autres méthodes spécifiques à votre entreprise ici
}

module.exports = Enterprise; // Exportez la classe Enterprise pour pouvoir l'utiliser dans d'autres fichiers
