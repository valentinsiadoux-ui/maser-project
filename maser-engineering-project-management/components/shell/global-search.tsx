"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FolderKanban, ListChecks, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"

export function GlobalSearch() {
  const { projects, tasks, getProject } = useStore()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const p = projects
      .filter((x) => [x.name, x.client, x.code, ...x.tags].some((s) => s.toLowerCase().includes(q)))
      .slice(0, 4)
      .map((x) => ({ id: x.id, kind: "project" as const, title: x.name, subtitle: `${x.code} · ${x.client}`, href: `/projects/${x.id}` }))
    const t = tasks
      .filter((x) => x.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((x) => ({
        id: x.id,
        kind: "task" as const,
        title: x.title,
        subtitle: getProject(x.projectId)?.name ?? "",
        href: `/projects/${x.projectId}?tab=tasks`,
      }))
    return [...p, ...t]
  }, [query, projects, tasks, getProject])

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <div className="relative w-full max-w-md">
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
          if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229 && results[0]) go(results[0].href)
        }}
        placeholder="Search projects, tasks, clients..."
        aria-label="Global search"
        className="h-9 bg-muted/60 pl-9"
      />
      {open && query.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <ul role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto p-1">
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r.href)}
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-accent"
                  >
                    {r.kind === "project" ? (
                      <FolderKanban className="size-4 shrink-0 text-primary" />
                    ) : (
                      <ListChecks className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
