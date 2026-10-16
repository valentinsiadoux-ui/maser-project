"use client"

import { useState } from "react"
import { Check, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NewAmendmentDialog } from "@/components/dialogs/new-amendment-dialog"
import { MemberInline } from "@/components/shared/member-avatar"
import { AmendmentStatusBadge, TagBadge } from "@/components/shared/status-badges"
import { formatCurrency, formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import type { Amendment } from "@/lib/types"

export function AmendmentsModule({ projectId }: { projectId?: string }) {
  const { amendments, getProject, role, updateAmendmentStatus } = useStore()
  const [open, setOpen] = useState(false)
  const list = amendments.filter((a) => !projectId || a.projectId === projectId)
  const canApprove = role === "Admin" || role === "Manager"

  const approved = list.filter((a) => a.status === "Approved")
  const totals = [
    { label: "Approved budget impact", value: formatCurrency(approved.reduce((s, a) => s + a.amount, 0)) },
    { label: "Approved schedule impact", value: `+${approved.reduce((s, a) => s + a.daysImpact, 0)} days` },
    { label: "Awaiting approval", value: String(list.filter((a) => a.status === "Pending Approval").length) },
    { label: "Drafts", value: String(list.filter((a) => a.status === "Draft").length) },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {totals.map((t) => (
          <Card key={t.label} size="sm" className="gap-1 px-4">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <p className="text-xl font-semibold tabular-nums">{t.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Version history of contract changes{projectId ? "" : " across all projects"}.
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus />
          New amendment
        </Button>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Ref.</TableHead>
              <TableHead>Amendment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Schedule</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...list].reverse().map((a) => (
              <TableRow key={a.id}>
                <TableCell className="pl-4 font-mono text-xs">{a.ref}</TableCell>
                <TableCell>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {!projectId && `${getProject(a.projectId)?.name} · `}
                    {formatDate(a.createdAt)}
                  </p>
                </TableCell>
                <TableCell>
                  <TagBadge>{a.type}</TagBadge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{a.amount ? `+${formatCurrency(a.amount)}` : "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{a.daysImpact ? `+${a.daysImpact} d` : "—"}</TableCell>
                <TableCell>
                  <MemberInline id={a.requestedBy} />
                </TableCell>
                <TableCell>
                  <AmendmentStatusBadge status={a.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <AmendmentAction amendment={a} canApprove={canApprove} onChange={updateAmendmentStatus} />
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No amendments recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <NewAmendmentDialog open={open} onOpenChange={setOpen} projectId={projectId} />
    </div>
  )
}

function AmendmentAction({
  amendment,
  canApprove,
  onChange,
}: {
  amendment: Amendment
  canApprove: boolean
  onChange: (id: string, s: Amendment["status"]) => void
}) {
  if (amendment.status === "Draft")
    return (
      <Button variant="outline" size="sm" onClick={() => onChange(amendment.id, "Pending Approval")}>
        <Send />
        Submit
      </Button>
    )
  if (amendment.status === "Pending Approval" && canApprove)
    return (
      <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => onChange(amendment.id, "Approved")}>
        <Check />
        Approve
      </Button>
    )
  return null
}
