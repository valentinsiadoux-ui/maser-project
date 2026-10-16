import { TODAY } from "./seed"

const DAY = 86_400_000

export function parseDate(d: string) {
  return new Date(d.length === 10 ? `${d}T00:00:00` : d)
}

export function formatDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!d) return "—"
  return parseDate(d).toLocaleDateString("en-GB", opts)
}

export function formatTime(d: string) {
  return parseDate(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export function formatDateTime(d: string) {
  return `${formatDate(d, { day: "numeric", month: "short" })} · ${formatTime(d)}`
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

export function daysBetween(a: string, b: string) {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / DAY)
}

export function daysUntil(d: string) {
  return daysBetween(TODAY, d)
}

export type DeadlineState = "overdue" | "soon" | "on-track" | "complete"

export function deadlineState(endDate: string, done: boolean): DeadlineState {
  if (done) return "complete"
  const left = daysUntil(endDate)
  if (left < 0) return "overdue"
  if (left <= 14) return "soon"
  return "on-track"
}
