import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import { ToastProvider } from '../lib/toast'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Invite Auth App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-7xl font-light text-gray-900 tracking-tight">404</h1>
          <p className="text-lg text-gray-500 font-light">Page not found</p>
        </div>
        <div className="pt-4">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  ),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  //const routerState = useRouterState()
  
  // Hide header on home, login, invite-entry, and all dashboard pages
  // const hideHeader = 
  //   routerState.location.pathname === '/' ||
  //   routerState.location.pathname === '/login' || 
  //   routerState.location.pathname === '/invite-entry' ||
  //   routerState.location.pathname.startsWith('/dashboard')
  
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider>
          {/* {!hideHeader && <Header />} */}
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}
