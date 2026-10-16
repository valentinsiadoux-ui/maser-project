"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function Field({ id, label, children, className }: { id: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

export type Option = { value: string; label: string }

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  ariaLabel?: string
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => onChange((v as string) ?? "")}>
      <SelectTrigger id={id} className={cn("w-full", className)} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const toOptions = (list: readonly string[]): Option[] => list.map((v) => ({ value: v, label: v }))
