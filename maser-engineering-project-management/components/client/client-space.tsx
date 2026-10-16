"use client"

import { useState } from "react"
import { CheckCircle2, Circle, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState, PageHeader } from "@/components/shared/page-header"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { AmendmentStatusBadge, ProjectStatusBadge } from "@/components/shared/status-badges"
import { ProgressBar } from "@/components/shared/view-toggle"
import { MeetingsModule } from "@/components/modules/meetings-module"
import { NotesModule } from "@/components/modules/notes-module"
import { formatCurrency, formatDate } from "@/lib/format"
import { TODAY } from "@/lib/seed"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ClientSpace() {
  const { projects, members, role, currentUser } = useStore()
  const clientUser = role === "Client" ? currentUser : members.find((m) => m.role === "Client")
  const clientProjects = projects.filter((p) => clientUser && p.memberIds.includes(clientUser.id))
  const [selected, setSelected] = useState(clientProjects[0]?.id ?? "")

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={clientUser?.company ?? "Client"}
        title="Client Space"
        description={
          role === "Client"
            ? `Welcome, ${clientUser?.name}. Follow the progress of your projects with Maser Engineering.`
            : `Preview of what ${clientUser?.name} (${clientUser?.company}) sees. Internal tasks, tests and notes stay hidden.`
        }
      />

      {clientProjects.length === 0 ? (
        <EmptyState title="No shared projects" />
      ) : (
        <Tabs value={selected} onValueChange={(v) => setSelected(v as string)}>
          {clientProjects.length > 1 && (
            <TabsList className="mb-2">
              {clientProjects.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="px-3">
                  {p.name}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          {clientProjects.map((p) => (
            <TabsContent key={p.id} value={p.id}>
              <ClientProject projectId={p.id} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

function ClientProject({ projectId }: { projectId: string }) {
  const { getProject, getProgress, milestones, amendments, members } = useStore()
  const project = getProject(projectId)!
  const progress = getProgress(projectId)
  const pMilestones = milestones.filter((m) => m.projectId === projectId).sort((a, b) => a.date.localeCompare(b.date))
  const pAmendments = amendments.filter((a) => a.projectId === projectId && a.status !== "Draft")
  const contacts = members.filter((m) => project.memberIds.includes(m.id) && (m.role === "Manager" || m.role === "Admin"))

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{project.code}</p>
            <h2 className="mt-1 text-xl font-semibold">{project.name}</h2>
            <p className="mt-1 max-w-xl text-sm text-pretty text-muted-foreground">{project.description}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Overall progress</span>
            <span className="font-mono text-2xl font-semibold">{progress}%</span>
          </div>
          <ProgressBar value={progress} className="h-2.5" tone={progress === 100 ? "success" : "primary"} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started {formatDate(project.startDate)}</span>
            <span>Target {formatDate(project.endDate)}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="gap-4 p-5">
            <h3 className="font-semibold">Key milestones</h3>
            {pMilestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No milestones shared yet.</p>
            ) : (
              <ol className="relative flex flex-col gap-5 border-l-2 border-border pl-6">
                {pMilestones.map((m) => {
                  const done = m.date < TODAY
                  return (
                    <li key={m.id} className="relative">
                      <span className="absolute top-0.5 -left-[33px] bg-card">
                        {done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                      </span>
                      <p className={cn("text-sm font-medium", done && "text-muted-foreground line-through decoration-1")}>{m.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(m.date, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</p>
                    </li>
                  )
                })}
              </ol>
            )}
          </Card>

          <section aria-labelledby="client-meetings" className="flex flex-col gap-3">
            <h3 id="client-meetings" className="font-semibold">
              Meetings
            </h3>
            <MeetingsModule projectId={projectId} readOnly />
          </section>

          <section aria-labelledby="client-messages" className="flex flex-col gap-3">
            <h3 id="client-messages" className="font-semibold">
              Messages
            </h3>
            <NotesModule projectId={projectId} clientView />
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Card className="gap-0 p-0">
            <h3 className="border-b px-4 py-3 font-semibold">Your contacts</h3>
            <ul className="divide-y">
              {contacts.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <MemberAvatar member={m} size="default" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 p-0">
            <h3 className="border-b px-4 py-3 font-semibold">Contract amendments</h3>
            {pAmendments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No amendments.</p>
            ) : (
              <ul className="divide-y">
                {pAmendments.map((a) => (
                  <li key={a.id} className="flex flex-col gap-1.5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-mono text-xs">{a.ref}</span>
                      <span className="ml-auto">
                        <AmendmentStatusBadge status={a.status} />
                      </span>
                    </div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.amount ? `+${formatCurrency(a.amount)}` : "No budget impact"}
                      {a.daysImpact ? ` · +${a.daysImpact} days` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
