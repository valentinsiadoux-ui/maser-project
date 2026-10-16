"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CreateProjectDialog } from "@/components/dialogs/create-project-dialog"
import { useStore } from "@/lib/store"
import { SidebarNav } from "./sidebar-nav"
import { TopBar } from "./top-bar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const { role } = useStore()
  const pathname = usePathname()
  const restricted = role === "Client" && !pathname.startsWith("/client")

  const openCreate = () => {
    setMobileOpen(false)
    setCreateOpen(true)
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarNav onNewProject={openCreate} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNewProject={openCreate} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {restricted ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted">
                <Lock className="size-5 text-muted-foreground" />
              </span>
              <h1 className="text-lg font-semibold">Restricted area</h1>
              <p className="text-sm text-muted-foreground">
                Client accounts only have access to the Client Space. Switch roles from the profile menu to explore internal views.
              </p>
              <Button render={<Link href="/client" />}>Go to Client Space</Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
