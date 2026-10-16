"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate, parseDate } from "@/lib/format"
import { TODAY } from "@/lib/seed"
import { useStore } from "@/lib/store"
import type { TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

type Row = {
  id: string
  label: string
  sub?: string
  href?: string
  start: string
  end: string
  progress: number
  tone: string
  milestones: { id: string; title: string; date: string }[]
}

const taskTone: Record<TaskStatus, string> = {
  "To Do": "bg-muted-foreground/35",
  "In Progress": "bg-primary",
  Review: "bg-warning",
  Done: "bg-success",
}

const DAY = 86_400_000

export function GanttModule({ projectId }: { projectId?: string }) {
  const { projects, tasks, milestones, getProgress, getMember } = useStore()

  const rows: Row[] = projectId
    ? tasks
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .map((t) => ({
          id: t.id,
          label: t.title,
          sub: getMember(t.assigneeId)?.name,
          start: t.startDate,
          end: t.dueDate,
          progress: t.status === "Done" ? 100 : t.status === "Review" ? 75 : t.status === "In Progress" ? 40 : 0,
          tone: taskTone[t.status],
          milestones: [],
        }))
    : projects
        .filter((p) => p.status === "In Progress")
        .map((p) => ({
          id: p.id,
          label: p.name,
          sub: p.code,
          href: `/projects/${p.id}`,
          start: p.startDate,
          end: p.endDate,
          progress: getProgress(p.id),
          tone: p.priority === "High" ? "bg-primary" : p.priority === "Medium" ? "bg-chart-5" : "bg-muted-foreground/50",
          milestones: milestones.filter((m) => m.projectId === p.id),
        }))

  const projectMilestones = projectId ? milestones.filter((m) => m.projectId === projectId) : []
  const allDates = [...rows.flatMap((r) => [r.start, r.end]), ...projectMilestones.map((m) => m.date)]
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nothing to schedule yet.</p>
  }

  const minDate = parseDate(allDates.reduce((a, b) => (a < b ? a : b)))
  const maxDate = parseDate(allDates.reduce((a, b) => (a > b ? a : b)))
  const rangeStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const rangeEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1)
  const span = rangeEnd.getTime() - rangeStart.getTime()
  const pct = (d: string) => ((parseDate(d).getTime() - rangeStart.getTime()) / span) * 100

  const months: { label: string; left: number; width: number }[] = []
  for (let d = new Date(rangeStart); d < rangeEnd; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    months.push({
      label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      left: ((d.getTime() - rangeStart.getTime()) / span) * 100,
      width: ((next.getTime() - d.getTime()) / span) * 100,
    })
  }
  const todayPct = pct(TODAY)
  const minWidth = Math.max(720, Math.round(span / DAY) * 7)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div style={{ minWidth: minWidth + 240 }}>
          <div className="flex border-b bg-muted/40">
            <div className="sticky left-0 z-10 w-60 shrink-0 border-r bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
              {projectId ? "Task" : "Project"}
            </div>
            <div className="relative h-10 flex-1">
              {months.map((m) => (
                <div
                  key={m.label}
                  className="absolute inset-y-0 flex items-center border-l px-2 font-mono text-xs text-muted-foreground"
                  style={{ left: `${m.left}%`, width: `${m.width}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {projectMilestones.length > 0 && (
            <GanttRow label="Milestones" sub={`${projectMilestones.length} key dates`} months={months} todayPct={todayPct}>
              {projectMilestones.map((m) => (
                <Milestone key={m.id} title={m.title} date={m.date} left={pct(m.date)} showLabel />
              ))}
            </GanttRow>
          )}

          {rows.map((r) => {
            const left = pct(r.start)
            const width = Math.max(pct(r.end) - left, 0.8)
            return (
              <GanttRow key={r.id} label={r.label} sub={r.sub} href={r.href} months={months} todayPct={todayPct}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <div
                        tabIndex={0}
                        aria-label={`${r.label}: ${formatDate(r.start)} to ${formatDate(r.end)}, ${r.progress}% complete`}
                        className="absolute top-1/2 h-6 -translate-y-1/2 overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    }
                  >
                    <div className={cn("h-full", r.tone)} style={{ width: `${Math.max(r.progress, 4)}%` }} />
                    <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[10px] font-semibold text-white [text-shadow:0_0_3px_rgb(0_0_0/0.45)]">
                      {r.progress}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {formatDate(r.start, { day: "numeric", month: "short" })} → {formatDate(r.end, { day: "numeric", month: "short" })} ·{" "}
                    {r.progress}%
                  </TooltipContent>
                </Tooltip>
                {r.milestones.map((m) => (
                  <Milestone key={m.id} title={m.title} date={m.date} left={pct(m.date)} />
                ))}
              </GanttRow>
            )
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-destructive" /> Today ({formatDate(TODAY, { day: "numeric", month: "short" })})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 bg-warning ring-1 ring-warning-foreground/30" /> Milestone
        </span>
        {projectId &&
          (Object.keys(taskTone) as TaskStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-sm", taskTone[s])} /> {s}
            </span>
          ))}
      </div>
    </Card>
  )
}

function GanttRow({
  label,
  sub,
  href,
  months,
  todayPct,
  children,
}: {
  label: string
  sub?: string
  href?: string
  months: { label: string; left: number }[]
  todayPct: number
  children: React.ReactNode
}) {
  const Label = href ? Link : "div"
  return (
    <div className="flex border-b last:border-b-0">
      <div className="sticky left-0 z-10 w-60 shrink-0 border-r bg-card px-4 py-2.5">
        <Label href={href ?? ""} className={cn("block truncate text-sm font-medium", href && "hover:text-primary hover:underline")}>
          {label}
        </Label>
        {sub && <p className="truncate font-mono text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <div className="relative h-14 flex-1">
        {months.map((m) => (
          <div key={m.label} aria-hidden className="absolute inset-y-0 border-l border-dashed border-border/70" style={{ left: `${m.left}%` }} />
        ))}
        <div aria-hidden className="absolute inset-y-0 z-[1] w-0.5 bg-destructive/70" style={{ left: `${todayPct}%` }} />
        {children}
      </div>
    </div>
  )
}

function Milestone({ title, date, left, showLabel }: { title: string; date: string; left: number; showLabel?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            tabIndex={0}
            aria-label={`Milestone: ${title}, ${formatDate(date)}`}
            className="absolute top-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 outline-none"
            style={{ left: `${left}%` }}
          />
        }
      >
        <span className="size-3 rotate-45 bg-warning ring-2 ring-card" />
        {showLabel && <span className="text-[11px] font-medium whitespace-nowrap">{title}</span>}
      </TooltipTrigger>
      <TooltipContent>
        {title} · {formatDate(date)}
      </TooltipContent>
    </Tooltip>
  )
}
