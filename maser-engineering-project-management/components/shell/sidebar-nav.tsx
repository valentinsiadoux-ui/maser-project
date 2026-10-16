"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  CalendarDays,
  ChartGantt,
  FileDiff,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/tests", label: "Tests", icon: FlaskConical },
  { href: "/gantt", label: "Gantt Chart", icon: ChartGantt },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/amendments", label: "Amendments", icon: FileDiff, hint: "Avenants" },
  { href: "/meetings", label: "Meetings", icon: CalendarDays, hint: "Réunions" },
]

export function SidebarNav({ onNewProject, onNavigate }: { onNewProject: () => void; onNavigate?: () => void }) {
  const pathname = usePathname()
  const { role } = useStore()
  const isClient = role === "Client"

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      {!isClient && (
        <div className="px-3 pb-4">
          <Button
            onClick={onNewProject}
            className="w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus />
            New Project
          </Button>
        </div>
      )}

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        {!isClient && (
          <>
            <p className="px-2 pb-2 text-[11px] font-medium tracking-wider text-sidebar-foreground/50 uppercase">Workspace</p>
            <ul className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink {...item} active={isActive(item.href)} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="px-2 pt-6 pb-2 text-[11px] font-medium tracking-wider text-sidebar-foreground/50 uppercase">External</p>
        <ul>
          <li>
            <NavLink href="/client" label="Client Space" icon={Building2} active={isActive("/client")} onNavigate={onNavigate} />
          </li>
        </ul>
      </nav>

      <div className="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
        <p className="text-xs font-medium text-sidebar-accent-foreground">Prototype mode</p>
        <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
          Switch roles from the profile menu to preview Admin, Manager, Collaborator and Client views.
        </p>
      </div>
    </div>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  hint,
  active,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  hint?: string
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className={cn("size-4", active ? "text-sidebar-primary" : "text-sidebar-foreground/60")} />
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[10px] text-sidebar-foreground/40 italic">{hint}</span>}
    </Link>
  )
}
