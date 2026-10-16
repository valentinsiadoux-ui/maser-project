"use client"

import Link from "next/link"
import { CalendarClock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MemberStack } from "@/components/shared/member-avatar"
import { DeadlineBadge, PriorityBadge, ProjectStatusBadge, TagBadge } from "@/components/shared/status-badges"
import { ProgressBar } from "@/components/shared/view-toggle"
import { deadlineState, formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import type { Project } from "@/lib/types"

export function ProjectCard({ project }: { project: Project }) {
  const { getProgress } = useStore()
  const progress = getProgress(project.id)
  const state = deadlineState(project.endDate, project.status !== "In Progress")

  return (
    <Card className="group relative gap-4 p-5 transition-shadow hover:shadow-md hover:ring-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground">{project.code}</p>
          <h3 className="mt-0.5 truncate font-semibold">
            <Link href={`/projects/${project.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {project.name}
            </Link>
          </h3>
          <p className="truncate text-sm text-muted-foreground">{project.client}</p>
        </div>
        <PriorityBadge priority={project.priority} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono font-medium tabular-nums">{progress}%</span>
        </div>
        <ProgressBar value={progress} tone={progress === 100 ? "success" : "primary"} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <TagBadge key={t}>{t}</TagBadge>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t pt-3">
        <MemberStack ids={project.memberIds} />
        <div className="flex items-center gap-2">
          {project.status === "In Progress" ? (
            <>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <CalendarClock className="size-3.5" />
                {formatDate(project.endDate, { day: "numeric", month: "short" })}
              </span>
              <DeadlineBadge state={state} />
            </>
          ) : (
            <ProjectStatusBadge status={project.status} />
          )}
        </div>
      </div>
    </Card>
  )
}
