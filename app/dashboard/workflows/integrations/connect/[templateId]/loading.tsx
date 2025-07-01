export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
      </main>
    </div>
  )
}
