import './css/main.css';
import './css/ui.css';    // composants de l'application (ui-btn, ui-card…) : reprise exacte des maquettes
import './css/login.css'; // styles propres à la vue login (les vues sont des fragments : pas de <link> possible)
import 'flyonui/flyonui';
import moment from 'moment';
import Alpine from 'alpinejs';

// 1. Components import
import appData from './js/appData.js';
import { withDomain } from './js/domain.js';
import loginData from './js/loginData.js';
import shellData from './js/shellData.js';
import dashboardData from './js/dashboardData.js';

window.moment = moment;

// 2. Initialize Alpine.js with the imported components
document.addEventListener('alpine:init', () => {
  // appData (page courante) + domaine partagé (projets, droits, dates…) : visibles par toutes les vues imbriquées
  Alpine.data('appData', () => withDomain(appData()));
  Alpine.data('loginData', loginData);
  Alpine.data('shellData', shellData);
  Alpine.data('dashboardData', dashboardData);
});

window.Alpine = Alpine;
Alpine.start();
