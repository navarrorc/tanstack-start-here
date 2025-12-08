import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your application</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center">
          <h2 className="text-4xl font-semibold mb-2">Hello World</h2>
          <p className="text-muted-foreground">Welcome to your new TanStack Start application!</p>
        </CardContent>
      </Card>
    </>
  )
}
