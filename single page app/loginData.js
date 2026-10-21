// loginData.js — données de test et logique de la page de connexion (login.html)
//
// Tout ce qui est « donnée » (textes de marque, comptes de démonstration, redirection) est ici,
// pour être remplacé plus tard par l'API. Rien n'est lu en dur dans login.html, sauf l'interface
// (libellés des champs, boutons).
//
// Usage :   import { registerLogin } from './loginData.js';  registerLogin(Alpine);  Alpine.start();
//   - Alpine.store('login')  : contenu et données de test (lecture seule)   → $store.login.brand.title
//   - Alpine.data('login')   : état du formulaire et actions                → x-data="login"
import moment from 'moment';

// ------------------------------------------------------------------ données de test
export const loginTestData = {
  // vers où aller une fois connecté (SPA : adaptez à votre routeur, par ex. '/#/dashboard')
  redirectTo: '/',

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

// ------------------------------------------------------------------ état du formulaire (x-data="login")
export function loginComponent() {
  return {
    email: '',
    password: '',
    showPassword: false,
    remember: true,
    error: '',
    year: moment().format('YYYY'),

    // texte du pied du panneau de marque
    get copyright() { return `© ${this.year} ${this.$store.login.company}. All rights reserved.`; },

    enter() {
      const data = this.$store.login;
      this.error = '';

      if (data.strict) {
        const email = this.email.trim().toLowerCase();
        const account = data.accounts.find((a) => a.email === email && a.password === this.password);
        if (!account) { this.error = 'Incorrect email or password.'; return; }
        // « Keep me signed in » : localStorage ; sinon sessionStorage (disparaît à la fermeture de l'onglet)
        try { (this.remember ? localStorage : sessionStorage).setItem(data.sessionKey, account.userId); } catch (_) {}
      }

      window.location.href = data.redirectTo;
    },

    // remplit le formulaire avec un compte de démonstration (pratique pendant le développement)
    useAccount(userId) {
      const a = this.$store.login.accounts.find((x) => x.userId === userId);
      if (a) { this.email = a.email; this.password = a.password; }
    },
  };
}

// ------------------------------------------------------------------ enregistrement auprès d'Alpine
export function registerLogin(Alpine) {
  Alpine.store('login', loginTestData);
  Alpine.data('login', loginComponent);
}
