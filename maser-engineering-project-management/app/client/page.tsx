import type { Metadata } from "next"
import { ClientSpace } from "@/components/client/client-space"

export const metadata: Metadata = { title: "Client Space" }

export default function Page() {
  return <ClientSpace />
}
