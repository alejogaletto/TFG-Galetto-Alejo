import { Skeleton } from "@/components/ui/skeleton"

export default function WorkflowsLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Skeleton className="h-8 w-32" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
            ))}
        </div>
      </main>
    </div>
  )
}
