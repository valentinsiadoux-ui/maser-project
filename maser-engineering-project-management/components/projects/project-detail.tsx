"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/page-header"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { DeadlineBadge, PriorityBadge, ProjectStatusBadge, TagBadge } from "@/components/shared/status-badges"
import { ProgressBar } from "@/components/shared/view-toggle"
import { AmendmentsModule } from "@/components/modules/amendments-module"
import { GanttModule } from "@/components/modules/gantt-module"
import { MeetingsModule } from "@/components/modules/meetings-module"
import { NotesModule } from "@/components/modules/notes-module"
import { TasksModule } from "@/components/modules/tasks-module"
import { TestsModule } from "@/components/modules/tests-module"
import { daysUntil, deadlineState, formatCurrency, formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"

const TABS = ["overview", "tasks", "tests", "gantt", "notes", "amendments", "meetings", "team"] as const
type Tab = (typeof TABS)[number]
const TAB_LABEL: Record<Tab, string> = {
  overview: "Overview",
  tasks: "Tasks",
  tests: "Tests",
  gantt: "Gantt",
  notes: "Notes",
  amendments: "Amendments",
  meetings: "Meetings",
  team: "Team",
}

export function ProjectDetail({ id, initialTab }: { id: string; initialTab?: string }) {
  const { getProject, getProgress, tasks, tests, amendments, members } = useStore()
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "overview")
  const project = getProject(id)

  if (!project) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState title="Project not found" description="It may have been archived or removed." />
        <div className="mt-4 text-center">
          <Button variant="outline" render={<Link href="/projects" />}>
            Back to projects
          </Button>
        </div>
      </div>
    )
  }

  const progress = getProgress(project.id)
  const pTasks = tasks.filter((t) => t.projectId === project.id)
  const pTests = tests.filter((t) => t.projectId === project.id)
  const approvedAmendments = amendments.filter((a) => a.projectId === project.id && a.status === "Approved")
  const amendedBudget = project.budget + approvedAmendments.reduce((s, a) => s + a.amount, 0)
  const team = members.filter((m) => project.memberIds.includes(m.id))
  const left = daysUntil(project.endDate)

  const facts = [
    { label: "Client", value: project.client },
    { label: "Start", value: formatDate(project.startDate) },
    { label: "Target end", value: formatDate(project.endDate) },
    { label: "Budget", value: formatCurrency(amendedBudget), sub: approvedAmendments.length ? `incl. ${approvedAmendments.length} avenant(s)` : undefined },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-3 text-muted-foreground" render={<Link href="/projects" />}>
          <ChevronLeft />
          Projects
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{project.code}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance">{project.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
              {project.status === "In Progress" && <DeadlineBadge state={deadlineState(project.endDate, false)} />}
              {project.tags.map((t) => (
                <TagBadge key={t}>{t}</TagBadge>
              ))}
            </div>
          </div>
          <Card size="sm" className="w-full gap-2 px-4 md:w-64">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Overall progress</span>
              <span className="font-mono text-lg font-semibold">{progress}%</span>
            </div>
            <ProgressBar value={progress} tone={progress === 100 ? "success" : "primary"} />
            <p className="text-xs text-muted-foreground">
              {project.status !== "In Progress" ? "Project closed" : left >= 0 ? `${left} days remaining` : `${Math.abs(left)} days overdue`}
            </p>
          </Card>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <div className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
          <TabsList variant="line" className="h-10">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t} className="px-3">
                {TAB_LABEL[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              <Card className="gap-3 p-5">
                <h2 className="font-semibold">Scope</h2>
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{project.description || "No description provided."}</p>
                <dl className="mt-2 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="mt-0.5 text-sm font-medium">{f.value}</dd>
                      {f.sub && <dd className="text-[11px] text-muted-foreground">{f.sub}</dd>}
                    </div>
                  ))}
                </dl>
              </Card>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Tasks", value: `${pTasks.filter((t) => t.status === "Done").length}/${pTasks.length}`, sub: "completed", go: "tasks" as Tab },
                  { label: "In review", value: pTasks.filter((t) => t.status === "Review").length, sub: "tasks", go: "tasks" as Tab },
                  { label: "Tests passed", value: `${pTests.filter((t) => t.status === "Passed").length}/${pTests.length}`, sub: "cases", go: "tests" as Tab },
                  { label: "Failed tests", value: pTests.filter((t) => t.status === "Failed").length, sub: "to investigate", go: "tests" as Tab },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setTab(s.go)}
                    className="rounded-xl bg-card p-4 text-left ring-1 ring-foreground/10 transition hover:ring-foreground/25"
                  >
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                  </button>
                ))}
              </div>
              <GanttModule projectId={project.id} />
            </div>
            <TeamList team={team} />
          </div>
        </TabsContent>
        <TabsContent value="tasks" className="pt-4">
          <TasksModule projectId={project.id} />
        </TabsContent>
        <TabsContent value="tests" className="pt-4">
          <TestsModule projectId={project.id} />
        </TabsContent>
        <TabsContent value="gantt" className="pt-4">
          <GanttModule projectId={project.id} />
        </TabsContent>
        <TabsContent value="notes" className="pt-4">
          <NotesModule projectId={project.id} />
        </TabsContent>
        <TabsContent value="amendments" className="pt-4">
          <AmendmentsModule projectId={project.id} />
        </TabsContent>
        <TabsContent value="meetings" className="pt-4">
          <MeetingsModule projectId={project.id} />
        </TabsContent>
        <TabsContent value="team" className="pt-4">
          <div className="max-w-xl">
            <TeamList team={team} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TeamList({ team }: { team: ReturnType<typeof useStore>["members"] }) {
  return (
    <Card className="gap-0 self-start p-0">
      <h2 className="border-b px-4 py-3 font-semibold">Team ({team.length})</h2>
      <ul className="divide-y">
        {team.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <MemberAvatar member={m} size="default" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="truncate text-xs text-muted-foreground">{m.company ?? m.title}</p>
            </div>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{m.role}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
