import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { validateTempAuthCookie } from '@/lib/auth'

export const Route = createFileRoute('/invite-entry')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
  beforeLoad: async ({ search }) => {
    // Get token from URL parameter
    const token = search.token
    
    if (!token) {
      console.error('No auth token found in URL')
      throw redirect({ to: '/login', search: { error: 'session_expired' } })
    }

    const tempAuthData = validateTempAuthCookie(token)
    
    if (!tempAuthData) {
      console.error('Invalid or expired auth token')
      throw redirect({ to: '/login', search: { error: 'session_expired' } })
    }

    return { tempAuthData, token }
  },
  component: InviteEntryPage,
})

function InviteEntryPage() {
  const navigate = useNavigate()
  const context = Route.useRouteContext()
  const tempAuthData = context.tempAuthData
  const token = context.token
  
  // Check for invite code in sessionStorage
  const storedCode = typeof sessionStorage !== 'undefined' 
    ? sessionStorage.getItem('invite_code') 
    : null
  
  const [inviteCode, setInviteCode] = useState(storedCode || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inviteCode: inviteCode.trim(),
          token: token
        }),
        credentials: 'include', // Include cookies
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Clear stored invite code
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('invite_code')
        }
        // Success - redirect to dashboard
        window.location.href = '/dashboard'
      } else if (response.status === 401) {
        // Session expired - redirect to login
        navigate({ to: '/login', search: { error: 'session_expired' } })
      } else {
        // Error - display message
        setError(data.error || 'Invalid invite code. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Invite validation error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">
            Enter Invite Code
          </h1>
          <p className="text-sm text-gray-500 font-light">
            Authenticated as <span className="text-gray-900 font-medium">{tempAuthData.email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-sm text-red-600 text-center font-light">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your invite code"
              disabled={loading}
              readOnly={!!storedCode}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default transition-all"
              autoFocus={!storedCode}
            />
            {storedCode && (
              <p className="mt-2 text-xs text-gray-500 font-light">
                Invite code has been automatically applied
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Validating...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-4">
          <div className="w-12 h-px bg-gray-200 mx-auto mb-6"></div>
          <p className="text-xs text-gray-400 text-center font-light">
            Need help? Contact your administrator for an invite code.
          </p>
        </div>
      </div>
    </div>
  )
}
