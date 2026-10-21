// src/js/dashboardData.js — contenu de la page Dashboard (indicateurs, échéances, réunions, planning du portefeuille).
// Enregistré dans main.js :   Alpine.data('dashboardData', dashboardData);   →   <div x-data="dashboardData()"> (views/dashboard.html)
// Lit le domaine partagé (domain.js) : projects, tasks, tests, fd(), progress()…
import moment from 'moment';
import { TODAY } from './data/seed.js';

export default function dashboardData() {
  return {
    // ---------- Dashboard ----------
    get activeProjects() { return this.projects.filter((p) => p.status === 'In Progress'); },
    get openTasks() { return this.tasks.filter((t) => t.status !== 'Done'); },
    get kpis() {
      const month = TODAY.slice(0, 7);
      return [
        { label: 'Active projects', value: this.activeProjects.length, sub: `${this.projects.length - this.activeProjects.length} closed or archived`, icon: 'folder-kanban', tone: 'text-alt-ink bg-alt/14' },
        { label: 'Deadlines this month', value: [...this.activeProjects.map((p) => p.endDate), ...this.openTasks.map((t) => t.dueDate)].filter((d) => d.startsWith(month)).length, sub: 'Projects and tasks due in October', icon: 'calendar-clock', tone: 'text-warning-ink bg-warning/14' },
        { label: 'Tasks in progress', value: this.tasks.filter((t) => t.status === 'In Progress').length, sub: `${this.tasks.filter((t) => t.status === 'Review').length} awaiting review`, icon: 'list-checks', tone: 'text-success-ink bg-success/14' },
        { label: 'Failed tests', value: this.tests.filter((t) => t.status === 'Failed').length, sub: `${this.tests.filter((t) => t.status === 'Pending').length} pending execution`, icon: 'flask-conical', tone: 'text-destructive-ink bg-destructive/14' },
      ];
    },
    get deadlines() {
      return [
        ...this.activeProjects.map((p) => ({ id: p.id, title: p.name, sub: `Project · ${p.client}`, date: p.endDate, page: 'project-detail', params: { id: p.id } })),
        ...this.openTasks.map((t) => ({ id: t.id, title: t.title, sub: this.getProject(t.projectId)?.name ?? '', date: t.dueDate, page: 'project-detail', params: { id: t.projectId, tab: 'tasks' } })),
      ].filter((d) => this.daysUntil(d.date) <= 21).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    },
    get myTasks() { return this.tasks.filter((t) => t.assigneeId === this.user.id && t.status !== 'Done').slice(0, 5); },
    get upcomingMeetings() { return this.meetings.filter((m) => m.start.slice(0, 10) >= TODAY).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 2); },
    get recentNotes() { return [...this.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4); },
    isOnline(m) { return /meet|teams|zoom/i.test(m.location); },
    // ---------- Planning du portefeuille (ex-page Gantt) ----------
    TONE_BY_PRIORITY: { High: 'bg-primary', Medium: 'bg-chart-5', Low: 'bg-muted-foreground/50' },
    get gantt() {
      const DAY = 86400000, ms = (d) => new Date(d + 'T00:00:00').getTime();
      const rows = this.projects.filter((p) => p.status === 'In Progress').map((p) => ({
        id: p.id, label: p.name, sub: p.code, page: 'project-detail', params: { id: p.id }, start: p.startDate, end: p.endDate,
        progress: this.progress(p), tone: this.TONE_BY_PRIORITY[p.priority], milestones: this.milestones.filter((m) => m.projectId === p.id),
      }));
      if (!rows.length) return { rows: [] };
      const all = rows.flatMap((r) => [r.start, r.end]);
      const dMin = new Date(all.reduce((a, b) => (a < b ? a : b)) + 'T00:00:00'), dMax = new Date(all.reduce((a, b) => (a > b ? a : b)) + 'T00:00:00');
      const rs = new Date(dMin.getFullYear(), dMin.getMonth(), 1), re = new Date(dMax.getFullYear(), dMax.getMonth() + 1, 1);
      const span = re - rs, pct = (d) => ((ms(d) - rs) / span) * 100;
      const months = [];
      for (let d = new Date(rs); d < re; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        months.push({ label: moment(d).format('MMM YY'), left: ((d - rs) / span) * 100, width: ((next - d) / span) * 100 });
      }
      return {
        rows: rows.map((r) => ({ ...r, left: pct(r.start), width: Math.max(pct(r.end) - pct(r.start), 0.8),
          title: `${this.fd(r.start)} → ${this.fd(r.end)} · ${r.progress}%`,
          milestones: r.milestones.map((m) => ({ ...m, left: pct(m.date), title: `${m.title} · ${this.fd(m.date, 'D MMM YYYY')}` })) })),
        months, todayPct: pct(TODAY), minWidth: Math.max(720, Math.round(span / DAY) * 7),
      };
    },
    today: moment(TODAY).format('dddd D MMMM YYYY'),
  };
}
