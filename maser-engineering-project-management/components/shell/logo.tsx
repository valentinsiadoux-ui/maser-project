import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Maser Engineering — Dashboard">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-md bg-sidebar-primary font-mono text-sm font-bold text-sidebar-primary-foreground"
      >
        M
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-sm font-semibold tracking-tight", tone === "light" ? "text-sidebar-accent-foreground" : "text-foreground")}>
          Maser
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-medium tracking-[0.18em] uppercase",
            tone === "light" ? "text-sidebar-foreground/60" : "text-muted-foreground",
          )}
        >
          Engineering
        </span>
      </span>
    </Link>
  )
}
