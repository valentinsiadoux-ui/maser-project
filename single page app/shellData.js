// src/js/shellData.js — enveloppe de l'application : barre latérale, barre supérieure, recherche, notifications,
// profil et dialogue « Create project ». Enregistré dans main.js :   Alpine.data('shellData', shellData);
// Placé sur le conteneur de l'application dans index.html ; les vues de pages (dashboard…) sont à l'intérieur.
// Il lit le domaine partagé (domain.js) : projects, role, user, navigate()…
export default function shellData() {
  return {
    layout: (() => { try { return JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}').navLayout || 'side'; } catch (_) { return 'side'; } })(),
    mobileOpen: false, createOpen: false, profileOpen: false, notifOpen: false,
    query: '', searchOpen: false,
    form: { name: '', client: '', priority: 'Medium', startDate: '2026-10-19', endDate: '2027-03-26', tags: '', budget: '', description: '' },
    nav: [
      { page: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { page: 'projects', label: 'Projects', icon: 'folder-kanban', projects: true },
      { page: 'tasks', label: 'Tasks', icon: 'list-checks', opt: 'tasks' },
      { page: 'tests', label: 'Tests', icon: 'flask-conical', opt: 'tests' },
      { page: 'notes', label: 'Notes', icon: 'notebook-pen', opt: 'notes' },
      { page: 'amendments', label: 'Amendments', icon: 'file-diff', hint: 'Avenants', opt: 'amendments' },
      { page: 'meetings', label: 'Meetings', icon: 'calendar-days', hint: 'Réunions', opt: 'meetings' },
      { page: 'team-schedule', label: 'Team Schedule', icon: 'calendar-range', hint: 'Planning', only: ['Admin', 'Manager'] },
      { page: 'organisation', label: 'Organisation', icon: 'users', hint: 'Hiérarchie' },
      { page: 'my-schedule', label: 'My Schedule', icon: 'calendar-range', hint: 'Planning', only: ['Collaborator'] },
    ],
    roles: [
      { role: 'Admin', description: 'Full access & settings' },
      { role: 'Manager', description: 'Manage their projects & team' },
      { role: 'Collaborator', description: 'Work on assigned tasks' },
      { role: 'Client', description: 'Client Space only' },
    ],
    get items() { return this.nav.filter((i) => (!i.only || i.only.includes(this.role)) && (!i.opt || this.optPages[i.opt])); },
    get sameRole() { return this.members.filter((m) => this.eff(m) === this.role); },

    // ---------- sous-menu « Projects » : projets accessibles, rangés par catégories ----------
    projOpen: {},
    projMenu: { open: false, x: 0, y: 0 },
    get inProjects() { return ['projects', 'project-detail'].includes(this.page); },
    get currentProjectId() { return this.page === 'project-detail' ? this.params.id ?? null : null; },
    get projectGroups() {
      const isMine = (p) => this.role === 'Admin' || this.access(p);
      const sort = (l) => [...l].sort((a, b) => a.code.localeCompare(b.code));
      const active = this.projects.filter((p) => p.status === 'In Progress'), done = this.projects.filter((p) => p.status !== 'In Progress');
      return [
        { id: 'mine', label: 'My projects', items: sort(active.filter(isMine)) },
        { id: 'other', label: 'Other projects', hint: 'view only', items: sort(active.filter((p) => !isMine(p))) },
        { id: 'closed', label: 'Closed & archived', items: sort(done) },
      ].filter((g) => g.items.length > 0);
    },
    isOpen(g) { return this.projOpen[g.id] ?? (g.id === 'mine' || g.items.some((p) => p.id === this.currentProjectId)); },
    toggleGroup(g) { this.projOpen = { ...this.projOpen, [g.id]: !this.isOpen(g) }; },
    openProjMenu(ev) { const r = ev.currentTarget.getBoundingClientRect(); this.projMenu = { open: !this.projMenu.open, x: Math.max(8, Math.min(r.left, window.innerWidth - 296)), y: r.bottom + 6 }; },

    // ---------- recherche globale : projets, tâches, tests, notes — la page courante passe en premier ----------
    // contexte de la page courante : dans un projet, ses résultats passent en premier
    get searchCtx() { return this.page === 'project-detail' ? { project: this.params.id ?? null, kind: ({ tasks: 'task', tests: 'test', notes: 'note' })[this.params.tab] ?? null } : { project: null, kind: null }; },
    get results() {
      const q = this.query.trim().toLowerCase();
      if (!q) return [];
      const has = (...s) => s.some((x) => (x || '').toLowerCase().includes(q));
      const pn = (id) => this.getProject(id)?.name ?? '';
      const snippet = (s) => (s.length > 70 ? s.slice(0, 67) + '…' : s);
      const items = [
        ...this.projects.filter((x) => has(x.name, x.client, x.code, ...x.tags)).map((x) => ({ key: 'p' + x.id, kind: 'project', projectId: x.id, title: x.name, sub: `${x.code} · ${x.client}`, page: 'project-detail', params: { id: x.id } })),
        ...this.tasks.filter((x) => has(x.title)).map((x) => ({ key: 't' + x.id, kind: 'task', projectId: x.projectId, title: x.title, sub: `Task · ${pn(x.projectId)}`, page: 'project-detail', params: { id: x.projectId, tab: 'tasks' } })),
        ...this.tests.filter((x) => has(x.name, x.campaign)).map((x) => ({ key: 'q' + x.id, kind: 'test', projectId: x.projectId, title: x.name, sub: `Test · ${x.campaign} · ${pn(x.projectId)}`, page: 'project-detail', params: { id: x.projectId, tab: 'tests' } })),
        ...this.notes.filter((x) => has(x.content)).map((x) => ({ key: 'n' + x.id, kind: 'note', projectId: x.projectId, title: snippet(x.content), sub: `Note · ${x.category} · ${pn(x.projectId)}`, page: 'project-detail', params: { id: x.projectId, tab: 'notes' } })),
      ];
      const ctx = this.searchCtx, labels = { project: 'Projects', task: 'Tasks', test: 'Tests', note: 'Notes' };
      const out = [], used = new Set();
      if (ctx.project) {
        const here = items.filter((i) => i.projectId === ctx.project).sort((a, b) => (b.kind === ctx.kind) - (a.kind === ctx.kind));
        if (here.length) { out.push({ header: true, key: 'h-here', label: 'In this project' }); here.slice(0, 6).forEach((i) => { out.push(i); used.add(i.key); }); }
      }
      const order = ['project', 'task', 'test', 'note'], kinds = ctx.kind ? [ctx.kind, ...order.filter((k) => k !== ctx.kind)] : order;
      for (const k of kinds) {
        const g = items.filter((i) => i.kind === k && !used.has(i.key)).slice(0, 4);
        if (g.length) { out.push({ header: true, key: 'h-' + k, label: labels[k] }); out.push(...g); }
      }
      return out;
    },
    get firstResult() { return this.results.find((r) => !r.header); },

    // ---------- profil : rôle, personne, position du menu ----------
    switchRole(next) {
      localStorage.setItem('maser-user', this.DEFAULT_USER[next]);
      this.userId = this.DEFAULT_USER[next];
      this.profileOpen = false;
      if (next === 'Client') this.navigate('client-space');
    },
    switchUser(id) { localStorage.setItem('maser-user', id); this.userId = id; this.profileOpen = false; },
    setLayout(v) {
      this.layout = v;
      let p = {}; try { p = JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}'); } catch (_) {}
      p.navLayout = v; localStorage.setItem('maser-prefs-v1', JSON.stringify(p));
      if (v === 'side') document.documentElement.removeAttribute('data-nav'); else document.documentElement.setAttribute('data-nav', v);
      this.mobileOpen = false;
    },
    closeAll() { this.mobileOpen = false; this.createOpen = false; this.profileOpen = false; this.notifOpen = false; this.searchOpen = false; this.projMenu.open = false; },
    // « Sign out » : retour à la page de connexion
    signOut() { this.profileOpen = false; this.navigate('login'); },

    // ---------- création de projet (visuel : redirige vers la liste) ----------
    openCreate() { this.mobileOpen = false; this.createOpen = true; this.$nextTick(() => this.$refs.pname && this.$refs.pname.focus()); },
    get validForm() { return this.form.name.trim() && this.form.client.trim() && this.form.startDate && this.form.endDate >= this.form.startDate; },
    submitProject() { if (this.validForm) { this.createOpen = false; this.navigate('projects'); } },
  };
}
