export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="h-9 w-16 bg-muted animate-pulse rounded"></div>
        <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
      </header>
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </main>
    </div>
  )
}
