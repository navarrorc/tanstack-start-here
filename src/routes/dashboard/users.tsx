import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users as UsersIcon } from 'lucide-react'

export const Route = createFileRoute('/dashboard/users')({
  beforeLoad: async ({ context }) => {
    if (!context.user.isAdmin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  
  loader: async () => {
    const { getUsers } = await import('../../lib/server-functions')
    const usersData = await getUsers()
    return { users: usersData.users }
  },
  
  component: UsersPage,
})

function UsersPage() {
  const { users } = Route.useLoaderData()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">Manage registered users and their roles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {users?.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon size={48} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
              <p className="text-muted-foreground text-sm">
                No users yet
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name || '—'}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {u.isAdmin ? (
                          <Badge variant="default">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
