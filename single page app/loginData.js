// src/js/loginData.js — données de test et logique de la vue « login ».
// Enregistré dans main.js :   Alpine.data('loginData', loginData);
// Utilisé dans views/login.html :   <div x-data="loginData()" ...>
//
// Tout ce qui est « donnée » (textes de marque, comptes de démonstration, page d'arrivée) est ici, dans le
// x-data, pour être remplacé plus tard par l'API. login.html ne contient que l'interface.
import moment from 'moment';

// ------------------------------------------------------------------ données de test
export const loginTestData = {
  // page à afficher une fois connecté : une valeur de « page » dans appData (index.html : x-show="page === '…'")
  redirectTo: 'dashboard',

  // false = comme la maquette : aucune vérification, le bouton ouvre simplement l'application.
  // true  = les identifiants doivent correspondre à un compte de démonstration ci-dessous.
  strict: false,
  // clé de session posée en mode strict (la personne connectée) ; mettez la vôtre
  sessionKey: 'maser-user',

  company: 'Maser Engineering',

  brand: {
    eyebrow: 'Project management',
    title: 'Every project, task and test, in one place.',
    text: 'Follow progress, plan your teams and keep clients informed — from the first study to commissioning.',
    features: [
      'Real-time project and milestone tracking',
      'Team schedules and role-based access',
      'Contract amendments and test campaigns',
    ],
  },

  help: 'Need access? Contact your administrator.',

  // comptes de démonstration (mot de passe : demo) — mêmes personnes que le jeu de données de l'application
  accounts: [
    { userId: 'u1', name: 'Karim Maser',    role: 'Admin',        email: 'karim.maser@maser-engineering.com',    password: 'demo' },
    { userId: 'u2', name: 'Sophie Laurent', role: 'Manager',      email: 'sophie.laurent@maser-engineering.com', password: 'demo' },
    { userId: 'u6', name: 'Nora Haddad',    role: 'Manager',      email: 'nora.haddad@maser-engineering.com',    password: 'demo' },
    { userId: 'u3', name: 'Julien Moreau',  role: 'Collaborator', email: 'julien.moreau@maser-engineering.com',  password: 'demo' },
    { userId: 'u4', name: 'Amina Benali',   role: 'Collaborator', email: 'amina.benali@maser-engineering.com',   password: 'demo' },
    { userId: 'u5', name: 'Lucas Petit',    role: 'Collaborator', email: 'lucas.petit@maser-engineering.com',    password: 'demo' },
    { userId: 'u7', name: 'Marc Fontaine',  role: 'Client',       email: 'marc.fontaine@heliosenergy.com',       password: 'demo' },
  ],
};

// ------------------------------------------------------------------ x-data « loginData »
export default function loginData() {
  return {
    ...loginTestData,

    // état du formulaire
    email: '',
    password: '',
    showPassword: false,
    remember: true,
    error: '',
    year: moment().format('YYYY'),

    // texte du pied du panneau de marque
    get copyright() { return `© ${this.year} ${this.company}. All rights reserved.`; },

    enter() {
      this.error = '';

      if (this.strict) {
        const email = this.email.trim().toLowerCase();
        const account = this.accounts.find((a) => a.email === email && a.password === this.password);
        if (!account) { this.error = 'Incorrect email or password.'; return; }
        // « Keep me signed in » : localStorage ; sinon sessionStorage (disparaît à la fermeture de l'onglet)
        try { (this.remember ? localStorage : sessionStorage).setItem(this.sessionKey, account.userId); } catch (_) {}
      }

      this.go(this.redirectTo);
    },

    // Navigation dans la SPA (pas de rechargement : Apps Script sert l'application dans une iframe).
    //  1. l'évènement « navigate » remonte jusqu'au <body> d'index.html (@navigate="page = $event.detail.page")
    //  2. si « page » est visible depuis ce composant (appData le fournit), on la change aussi directement
    go(page) {
      this.$dispatch('navigate', { page });
      if ('page' in this) this.page = page;
    },

    // remplit le formulaire avec un compte de démonstration (pratique pendant le développement)
    useAccount(userId) {
      const a = this.accounts.find((x) => x.userId === userId);
      if (a) { this.email = a.email; this.password = a.password; }
    },
  };
}
