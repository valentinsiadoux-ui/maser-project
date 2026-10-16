"use client"

import { useRouter } from "next/navigation"
import { Bell, ChevronDown, LogOut, Menu, Settings, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { useStore } from "@/lib/store"
import { NOTIFICATIONS } from "@/lib/seed"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { GlobalSearch } from "./global-search"

const ROLES: { role: Role; description: string }[] = [
  { role: "Admin", description: "Full access & settings" },
  { role: "Manager", description: "Manage projects & approvals" },
  { role: "Collaborator", description: "Work on assigned tasks" },
  { role: "Client", description: "Client Space only" },
]

const roleTone: Record<Role, string> = {
  Admin: "bg-primary text-primary-foreground",
  Manager: "bg-success/15 text-success",
  Collaborator: "bg-muted text-muted-foreground",
  Client: "bg-warning/20 text-warning-foreground",
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return <Badge className={cn("rounded-md border-transparent", roleTone[role], className)}>{role}</Badge>
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { currentUser, role, setRole } = useStore()
  const router = useRouter()
  const unread = NOTIFICATIONS.filter((n) => n.unread).length

  const switchRole = (next: Role) => {
    setRole(next)
    if (next === "Client") router.push("/client")
    else if (role === "Client") router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu />
      </Button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`} />}
          >
            <Bell />
            {unread > 0 && (
              <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-semibold text-white">
                {unread}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <span className="text-xs font-normal text-muted-foreground">{unread} new</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="items-start gap-3 py-2">
                <span
                  aria-hidden
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-success" : "bg-transparent")}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.detail}</span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-10 gap-2.5 px-2" aria-label="Open profile menu" />}
          >
            <MemberAvatar member={currentUser} size="default" />
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-medium">{currentUser.name}</span>
              <span className="text-[11px] font-normal text-muted-foreground">{currentUser.title}</span>
            </span>
            <RoleBadge role={role} className="hidden md:inline-flex" />
            <ChevronDown className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block text-sm font-medium text-foreground">{currentUser.name}</span>
                <span className="block text-xs font-normal">
                  {currentUser.company ?? "Maser Engineering"} · {role}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                View as role
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={role} onValueChange={(v) => switchRole(v as Role)}>
                {ROLES.map((r) => (
                  <DropdownMenuRadioItem key={r.role} value={r.role}>
                    <span className="flex flex-col">
                      <span>{r.role}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
