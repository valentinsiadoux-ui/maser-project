"use client"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Member } from "@/lib/types"

const palette = [
  "bg-primary text-primary-foreground",
  "bg-success text-success-foreground",
  "bg-chart-5 text-primary-foreground",
  "bg-warning text-warning-foreground",
  "bg-secondary-foreground text-primary-foreground",
]

function colorFor(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return palette[n % palette.length]
}

export function MemberAvatar({ member, size = "sm", className }: { member?: Member; size?: "sm" | "default" | "lg"; className?: string }) {
  if (!member) return null
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn("text-[10px] font-semibold", colorFor(member.id))}>{member.initials}</AvatarFallback>
    </Avatar>
  )
}

export function MemberStack({ ids, max = 4 }: { ids: string[]; max?: number }) {
  const { getMember } = useStore()
  const shown = ids.slice(0, max)
  const rest = ids.length - shown.length
  return (
    <AvatarGroup className="-space-x-1.5">
      {shown.map((id) => {
        const m = getMember(id)
        if (!m) return null
        return (
          <Tooltip key={id}>
            <TooltipTrigger render={<span className="inline-flex rounded-full" />}>
              <MemberAvatar member={m} className="ring-2 ring-card" />
            </TooltipTrigger>
            <TooltipContent>
              {m.name} · {m.title}
            </TooltipContent>
          </Tooltip>
        )
      })}
      {rest > 0 && <AvatarGroupCount className="text-[10px]">+{rest}</AvatarGroupCount>}
    </AvatarGroup>
  )
}

export function MemberInline({ id }: { id: string }) {
  const { getMember } = useStore()
  const m = getMember(id)
  if (!m) return <span className="text-muted-foreground">Unassigned</span>
  return (
    <span className="inline-flex items-center gap-2">
      <MemberAvatar member={m} />
      <span className="truncate">{m.name}</span>
    </span>
  )
}
