import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DeadlineState } from "@/lib/format"
import type { AmendmentStatus, Priority, ProjectStatus, TaskStatus, TestStatus } from "@/lib/types"

const tone = {
  navy: "bg-primary/10 text-primary border-primary/15",
  green: "bg-success/12 text-success border-success/20",
  amber: "bg-warning/15 text-warning-foreground border-warning/30",
  red: "bg-destructive/10 text-destructive border-destructive/20",
  slate: "bg-muted text-muted-foreground border-border",
} as const

type Tone = keyof typeof tone

function Pill({ t, children, dot = true }: { t: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", tone[t])}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </Badge>
  )
}

const projectTone: Record<ProjectStatus, Tone> = { "In Progress": "navy", Closed: "green", Archived: "slate" }
const priorityTone: Record<Priority, Tone> = { High: "red", Medium: "amber", Low: "slate" }
const taskTone: Record<TaskStatus, Tone> = { "To Do": "slate", "In Progress": "navy", Review: "amber", Done: "green" }
const testTone: Record<TestStatus, Tone> = { Passed: "green", Failed: "red", Pending: "amber" }
const amendmentTone: Record<AmendmentStatus, Tone> = { Draft: "slate", "Pending Approval": "amber", Approved: "green" }

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => <Pill t={projectTone[status]}>{status}</Pill>
export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => <Pill t={taskTone[status]}>{status}</Pill>
export const TestStatusBadge = ({ status }: { status: TestStatus }) => <Pill t={testTone[status]}>{status}</Pill>
export const AmendmentStatusBadge = ({ status }: { status: AmendmentStatus }) => (
  <Pill t={amendmentTone[status]}>{status}</Pill>
)

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Pill t={priorityTone[priority]} dot={false}>
      {priority}
    </Pill>
  )
}

const deadlineLabel: Record<DeadlineState, { label: string; t: Tone }> = {
  overdue: { label: "Overdue", t: "red" },
  soon: { label: "Due soon", t: "amber" },
  "on-track": { label: "On track", t: "green" },
  complete: { label: "Delivered", t: "slate" },
}

export function DeadlineBadge({ state }: { state: DeadlineState }) {
  const { label, t } = deadlineLabel[state]
  return <Pill t={t}>{label}</Pill>
}

export function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className="rounded-md font-normal">
      {children}
    </Badge>
  )
}
