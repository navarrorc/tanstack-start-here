import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { LogOut, Mail, Copy, Check, Users } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Dynamic import to prevent client bundling
    const { getCurrentUser } = await import('../lib/server-functions')
    const user = await getCurrentUser()
    
    if (!user) {
      throw redirect({ to: '/login' })
    }
    
    return { user }
  },
  
  loader: async ({ context }) => {
    // Dynamic import to prevent client bundling
    const { getInvites, getUsers } = await import('../lib/server-functions')
    
    if (context.user.isAdmin) {
      const [invitesData, usersData] = await Promise.all([
        getInvites(),
        getUsers()
      ])
      return { 
        invites: invitesData.invites,
        users: usersData.users
      }
    }
    
    return { invites: [], users: [] }
  },
  
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Access pre-loaded data (no loading states!)
  const { user } = Route.useRouteContext()
  const { invites, users } = Route.useLoaderData()

  const generateMutation = useMutation({
    mutationFn: async (email: string) => {
      // Dynamic import to prevent client bundling
      const { generateInvite } = await import('../lib/server-functions')
      return generateInvite({ data: { email } })
    },
    onSuccess: () => {
      // Refresh the route to reload invites data
      navigate({ to: '/dashboard' })
      setEmail('')
    },
    onError: (error: Error) => {
      console.error('Failed to generate invite:', error.message)
    },
  })

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    navigate({ to: '/login' })
  }

  const handleCopyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/login?code=${code}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 font-light">
              {user.name || user.email}
              {user.isAdmin && (
                <span className="ml-2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 rounded-full transition-colors text-sm font-medium"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hello World Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center mb-8">
          <h2 className="text-4xl font-light text-gray-900 mb-4">Hello World</h2>
          <p className="text-gray-500">Welcome to your new TanStack Start application!</p>
        </div>

        {/* Admin Section */}
        {user.isAdmin && (
          <div className="space-y-6">
            {/* Generate Invite Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Generate Invite Code
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user email"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => email && generateMutation.mutate(email)}
                  disabled={!email || generateMutation.isPending}
                  className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium rounded-full transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {generateMutation.isError && (
                <p className="mt-3 text-red-600 text-sm font-light">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'Failed to generate invite code'}
                </p>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Users
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users?.map((u: any) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {u.name || '—'}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {u.email}
                        </td>
                        <td className="py-4 px-6">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900 text-white">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users?.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-3" strokeWidth={1} />
                    <p className="text-gray-400 text-sm font-light">
                      No users yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Invite Codes Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Invite Codes
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invites?.map((invite: any) => (
                      <tr
                        key={invite.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {invite.email}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 font-mono">
                          {invite.code}
                        </td>
                        <td className="py-4 px-6">
                          {invite.used ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                              Used by {invite.usedByEmail}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          {!invite.used && (
                            <button
                              onClick={() => handleCopyCode(invite.code)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-full transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                              {copiedCode === invite.code ? (
                                <>
                                  <Check size={12} strokeWidth={2} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={12} strokeWidth={2} />
                                  Copy Link
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invites?.length === 0 && (
                  <div className="text-center py-12">
                    <Mail size={48} className="mx-auto text-gray-300 mb-3" strokeWidth={1} />
                    <p className="text-gray-400 text-sm font-light">
                      No invite codes generated yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
