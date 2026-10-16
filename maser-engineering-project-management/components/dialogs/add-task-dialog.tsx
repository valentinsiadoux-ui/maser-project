"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from "@/lib/types"
import { Field, SelectField, toOptions } from "./form-fields"

export function AddTaskDialog({
  open,
  onOpenChange,
  projectId,
  defaultStatus = "To Do",
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId?: string
  defaultStatus?: TaskStatus
}) {
  const { addTask, projects, members, getProject } = useStore()
  const [title, setTitle] = useState("")
  const [project, setProject] = useState(projectId ?? projects[0]?.id ?? "")
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<Priority>("Medium")
  const [assignee, setAssignee] = useState("u3")
  const [startDate, setStartDate] = useState("2026-10-19")
  const [dueDate, setDueDate] = useState("2026-11-06")

  const pid = projectId ?? project
  const team = members.filter((m) => m.role !== "Client" && (getProject(pid)?.memberIds.includes(m.id) ?? true))
  const valid = title.trim() && pid && dueDate >= startDate

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    addTask({ projectId: pid, title: title.trim(), status, priority, assigneeId: assignee, startDate, dueDate })
    setTitle("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setStatus(defaultStatus)
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>Create a task and assign it to a team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="t-title" label="Task title" className="sm:col-span-2">
              <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cable sizing calculation" required />
            </Field>
            {!projectId && (
              <Field id="t-project" label="Project" className="sm:col-span-2">
                <SelectField
                  id="t-project"
                  value={project}
                  onChange={setProject}
                  options={projects.filter((p) => p.status === "In Progress").map((p) => ({ value: p.id, label: p.name }))}
                />
              </Field>
            )}
            <Field id="t-status" label="Status">
              <SelectField id="t-status" value={status} onChange={(v) => setStatus(v as TaskStatus)} options={toOptions(TASK_STATUSES)} />
            </Field>
            <Field id="t-priority" label="Priority">
              <SelectField id="t-priority" value={priority} onChange={(v) => setPriority(v as Priority)} options={toOptions(PRIORITIES)} />
            </Field>
            <Field id="t-assignee" label="Assignee" className="sm:col-span-2">
              <SelectField id="t-assignee" value={assignee} onChange={setAssignee} options={team.map((m) => ({ value: m.id, label: `${m.name} — ${m.title}` }))} />
            </Field>
            <Field id="t-start" label="Start date">
              <Input id="t-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field id="t-due" label="Due date">
              <Input id="t-due" type="date" value={dueDate} min={startDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid}>
              Add task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
