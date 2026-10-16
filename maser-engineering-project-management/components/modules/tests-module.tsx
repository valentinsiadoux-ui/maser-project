"use client"

import { useMemo, useState } from "react"
import { CircleCheck, CircleDashed, CircleX } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SelectField } from "@/components/dialogs/form-fields"
import { MemberInline } from "@/components/shared/member-avatar"
import { PriorityBadge, TestStatusBadge } from "@/components/shared/status-badges"
import { ProgressBar } from "@/components/shared/view-toggle"
import { formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import type { TestStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TestsModule({ projectId }: { projectId?: string }) {
  const { tests, projects, getProject } = useStore()
  const [status, setStatus] = useState<"All" | TestStatus>("All")
  const [project, setProject] = useState("All")

  const scoped = useMemo(
    () => tests.filter((t) => (projectId ? t.projectId === projectId : project === "All" || t.projectId === project)),
    [tests, projectId, project],
  )
  const visible = scoped.filter((t) => status === "All" || t.status === status)

  const counts = {
    Passed: scoped.filter((t) => t.status === "Passed").length,
    Failed: scoped.filter((t) => t.status === "Failed").length,
    Pending: scoped.filter((t) => t.status === "Pending").length,
  }
  const total = scoped.length || 1

  const campaigns = Array.from(new Set(scoped.map((t) => `${t.projectId}::${t.campaign}`)))

  const stats = [
    { key: "Passed" as const, icon: CircleCheck, tone: "text-success", bar: "success" as const },
    { key: "Failed" as const, icon: CircleX, tone: "text-destructive", bar: "destructive" as const },
    { key: "Pending" as const, icon: CircleDashed, tone: "text-warning-foreground", bar: "warning" as const },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ key, icon: Icon, tone, bar }) => (
          <button
            key={key}
            type="button"
            aria-pressed={status === key}
            onClick={() => setStatus((s) => (s === key ? "All" : key))}
            className={cn(
              "flex flex-col gap-3 rounded-xl bg-card p-4 text-left ring-1 ring-foreground/10 transition hover:ring-foreground/20",
              status === key && "ring-2 ring-primary",
            )}
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className={cn("size-4", tone)} />
              {key}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">{counts[key]}</span>
              <span className="text-xs text-muted-foreground">{Math.round((counts[key] / total) * 100)}% of tests</span>
            </span>
            <ProgressBar value={(counts[key] / total) * 100} tone={bar} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!projectId && (
          <SelectField
            value={project}
            onChange={setProject}
            ariaLabel="Filter by project"
            className="w-auto min-w-44"
            options={[{ value: "All", label: "All projects" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
        )}
        <SelectField
          value={status}
          onChange={(v) => setStatus(v as "All" | TestStatus)}
          ariaLabel="Filter by status"
          className="w-auto min-w-36"
          options={[
            { value: "All", label: "All statuses" },
            { value: "Passed", label: "Passed" },
            { value: "Failed", label: "Failed" },
            { value: "Pending", label: "Pending" },
          ]}
        />
        <p className="ml-auto text-sm text-muted-foreground">
          {campaigns.length} campaigns · {scoped.length} test cases
        </p>
      </div>

      {campaigns.map((key) => {
        const [pid, campaign] = key.split("::")
        const rows = visible.filter((t) => t.projectId === pid && t.campaign === campaign)
        if (rows.length === 0) return null
        const all = scoped.filter((t) => t.projectId === pid && t.campaign === campaign)
        const passed = all.filter((t) => t.status === "Passed").length
        return (
          <Card key={key} className="gap-0 p-0">
            <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{campaign}</h3>
                {!projectId && <p className="text-xs text-muted-foreground">{getProject(pid)?.name}</p>}
              </div>
              <div className="ml-auto flex w-40 items-center gap-2">
                <ProgressBar value={(passed / all.length) * 100} tone="success" />
                <span className="font-mono text-xs text-muted-foreground">
                  {passed}/{all.length}
                </span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Test case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="pr-4">Last run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4 font-medium">{t.name}</TableCell>
                    <TableCell>
                      <TestStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={t.priority} />
                    </TableCell>
                    <TableCell>
                      <MemberInline id={t.assigneeId} />
                    </TableCell>
                    <TableCell className="pr-4 text-muted-foreground tabular-nums">{formatDate(t.lastRun)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      })}
      {visible.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No test cases match these filters.</p>}
    </div>
  )
}
