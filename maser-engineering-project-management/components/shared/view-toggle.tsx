"use client"

import { cn } from "@/lib/utils"

export function ViewToggle<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon: React.ComponentType<{ className?: string }> }[]
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-8 items-center rounded-lg border bg-card p-0.5">
      {options.map(({ value: v, label: l, icon: Icon }) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          aria-label={l}
          onClick={() => onChange(v)}
          className={cn(
            "inline-flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
            value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          <span className="hidden sm:inline">{l}</span>
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "success" | "warning" | "destructive" }) {
  const bar = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", destructive: "bg-destructive" }[tone]
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${value}%` }} />
    </div>
  )
}
