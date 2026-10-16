import type { Metadata } from "next"
import { ModulePage } from "@/components/shared/module-page"
import { MeetingsModule } from "@/components/modules/meetings-module"

export const metadata: Metadata = { title: "Meetings" }

export default function Page() {
  return (
    <ModulePage title="Meetings" description="Project meetings (réunions), site visits and client reviews.">
      <MeetingsModule />
    </ModulePage>
  )
}
