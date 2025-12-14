import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const { getCurrentUser } = await import('../../lib/server-functions')
    const user = await getCurrentUser()

    if (!user) {
      throw redirect({ to: '/login' })
    }

    return { user }
  },

  component: DashboardLayout,
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
