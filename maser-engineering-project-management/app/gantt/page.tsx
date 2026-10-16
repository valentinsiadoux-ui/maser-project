import type { Metadata } from "next"
import { ModulePage } from "@/components/shared/module-page"
import { GanttModule } from "@/components/modules/gantt-module"

export const metadata: Metadata = { title: "Gantt Chart" }

export default function Page() {
  return (
    <ModulePage title="Gantt Chart" description="Portfolio timeline of active projects and their key milestones." wide>
      <GanttModule />
    </ModulePage>
  )
}
