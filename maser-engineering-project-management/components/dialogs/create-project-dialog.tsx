"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { PRIORITIES, type Priority } from "@/lib/types"
import { Field, SelectField, toOptions } from "./form-fields"

const empty = {
  name: "",
  client: "",
  description: "",
  priority: "Medium" as Priority,
  startDate: "2026-10-19",
  endDate: "2027-03-26",
  tags: "",
  budget: "",
}

export function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addProject, currentUser } = useStore()
  const router = useRouter()
  const [form, setForm] = useState(empty)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.client.trim() && form.startDate && form.endDate >= form.startDate

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const project = addProject({
      name: form.name.trim(),
      client: form.client.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: "In Progress",
      startDate: form.startDate,
      endDate: form.endDate,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      memberIds: [currentUser.id],
      budget: Number(form.budget) || 0,
    })
    setForm(empty)
    onOpenChange(false)
    router.push(`/projects/${project.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Set up a new engineering project. You can invite the team afterwards.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="p-name" label="Project name" className="sm:col-span-2">
              <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Wind Farm Grid Connection" required />
            </Field>
            <Field id="p-client" label="Client">
              <Input id="p-client" value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="Client company" required />
            </Field>
            <Field id="p-priority" label="Priority">
              <SelectField id="p-priority" value={form.priority} onChange={(v) => set("priority", v as Priority)} options={toOptions(PRIORITIES)} />
            </Field>
            <Field id="p-start" label="Start date">
              <Input id="p-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
            </Field>
            <Field id="p-end" label="Target end date">
              <Input id="p-end" type="date" value={form.endDate} min={form.startDate} onChange={(e) => set("endDate", e.target.value)} required />
            </Field>
            <Field id="p-tags" label="Tags">
              <Input id="p-tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Structural, HVAC" />
            </Field>
            <Field id="p-budget" label="Budget (EUR)">
              <Input id="p-budget" type="number" min={0} inputMode="numeric" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="250000" />
            </Field>
            <Field id="p-desc" label="Description" className="sm:col-span-2">
              <Textarea id="p-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Scope summary" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
