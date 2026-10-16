"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { AMENDMENT_TYPES, type AmendmentType } from "@/lib/types"
import { Field, SelectField, toOptions } from "./form-fields"

export function NewAmendmentDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId?: string
}) {
  const { addAmendment, projects } = useStore()
  const [title, setTitle] = useState("")
  const [project, setProject] = useState(projectId ?? projects[0]?.id ?? "")
  const [type, setType] = useState<AmendmentType>("Scope")
  const [amount, setAmount] = useState("")
  const [days, setDays] = useState("")
  const pid = projectId ?? project
  const valid = title.trim() && pid

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    addAmendment({ projectId: pid, title: title.trim(), type, amount: Number(amount) || 0, daysImpact: Number(days) || 0 })
    setTitle("")
    setAmount("")
    setDays("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New amendment (avenant)</DialogTitle>
            <DialogDescription>Record a change to scope, schedule or budget. It will be saved as a draft.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="a-title" label="Title" className="sm:col-span-2">
              <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Additional inspection campaign" required />
            </Field>
            {!projectId && (
              <Field id="a-project" label="Project" className="sm:col-span-2">
                <SelectField id="a-project" value={project} onChange={setProject} options={projects.map((p) => ({ value: p.id, label: p.name }))} />
              </Field>
            )}
            <Field id="a-type" label="Revision type" className="sm:col-span-2">
              <SelectField id="a-type" value={type} onChange={(v) => setType(v as AmendmentType)} options={toOptions(AMENDMENT_TYPES)} />
            </Field>
            <Field id="a-amount" label="Budget impact (EUR)">
              <Input id="a-amount" type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </Field>
            <Field id="a-days" label="Schedule impact (days)">
              <Input id="a-days" type="number" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} placeholder="0" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid}>
              Save draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
