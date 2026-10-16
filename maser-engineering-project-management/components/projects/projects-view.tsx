"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { LayoutGrid, List, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SelectField, toOptions } from "@/components/dialogs/form-fields"
import { EmptyState, PageHeader } from "@/components/shared/page-header"
import { MemberStack } from "@/components/shared/member-avatar"
import { PriorityBadge, ProjectStatusBadge } from "@/components/shared/status-badges"
import { ProgressBar, ViewToggle } from "@/components/shared/view-toggle"
import { formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import { PRIORITIES, PROJECT_STATUSES } from "@/lib/types"
import { ProjectCard } from "./project-card"

export function ProjectsView() {
  const { projects, getProgress } = useStore()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("In Progress")
  const [priority, setPriority] = useState("All")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (priority === "All" || p.priority === priority) &&
        (!q || [p.name, p.client, p.code, ...p.tags].some((s) => s.toLowerCase().includes(q))),
    )
  }, [projects, query, status, priority])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Projects" description="All engineering projects, from tender to archive." />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, client, tag..."
            aria-label="Filter projects"
            className="pl-9"
          />
        </div>
        <SelectField
          value={status}
          onChange={setStatus}
          ariaLabel="Filter by status"
          className="w-auto min-w-36"
          options={[{ value: "All", label: "All statuses" }, ...toOptions(PROJECT_STATUSES)]}
        />
        <SelectField
          value={priority}
          onChange={setPriority}
          ariaLabel="Filter by priority"
          className="w-auto min-w-36"
          options={[{ value: "All", label: "All priorities" }, ...toOptions(PRIORITIES)]}
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filtered.length} projects</span>
          <ViewToggle
            label="Project view"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "Grid", icon: LayoutGrid },
              { value: "list", label: "List", icon: List },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No projects found" description="Try adjusting the filters or create a new project." />
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <Card className="gap-0 p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-40">Progress</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="pr-4">End date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:text-primary hover:underline">
                      {p.name}
                    </Link>
                    <p className="font-mono text-[11px] text-muted-foreground">{p.code}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.client}</TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={p.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={getProgress(p.id)} />
                      <span className="w-9 text-right font-mono text-xs">{getProgress(p.id)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MemberStack ids={p.memberIds} max={3} />
                  </TableCell>
                  <TableCell className="pr-4 text-muted-foreground tabular-nums">{formatDate(p.endDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
