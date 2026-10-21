// src/js/constants.js — constantes d'affichage partagées (couleurs des pastilles, états, rôles).

export const PALETTE = [
  'bg-primary text-primary-foreground',
  'bg-success text-success-foreground',
  'bg-chart-5 text-primary-foreground',
  'bg-[oklch(.62_.14_70)] text-white',
  'bg-[#4f4c4d] text-white',
];
export const TONES = {
  navy: 'bg-alt/12 text-alt-ink border-alt/25',
  green: 'bg-success/12 text-success-ink border-success/25',
  amber: 'bg-warning/12 text-warning-ink border-warning/25',
  red: 'bg-destructive/12 text-destructive-ink border-destructive/25',
  slate: 'bg-muted-foreground/12 text-muted-ink border-muted-foreground/25',
};
export const PRIORITY_TONE = { High: 'red', Medium: 'amber', Low: 'slate' };
export const TASK_TONE = { 'To Do': 'slate', 'In Progress': 'navy', Review: 'amber', Done: 'green' };
export const DEADLINE = { overdue: ['Overdue', 'red'], soon: ['Due soon', 'amber'], 'on-track': ['On track', 'green'], complete: ['Delivered', 'slate'] };
export const PROJECT_TONE = { 'In Progress': 'navy', Closed: 'green', Archived: 'slate' };
export const ROLE_TONE = { Admin: 'bg-primary text-primary-foreground', Manager: 'bg-success/14 text-success-ink', Collaborator: 'bg-muted text-muted-foreground', Client: 'bg-warning/14 text-warning-ink' };
export const DEFAULT_USER = { Admin: 'u1', Manager: 'u2', Collaborator: 'u3', Client: 'u7' };
