"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, CalendarClock, FlaskConical, FolderKanban, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { DeadlineBadge, TaskStatusBadge } from "@/components/shared/status-badges"
import { ProjectCard } from "@/components/projects/project-card"
import { MeetingCard } from "@/components/modules/meetings-module"
import { daysUntil, deadlineState, formatDate, formatDateTime } from "@/lib/format"
import { TODAY } from "@/lib/seed"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function DashboardView() {
  const { projects, tasks, tests, meetings, notes, currentUser, getMember, getProject } = useStore()
  const active = projects.filter((p) => p.status === "In Progress")
  const month = TODAY.slice(0, 7)

  const deadlines = [
    ...active.map((p) => ({ id: p.id, title: p.name, sub: `Project · ${p.client}`, date: p.endDate, href: `/projects/${p.id}`, done: false })),
    ...tasks
      .filter((t) => t.status !== "Done")
      .map((t) => ({
        id: t.id,
        title: t.title,
        sub: getProject(t.projectId)?.name ?? "",
        date: t.dueDate,
        href: `/projects/${t.projectId}?tab=tasks`,
        done: false,
      })),
  ]
    .filter((d) => daysUntil(d.date) <= 21)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  const kpis = [
    { label: "Active projects", value: active.length, sub: `${projects.length - active.length} closed or archived`, icon: FolderKanban, tone: "text-primary bg-primary/10" },
    {
      label: "Deadlines this month",
      value: [...active.map((p) => p.endDate), ...tasks.filter((t) => t.status !== "Done").map((t) => t.dueDate)].filter((d) => d.startsWith(month)).length,
      sub: "Projects and tasks due in October",
      icon: CalendarClock,
      tone: "text-warning-foreground bg-warning/20",
    },
    { label: "Tasks in progress", value: tasks.filter((t) => t.status === "In Progress").length, sub: `${tasks.filter((t) => t.status === "Review").length} awaiting review`, icon: ListChecks, tone: "text-success bg-success/12" },
    { label: "Failed tests", value: tests.filter((t) => t.status === "Failed").length, sub: `${tests.filter((t) => t.status === "Pending").length} pending execution`, icon: FlaskConical, tone: "text-destructive bg-destructive/10" },
  ]

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== "Done").slice(0, 5)
  const upcomingMeetings = meetings.filter((m) => m.start.slice(0, 10) >= TODAY).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 2)
  const recentNotes = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow={formatDate(TODAY, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        title={`Good morning, ${currentUser.name.split(" ")[0]}`}
        description="Here is what is happening across your engineering projects today."
        actions={
          <Button variant="outline" render={<Link href="/gantt" />}>
            View timeline
            <ArrowRight />
          </Button>
        }
      />

      <section aria-label="Key figures" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, tone }) => (
          <Card key={label} className="gap-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className={cn("grid size-8 place-items-center rounded-md", tone)}>
                <Icon className="size-4" />
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section aria-labelledby="active-projects" className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="active-projects" className="text-lg font-semibold">
              Active projects
            </h2>
            <Button variant="ghost" size="sm" render={<Link href="/projects" />}>
              All projects
              <ArrowRight />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {active.slice(0, 4).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <Card className="gap-0 p-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning-foreground" />
                Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {deadlines.map((d) => (
                  <li key={d.id}>
                    <Link href={d.href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {d.sub} · {formatDate(d.date, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <DeadlineBadge state={deadlineState(d.date, d.done)} />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <section aria-labelledby="next-meetings" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 id="next-meetings" className="font-semibold">
                Next meetings
              </h2>
              <Button variant="ghost" size="sm" render={<Link href="/meetings" />}>
                Calendar
                <ArrowRight />
              </Button>
            </div>
            {upcomingMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} showProject />
            ))}
          </section>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gap-0 p-0">
          <CardHeader className="border-b py-4">
            <CardTitle>My open tasks</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {myTasks.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No open tasks assigned to you.</p>
            ) : (
              <ul className="divide-y">
                {myTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {getProject(t.projectId)?.name} · due {formatDate(t.dueDate, { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <TaskStatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 p-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y">
              {recentNotes.map((n) => {
                const a = getMember(n.authorId)
                return (
                  <li key={n.id} className="flex gap-3 px-4 py-3">
                    <MemberAvatar member={a} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{a?.name}</span>{" "}
                        <span className="text-muted-foreground">added a {n.category.toLowerCase()} note on</span>{" "}
                        <Link href={`/projects/${n.projectId}?tab=notes`} className="font-medium hover:text-primary">
                          {getProject(n.projectId)?.name}
                        </Link>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{n.content}</p>
                    </div>
                    <time className="shrink-0 text-[11px] text-muted-foreground" dateTime={n.createdAt}>
                      {formatDateTime(n.createdAt)}
                    </time>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
