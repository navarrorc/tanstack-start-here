import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sections } from '@/lib/sections'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const routerState = useRouterState()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your application</p>
      </div>

      {/* Experiences horizontal nav */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Experiences</h3>
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 -mx-1 px-1">
          {sections.map((section) => {
            const isActive = routerState.location.pathname.startsWith(section.to)
            return (
              <Button
                key={section.key}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                asChild
                className="shrink-0"
              >
                <Link to={section.to}>
                  {section.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 text-center">
          <h2 className="text-4xl font-semibold mb-2">Hola Mundo</h2>
          <p className="text-muted-foreground">Welcome to your new TanStack Start application!</p>
        </CardContent>
      </Card>
    </>
  )
}
