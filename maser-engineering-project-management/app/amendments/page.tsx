import type { Metadata } from "next"
import { ModulePage } from "@/components/shared/module-page"
import { AmendmentsModule } from "@/components/modules/amendments-module"

export const metadata: Metadata = { title: "Amendments" }

export default function Page() {
  return (
    <ModulePage title="Amendments" description="Contract amendments (avenants): scope, schedule and budget changes with approval workflow.">
      <AmendmentsModule />
    </ModulePage>
  )
}
