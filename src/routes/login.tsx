import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const search = useSearch({ from: '/login' })
  const error = (search as any).error
  const inviteCode = (search as any).code

  const handleLogin = () => {
    // Store invite code in sessionStorage if present
    if (inviteCode) {
      sessionStorage.setItem('invite_code', inviteCode)
    }
    window.location.href = '/api/auth/login'
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M12 17h.01" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">
            Welcome!
          </h1>
          <p className="text-base text-gray-500 font-light">
            Sign in to access your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-sm text-red-600 text-center font-light">
              {error === 'invite_required'
                ? 'An invite code is required to sign up.'
                : error === 'auth_failed'
                  ? 'Authentication failed. Please try again.'
                  : error === 'session_expired'
                    ? 'Your session has expired. Please sign in again.'
                    : error === 'csrf_validation_failed'
                      ? 'Security validation failed. Please try signing in again.'
                      : error === 'missing_verifier'
                        ? 'Authentication error. Please try signing in again.'
                        : decodeURIComponent(error)}
            </p>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="pt-2">
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-4">
          <div className="w-12 h-px bg-gray-200 mx-auto mb-6"></div>
          <p className="text-xs text-gray-400 text-center font-light">
            {/* First user will automatically become an administrator */}
          </p>
        </div>
      </div>
    </div>
  )
}
