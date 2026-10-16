"use client"

import { useState } from "react"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { Field, SelectField } from "./form-fields"

function toGCalDate(local: string, addMin = 0) {
  const d = new Date(new Date(local).getTime() + addMin * 60_000)
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId?: string
}) {
  const { addMeeting, projects, getProject, currentUser } = useStore()
  const [title, setTitle] = useState("")
  const [project, setProject] = useState(projectId ?? projects[0]?.id ?? "")
  const [start, setStart] = useState("2026-10-23T10:00")
  const [duration, setDuration] = useState("60")
  const [location, setLocation] = useState("Google Meet")
  const pid = projectId ?? project
  const valid = title.trim() && pid && start

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const p = getProject(pid)
    const durationMin = Number(duration) || 60
    addMeeting({
      projectId: pid,
      title: title.trim(),
      start: `${start}:00`,
      durationMin,
      location,
      attendeeIds: p?.memberIds.slice(0, 4) ?? [currentUser.id],
    })
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${title.trim()} — ${p?.name ?? ""}`,
      dates: `${toGCalDate(start)}/${toGCalDate(start, durationMin)}`,
      details: `Maser Engineering project meeting (${p?.code ?? ""})`,
      location,
    })
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer")
    setTitle("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Schedule a meeting</DialogTitle>
            <DialogDescription>The meeting is added here and opened in Google Calendar so you can invite attendees.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="m-title" label="Meeting title" className="sm:col-span-2">
              <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design review" required />
            </Field>
            {!projectId && (
              <Field id="m-project" label="Project" className="sm:col-span-2">
                <SelectField id="m-project" value={project} onChange={setProject} options={projects.map((p) => ({ value: p.id, label: p.name }))} />
              </Field>
            )}
            <Field id="m-start" label="Date & time">
              <Input id="m-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
            </Field>
            <Field id="m-duration" label="Duration">
              <SelectField
                id="m-duration"
                value={duration}
                onChange={setDuration}
                options={[
                  { value: "30", label: "30 minutes" },
                  { value: "45", label: "45 minutes" },
                  { value: "60", label: "1 hour" },
                  { value: "90", label: "1.5 hours" },
                  { value: "120", label: "2 hours" },
                ]}
              />
            </Field>
            <Field id="m-location" label="Location" className="sm:col-span-2">
              <Input id="m-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid}>
              <CalendarPlus />
              Schedule via Google Calendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
