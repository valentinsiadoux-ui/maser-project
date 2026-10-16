"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Ellipsis, Kanban, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ViewToggle } from "@/components/shared/view-toggle"
import { AddTaskDialog } from "@/components/dialogs/add-task-dialog"
import { SelectField, toOptions } from "@/components/dialogs/form-fields"
import { MemberAvatar, MemberInline } from "@/components/shared/member-avatar"
import { PriorityBadge, TaskStatusBadge } from "@/components/shared/status-badges"
import { formatDate, daysUntil } from "@/lib/format"
import { useStore } from "@/lib/store"
import { PRIORITIES, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const columnAccent: Record<TaskStatus, string> = {
  "To Do": "bg-muted-foreground/40",
  "In Progress": "bg-primary",
  Review: "bg-warning",
  Done: "bg-success",
}

export function TasksModule({ projectId }: { projectId?: string }) {
  const { tasks, projects, role, currentUser } = useStore()
  const [view, setView] = useState<"board" | "list">("board")
  const [priority, setPriority] = useState("All")
  const [project, setProject] = useState("All")
  const [mine, setMine] = useState(role === "Collaborator")
  const [dialog, setDialog] = useState<{ open: boolean; status: TaskStatus }>({ open: false, status: "To Do" })

  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (projectId ? t.projectId === projectId : project === "All" || t.projectId === project) &&
          (priority === "All" || t.priority === priority) &&
          (!mine || t.assigneeId === currentUser.id),
      ),
    [tasks, projectId, project, priority, mine, currentUser.id],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle
          label="Task view"
          value={view}
          onChange={setView}
          options={[
            { value: "board", label: "Board", icon: Kanban },
            { value: "list", label: "List", icon: List },
          ]}
        />
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
          value={priority}
          onChange={setPriority}
          ariaLabel="Filter by priority"
          className="w-auto min-w-36"
          options={[{ value: "All", label: "All priorities" }, ...toOptions(PRIORITIES)]}
        />
        <Button variant={mine ? "secondary" : "outline"} aria-pressed={mine} onClick={() => setMine((m) => !m)}>
          Assigned to me
        </Button>
        <Button className="ml-auto" onClick={() => setDialog({ open: true, status: "To Do" })}>
          <Plus />
          Add task
        </Button>
      </div>

      {view === "board" ? (
        <TaskBoard tasks={visible} showProject={!projectId} onAdd={(status) => setDialog({ open: true, status })} />
      ) : (
        <TaskTable tasks={visible} showProject={!projectId} />
      )}

      <AddTaskDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        projectId={projectId}
        defaultStatus={dialog.status}
      />
    </div>
  )
}

function TaskBoard({ tasks, showProject, onAdd }: { tasks: Task[]; showProject: boolean; onAdd: (s: TaskStatus) => void }) {
  const { updateTaskStatus } = useStore()
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const items = tasks.filter((t) => t.status === status)
        return (
          <section
            key={status}
            aria-label={`${status} column`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(status)
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData("text/task")
              if (id) updateTaskStatus(id, status)
              setDragOver(null)
            }}
            className={cn(
              "flex min-h-48 flex-col gap-2.5 rounded-xl border bg-muted/40 p-2.5 transition-colors",
              dragOver === status && "border-primary/40 bg-primary/5",
            )}
          >
            <header className="flex items-center gap-2 px-1.5 pt-1">
              <span aria-hidden className={cn("size-2 rounded-full", columnAccent[status])} />
              <h3 className="text-sm font-semibold">{status}</h3>
              <span className="rounded-full bg-background px-1.5 font-mono text-xs text-muted-foreground">{items.length}</span>
              <Button variant="ghost" size="icon-xs" className="ml-auto" aria-label={`Add task to ${status}`} onClick={() => onAdd(status)}>
                <Plus />
              </Button>
            </header>
            {items.map((t) => (
              <TaskCard key={t.id} task={t} showProject={showProject} />
            ))}
            {items.length === 0 && (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>
            )}
          </section>
        )
      })}
    </div>
  )
}

function TaskCard({ task, showProject }: { task: Task; showProject: boolean }) {
  const { getMember, getProject, updateTaskStatus } = useStore()
  const left = daysUntil(task.dueDate)
  const late = task.status !== "Done" && left < 0
  const project = getProject(task.projectId)

  return (
    <Card
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/task", task.id)}
      className="cursor-grab gap-3 rounded-lg p-3 shadow-xs ring-0 transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm leading-snug font-medium">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Change status of ${task.title}`} />}>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={task.status} onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}>
                {TASK_STATUSES.map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>
                    {s}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {showProject && project && (
        <Link href={`/projects/${project.id}`} className="truncate font-mono text-[11px] text-muted-foreground hover:text-primary">
          {project.code} · {project.name}
        </Link>
      )}
      <div className="flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span className={cn("inline-flex items-center gap-1 text-xs", late ? "font-medium text-destructive" : "text-muted-foreground")}>
          <Calendar className="size-3" />
          {formatDate(task.dueDate, { day: "numeric", month: "short" })}
        </span>
        <MemberAvatar member={getMember(task.assigneeId)} className="ml-auto" />
      </div>
    </Card>
  )
}

function TaskTable({ tasks, showProject }: { tasks: Task[]; showProject: boolean }) {
  const { getProject } = useStore()
  return (
    <Card className="gap-0 p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Task</TableHead>
            {showProject && <TableHead>Project</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="pr-4">Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="pl-4 font-medium">{t.title}</TableCell>
              {showProject && <TableCell className="text-muted-foreground">{getProject(t.projectId)?.name}</TableCell>}
              <TableCell>
                <TaskStatusBadge status={t.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={t.priority} />
              </TableCell>
              <TableCell>
                <MemberInline id={t.assigneeId} />
              </TableCell>
              <TableCell className="pr-4 text-muted-foreground tabular-nums">{formatDate(t.dueDate)}</TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No tasks match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
