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

  getAvailableShares() {
    return this.availableShares;
  }

  buyShares(amount) {
    if (amount <= this.availableShares) {
      this.availableShares -= amount;
      return true; // Achat réussi
    } else {
      return false; // Actions disponibles insuffisantes
    }
  }

  sellShares(amount) {
    this.availableShares += amount;
  }

  // Ajoutez d'autres méthodes spécifiques à votre entreprise ici
}

module.exports = Enterprise; // Exportez la classe Enterprise pour pouvoir l'utiliser dans d'autres fichiers
