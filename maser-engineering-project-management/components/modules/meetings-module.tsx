"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarPlus, Clock, MapPin, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog"
import { MemberStack } from "@/components/shared/member-avatar"
import { formatTime, parseDate } from "@/lib/format"
import { TODAY } from "@/lib/seed"
import { useStore } from "@/lib/store"
import type { Meeting } from "@/lib/types"
import { cn } from "@/lib/utils"

export function MeetingsModule({ projectId, readOnly = false }: { projectId?: string; readOnly?: boolean }) {
  const { meetings } = useStore()
  const [open, setOpen] = useState(false)
  const list = meetings
    .filter((m) => !projectId || m.projectId === projectId)
    .sort((a, b) => a.start.localeCompare(b.start))
  const upcoming = list.filter((m) => m.start.slice(0, 10) >= TODAY)
  const past = list.filter((m) => m.start.slice(0, 10) < TODAY).reverse()

  return (
    <div className="flex flex-col gap-6">
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {upcoming.length} upcoming · synced with Google Calendar
          </p>
          <Button onClick={() => setOpen(true)}>
            <CalendarPlus />
            Schedule meeting
          </Button>
        </div>
      )}

      <section aria-labelledby="upcoming-heading" className="flex flex-col gap-3">
        <h3 id="upcoming-heading" className="text-sm font-semibold">
          Upcoming
        </h3>
        {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No meetings scheduled.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((m) => (
            <MeetingCard key={m.id} meeting={m} showProject={!projectId} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="flex flex-col gap-3">
          <h3 id="past-heading" className="text-sm font-semibold text-muted-foreground">
            Past meetings
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {past.map((m) => (
              <MeetingCard key={m.id} meeting={m} showProject={!projectId} past />
            ))}
          </div>
        </section>
      )}

      {!readOnly && <ScheduleMeetingDialog open={open} onOpenChange={setOpen} projectId={projectId} />}
    </div>
  )
}

export function MeetingCard({ meeting, showProject, past }: { meeting: Meeting; showProject?: boolean; past?: boolean }) {
  const { getProject } = useStore()
  const d = parseDate(meeting.start)
  const project = getProject(meeting.projectId)
  const isOnline = /meet|teams|zoom/i.test(meeting.location)

  return (
    <Card className={cn("flex-row gap-4 p-4", past && "opacity-70")}>
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/8 py-2 text-primary">
        <span className="text-[11px] font-medium uppercase">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
        <span className="text-xl leading-none font-semibold tabular-nums">{d.getDate()}</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate font-medium">{meeting.title}</p>
        {showProject && project && (
          <Link href={`/projects/${project.id}?tab=meetings`} className="truncate font-mono text-[11px] text-muted-foreground hover:text-primary">
            {project.code} · {project.name}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {formatTime(meeting.start)} · {meeting.durationMin} min
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            {isOnline ? <Video className="size-3" /> : <MapPin className="size-3" />}
            <span className="truncate">{meeting.location}</span>
          </span>
        </div>
        <MemberStack ids={meeting.attendeeIds} />
      </div>
    </Card>
  )
}
