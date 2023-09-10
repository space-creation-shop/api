const { v4: uuidv4 } = require('uuid');

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

module.exports = BankAccount; // Exportez la classe BankAccount pour pouvoir l'utiliser dans d'autres fichiers
