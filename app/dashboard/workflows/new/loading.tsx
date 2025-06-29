import { Skeleton } from "@/components/ui/skeleton"

export default function NewWorkflowLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Skeleton className="h-8 w-32" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="mx-2 h-1 w-16" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="mx-2 h-1 w-16" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
                ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </main>
    </div>
  )
}
