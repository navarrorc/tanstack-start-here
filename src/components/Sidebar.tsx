import { useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { LogOut, Mail, Users, LayoutDashboard, UserCircle, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  user: {
    name?: string | null
    email: string
    isAdmin: boolean
  }
}

export function Sidebar({ user }: SidebarProps) {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    navigate({ to: '/login' })
  }

  const isActive = (path: string) => routerState.location.pathname === path

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden cursor-pointer"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          border-r bg-card flex flex-col py-4 transition-all duration-300 h-screen sticky top-0
          md:relative md:z-auto
          fixed z-50 md:translate-x-0
        `}
      >
      {/* Logo/Brand & Toggle */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-10 h-10 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {sidebarExpanded && (
            <span className="font-semibold text-lg whitespace-nowrap">Dashboard</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2">
       <Button
          variant="ghost"
          onClick={() => {
            navigate({ to: '/dashboard' })
          }}
          className={`${sidebarExpanded ? 'justify-start' : 'justify-center'} h-10 ${isActive('/dashboard') ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {sidebarExpanded && <span className="ml-3">Dashboard</span>}
        </Button>
        
        {/* Admin-only navigation items */}
        {user.isAdmin && (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                navigate({ to: '/dashboard/users' })
              }}
              className={`${sidebarExpanded ? 'justify-start' : 'justify-center'} h-10 ${isActive('/dashboard/users') ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <Users className="h-5 w-5 shrink-0" />
              {sidebarExpanded && <span className="ml-3">Users</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate({ to: '/dashboard/invites' })
              }}
              className={`${sidebarExpanded ? 'justify-start' : 'justify-center'} h-10 ${isActive('/dashboard/invites') ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <Mail className="h-5 w-5 shrink-0" />
              {sidebarExpanded && <span className="ml-3">Invites</span>}
            </Button>
          </>
        )}

      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Section at Bottom */}
      <div className="px-2 pb-2">
        <div className="border-t pt-3 mb-2" />
        
        {/* User Profile - More Compact */}
        <Button
          variant="ghost"
          className={`${sidebarExpanded ? 'justify-start' : 'justify-center'} h-10 w-full mb-1`}
        >
          <UserCircle className="h-5 w-5 shrink-0" />
          {sidebarExpanded && (
            <span className="ml-3 truncate text-sm">{user.name || user.email}</span>
          )}
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className={`${sidebarExpanded ? 'justify-start' : 'justify-center'} h-10 w-full text-destructive hover:text-destructive hover:bg-destructive/10`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarExpanded && <span className="ml-3">Logout</span>}
        </Button>
      </div>
      </aside>
    </>
  )
}
