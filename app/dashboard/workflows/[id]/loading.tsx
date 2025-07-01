export default function WorkflowDetailLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </main>
    </div>
  )
}
