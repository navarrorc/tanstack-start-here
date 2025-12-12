import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Lock } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: async () => {
    // Dynamic import to prevent bundling server code
    const { getCurrentUser } = await import('../lib/server-functions')
    const user = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/dashboard' })
    }
    return { user: null }
  },
  component: App,
})

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">
              Invitation Only
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-light max-w-sm mx-auto">
              Access is limited to invited members
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={() => navigate({ to: '/login' })}
              className="w-full sm:w-auto px-12 py-3.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Subtle Divider */}
          <div className="pt-8">
            <div className="w-12 h-px bg-gray-200 mx-auto"></div>
          </div>

          {/* Footer Text */}
          <p className="text-xs text-gray-400 font-light">
            By invitation only. Contact your administrator for access.
          </p>
        </div>
      </main>
    </div>
  )
}
