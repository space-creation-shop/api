class Marche {
  constructor() {
    this.menages = [];
    this.administrations = [];
    this.banques = [];
    this.biens = [];
  }

  ajouterMenage(menage) {
    this.menages.push(menage);
  }

  ajouterAdministration(administration) {
    this.administrations.push(administration);
  }

  ajouterBanque(banque) {
    this.banques.push(banque);
  }

  ajouterBien(bien) {
    this.biens.push(bien);
  }

  afficherMenages() {
    console.log("Menages :");
    this.menages.forEach(menage => console.log(menage));
  }

  afficherAdministrations() {
    console.log("Administrations :");
    this.administrations.forEach(administration => console.log(administration));
  }

  afficherBanques() {
    console.log("Banques :");
    this.banques.forEach(banque => console.log(banque));
  }

  afficherBiens() {
    console.log("Biens :");
    this.biens.forEach(bien => console.log(bien));
  }

  echange(menage, administration, montant) {
    if (menage.revenu >= montant) {
      menage.revenu -= montant;
      administration.budget += montant;
      console.log(`Echange entre ${menage.nom} et ${administration.nom} : ${montant}`);
    } else {
      console.log(`Echange impossible entre ${menage.nom} et ${administration.nom} : solde insuffisant`);
    }
  }

  credit(menage, banque, montant, duree) {
    if (banque.capital >= montant) {
      menage.revenu += montant;
      banque.capital -= montant;
      menage.credits.push({ banque, montant, duree, reste: montant });
      console.log(`Credit entre ${menage.nom} et ${banque.nom} : ${montant} pour ${duree} mois`);
    } else {
      console.log(`Credit impossible entre ${menage.nom} et ${banque.nom} : capital insuffisant`);
    }
  }

  rembourserCredit(menage, banque, montant) {
    const credit = menage.credits.find(c => c.banque === banque);
    if (credit) {
      if (menage.revenu >= montant) {
        menage.revenu -= montant;
        banque.capital += montant;
        credit.reste -= montant;
        if (credit.reste <= 0) {
          menage.credits = menage.credits.filter(c => c !== credit);
        }
        console.log(`Remboursement de credit entre ${menage.nom} et ${banque.nom} : ${montant}`);
      } else {
        console.log(`Remboursement impossible de credit entre ${menage.nom} et ${banque.nom} : solde insuffisant`);
      }
    } else {
      console.log(`Credit inexistant entre ${menage.nom} et ${banque.nom}`);
    }
  }

  achat(menage, bien, prix) {
    if (menage.revenu >= prix) {
      menage.revenu -= prix;
      console.log(`Achat de ${bien.nom} par ${menage.nom} : ${prix}`);
    } else {
      console.log(`Achat impossible de ${bien.nom} par ${menage.nom} : solde insuffisant`);
    }
  }
}

class Menage {
  constructor(nom, revenu) {
    this.nom = nom;
    this.revenu = revenu;
    this.credits = [];
  }

  toString() {
    return `Menage : ${this.nom}, Revenu : ${this.revenu}`;
  }
}

class Administration {
  constructor(nom, budget) {
    this.nom = nom;
    this.budget = budget;
  }

  toString() {
    return `Administration : ${this.nom}, Budget : ${this.budget}`;
  }
}

class Banque {
  constructor(nom, capital) {
    this.nom = nom;
    this.capital = capital;
  }

  toString() {
    return `Banque : ${this.nom}, Capital : ${this.capital}`;
  }
}

class Bien {
  constructor(nom, prix) {
    this.nom = nom;
    this.prix = prix;
  }

  toString() {
    return `Bien : ${this.nom}, Prix : ${this.prix}`;
  }
}

// Exemple d'utilisation
const marche = new Marche();

const menage1 = new Menage("Menage 1", 5000);
const menage2 = new Menage("Menage 2", 3000);

const administration1 = new Administration("Administration 1", 100000);
const administration2 = new Administration("Administration 2", 50000);

const banque1 = new Banque("Banque 1", 1000000);
const banque2 = new Banque("Banque 2", 500000);

const bien1 = new Bien("Bien 1", 200000);
const bien2 = new Bien("Bien 2", 150000);

marche.ajouterMenage(menage1);
marche.ajouterMenage(menage2);

marche.ajouterAdministration(administration1);
marche.ajouterAdministration(administration2);

marche.ajouterBanque(banque1);
marche.ajouterBanque(banque2);

marche.ajouterBien(bien1);
marche.ajouterBien(bien2);

marche.credit(menage1, banque1, 10000, 12);
marche.rembourserCredit(menage1, banque1, 500);
marche.echange(menage1, administration1, 1000);
marche.achat(menage1, bien1, 200000);

marche.afficherMenages();
marche.afficherAdministrations();
marche.afficherBanques();
marche.afficherBiens();




