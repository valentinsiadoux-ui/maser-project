import type { Metadata } from "next"
import { ModulePage } from "@/components/shared/module-page"
import { TestsModule } from "@/components/modules/tests-module"

export const metadata: Metadata = { title: "Tests" }

export default function Page() {
  return (
    <ModulePage title="Tests" description="Test campaigns and verification results across projects.">
      <TestsModule />
    </ModulePage>
  )
}
