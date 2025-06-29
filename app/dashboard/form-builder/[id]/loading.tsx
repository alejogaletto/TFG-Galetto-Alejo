import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Skeleton className="h-6 w-24" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-[250px] flex-col border-r bg-muted/40 md:flex">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-60" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="mx-auto max-w-[800px]">
            <Skeleton className="h-32 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    </div>
  )
}
