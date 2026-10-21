// src/js/domain.js — état et logique PARTAGÉS par toutes les pages (personnes, droits, projets, dates…).
//
// Ils sont « mixés » dans le composant racine :   Alpine.data('appData', () => withDomain(appData()));
// Toutes les vues (login, shell, dashboard…) sont des x-data imbriqués : elles voient ces propriétés
// directement (projects, role, fd(), color(), TONES…), comme dans les maquettes.
// Les données de test sont dans data/seed.js ; les modifications faites dans l'application (tâches, tests,
// notes, réunions, hiérarchie) sont lues dans localStorage (mêmes clés que les maquettes).
import moment from 'moment';
import seed, { TODAY } from './data/seed.js';
import { PALETTE, TONES, ROLE_TONE, PRIORITY_TONE, TASK_TONE, PROJECT_TONE, DEADLINE, DEFAULT_USER } from './constants.js';

// dates affichées comme en-GB (« Sept »)
moment.updateLocale('en', { monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sept_Oct_Nov_Dec'.split('_') });

// pages dont la vue est déjà migrée (les autres affichent un message « pas encore migrée »)
export const READY_PAGES = ['login', 'dashboard'];

export default function domainData() {
  return {
    TODAY, TONES, ROLE_TONE, PRIORITY_TONE, TASK_TONE, PROJECT_TONE, DEADLINE, DEFAULT_USER,
    readyPages: READY_PAGES,
    params: {},                // paramètres de la page courante (ex. { id: 'p1', tab: 'tasks' } pour project-detail)

    // ---------- données ----------
    // hiérarchie : surcharges éventuelles (page Organisation)
    members: (() => { let o = {}; try { o = JSON.parse(localStorage.getItem('maser-supervisors') || '{}'); } catch (_) {} return seed.members.map((m) => (m.id in o ? { ...m, supervisorId: o[m.id] || undefined } : m)); })(),
    allProjects: seed.allProjects,
    allTasks: (() => { try { return JSON.parse(localStorage.getItem('maser-tasks')) || seed.allTasks; } catch (_) { return seed.allTasks; } })(),
    allMeetings: (() => { try { return JSON.parse(localStorage.getItem('maser-meetings')) || seed.allMeetings; } catch (_) { return seed.allMeetings; } })(),
    allNotes: (() => { try { return JSON.parse(localStorage.getItem('maser-notes')) || seed.allNotes; } catch (_) { return seed.allNotes; } })(),
    allTests: (() => { try { return JSON.parse(localStorage.getItem('maser-tests')) || seed.allTests; } catch (_) { return seed.allTests; } })(),
    allAmendments: (() => { try { return JSON.parse(localStorage.getItem('maser-amendments')) || seed.allAmendments; } catch (_) { return seed.allAmendments; } })(),
    milestones: seed.milestones,
    notifications: seed.notifications,
    userId: localStorage.getItem('maser-user') || 'u2',
    // pages transversales facultatives (désactivées par défaut, activables dans Settings)
    optPages: (() => { const base = { tasks: false, tests: false, notes: false, amendments: false, meetings: false }; try { return { ...base, ...(JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}').optPages || {}) }; } catch (_) { return base; } })(),
    get pageEnabled() { return !this.optKey || !!this.optPages[this.optKey]; },

    // ---------- navigation dans la SPA (pas de rechargement : Apps Script sert l'application dans une iframe) ----------
    navigate(page, params = {}) {
      this.params = params;
      this.page = page;
      try { window.scrollTo({ top: 0 }); } catch (_) {}
    },

    // ---------- utilisateur, rôle, droits de lecture ----------
    get user() { return this.members.find((m) => m.id === this.userId) || this.members[1]; },
    get role() { return this.eff(this.user); },
    get isClient() { return this.role === 'Client'; },
    subs(id) {
      const out = [], seen = new Set([id]), q = [id];
      while (q.length) { const x = q.shift(); this.members.forEach((m) => { if (m.supervisorId === x && !seen.has(m.id)) { seen.add(m.id); out.push(m); q.push(m.id); } }); }
      return out;
    },
    access(p) {
      if (this.role === 'Admin') return true;
      return [this.user, ...this.subs(this.user.id)].some((m) => p.memberIds.includes(m.id));
    },
    // un collaborateur ne voit que ses projets ; Admin et Manager voient tout
    get scoped() { return this.role === 'Collaborator'; },
    get projects() { return this.scoped ? this.allProjects.filter((p) => this.access(p)) : this.allProjects; },
    get pids() { return new Set(this.projects.map((p) => p.id)); },
    get tasks() { return this.scoped ? this.allTasks.filter((t) => this.pids.has(t.projectId)) : this.allTasks; },
    get tests() { return this.scoped ? this.allTests.filter((t) => this.pids.has(t.projectId)) : this.allTests; },
    get meetings() { return this.scoped ? this.allMeetings.filter((m) => this.pids.has(m.projectId)) : this.allMeetings; },
    get notes() {
      const team = new Set([this.user, ...this.subs(this.user.id)].map((m) => m.id));
      return this.allNotes.filter((n) => {
        const p = this.getProject(n.projectId);
        if (this.role === 'Collaborator') return !!p && this.access(p);
        if (this.role === 'Manager') return !!p && (p.memberIds.includes(this.user.id) || team.has(n.authorId));
        return true;
      });
    },
    getMember(id) { return this.members.find((m) => m.id === id); },
    getProject(id) { return this.allProjects.find((p) => p.id === id); },
    progress(p) {
      const l = this.allTasks.filter((t) => t.projectId === p.id);
      if (!l.length) return 0;
      const s = l.reduce((a, t) => a + (t.status === 'Done' ? 1 : t.status === 'Review' ? 0.75 : t.status === 'In Progress' ? 0.4 : 0), 0);
      return Math.round((s / l.length) * 100);
    },

    // ---------- dates (Moment.js) ----------
    daysUntil(d) { return moment(d).startOf('day').diff(moment(TODAY), 'days'); },
    deadlineState(end, done) {
      if (done) return 'complete';
      const n = this.daysUntil(end);
      return n < 0 ? 'overdue' : n <= 14 ? 'soon' : 'on-track';
    },
    fd(d, f = 'D MMM') { return moment(d).format(f); },
    ft(d) { return moment(d).format('HH:mm'); },
    fdt(d) { return moment(d).format('D MMM') + ' · ' + moment(d).format('HH:mm'); },

    // ---------- aides d'affichage ----------
    color(id) { return PALETTE[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length]; },
    stack(ids, max = 4) { return ids.slice(0, max).map((id) => this.getMember(id)).filter(Boolean); },
    rest(ids, max = 4) { return Math.max(0, ids.length - max); },
    isActive(page) { return page === this.page; },
    get unread() { return this.notifications.filter((n) => n.unread).length; },

    // ---------- rôle effectif : être placé au-dessus d'un manager (directement ou non) donne les droits de manager ----------
    eff(m) { return m.role === 'Collaborator' && this.subs(m.id).some((s) => s.role === 'Manager') ? 'Manager' : m.role; },
  };
}

// Ajoute le domaine à un composant existant (appData) : les propriétés de ce dernier (page, init…) gardent la priorité.
export function withDomain(base) {
  const out = {};
  Object.defineProperties(out, Object.getOwnPropertyDescriptors(domainData()));
  Object.defineProperties(out, Object.getOwnPropertyDescriptors(base));
  return out;
}
