import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/marketplace/_route')({
  beforeLoad: async () => {
    const { getCurrentUser } = await import('../../lib/server-functions')
    const user = await getCurrentUser()

    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: MarketplaceLayout,
})

function MarketplaceLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and post items (scaffold experience)
        </p>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}