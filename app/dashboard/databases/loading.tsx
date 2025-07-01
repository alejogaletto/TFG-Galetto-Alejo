export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted"></div>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-md bg-muted"></div>
              ))}
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted"></div>
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted"></div>
          </div>
          <div className="border rounded-lg">
            <div className="p-4 flex items-center gap-4">
              <div className="h-10 w-64 animate-pulse rounded-md bg-muted"></div>
              <div className="h-10 w-48 animate-pulse rounded-md bg-muted"></div>
            </div>
            <div className="border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-48 animate-pulse rounded-md bg-muted"></div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
