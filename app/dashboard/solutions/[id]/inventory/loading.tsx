export default function InventoryLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                <div className="h-3 w-40 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6 space-y-4">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-96 bg-muted animate-pulse rounded" />
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
