import { Skeleton } from "@/components/ui/skeleton"

export default function AdvancedBuilderLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Panel Izquierdo */}
        <aside className="w-[300px] border-r bg-muted/40 flex flex-col">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas Principal */}
        <main className="flex-1 flex flex-col">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-muted/20">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </div>
        </main>

        {/* Panel Derecho */}
        <aside className="w-[320px] border-l bg-background flex flex-col">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="p-4 space-y-4">
            <Skeleton className="h-9 w-full" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
