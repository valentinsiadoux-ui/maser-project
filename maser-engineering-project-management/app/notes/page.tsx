import type { Metadata } from "next"
import { ModulePage } from "@/components/shared/module-page"
import { NotesModule } from "@/components/modules/notes-module"

export const metadata: Metadata = { title: "Notes" }

export default function Page() {
  return (
    <ModulePage title="Notes" description="Technical notes, site visit reports and decisions, shared with the team.">
      <NotesModule />
    </ModulePage>
  )
}
