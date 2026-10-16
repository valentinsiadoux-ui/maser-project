import { PageHeader } from "./page-header"

export function ModulePage({ title, description, children, wide }: { title: string; description: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "mx-auto max-w-[1600px]" : "mx-auto max-w-7xl"}>
      <PageHeader title={title} description={description} />
      {children}
    </div>
  )
}
