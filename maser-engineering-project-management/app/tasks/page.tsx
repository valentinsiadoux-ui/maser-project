import type { Metadata } from "next"
import { ModulePage } from "@/components/shared/module-page"
import { TasksModule } from "@/components/modules/tasks-module"

export const metadata: Metadata = { title: "Tasks" }

export default function Page() {
  return (
    <ModulePage title="Tasks" description="Every task across active projects. Drag cards between columns to update status." wide>
      <TasksModule />
    </ModulePage>
  )
}
