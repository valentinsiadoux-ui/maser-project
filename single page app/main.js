import './css/main.css';
import './css/login.css'; // styles propres à la vue login (views/login.html est un fragment : pas de <link> possible)
import 'flyonui/flyonui';
import moment from 'moment';
import Alpine from 'alpinejs';

// 1. Components import
import appData from './js/appData.js';
import loginData from './js/loginData.js';

window.moment = moment;

// 2. Initialize Alpine.js with the imported components
document.addEventListener('alpine:init', () => {
  Alpine.data('appData', appData);
  Alpine.data('loginData', loginData);
});

window.Alpine = Alpine;
Alpine.start();
