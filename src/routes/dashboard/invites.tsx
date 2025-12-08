import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/dashboard/invites')({
  beforeLoad: async ({ context }) => {
    if (!context.user.isAdmin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  
  loader: async () => {
    const { getInvites } = await import('../../lib/server-functions')
    const invitesData = await getInvites()
    return { invites: invitesData.invites }
  },
  
  component: InvitesPage,
})

function InvitesPage() {
  const navigate = useNavigate()
  const { invites } = Route.useLoaderData()
  const [email, setEmail] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const generateMutation = useMutation({
    mutationFn: async (email: string) => {
      const { generateInvite } = await import('../../lib/server-functions')
      return generateInvite({ data: { email } })
    },
    onSuccess: () => {
      navigate({ to: '/dashboard/invites' })
      setEmail('')
    },
    onError: (error: Error) => {
      console.error('Failed to generate invite:', error.message)
    },
  })

  const handleCopyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/login?code=${code}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Invite Codes</h1>
        <p className="text-muted-foreground mt-1">Generate and manage invite codes</p>
      </div>

      <div className="space-y-6">
        {/* Generate Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Invite Code</CardTitle>
            <CardDescription>Create a new invite code for a specific email address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email"
                className="flex-1"
              />
              <Button
                onClick={() => email && generateMutation.mutate(email)}
                disabled={!email || generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generating...' : 'Generate'}
              </Button>
            </div>
            {generateMutation.isError && (
              <p className="mt-3 text-destructive text-sm">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : 'Failed to generate invite code'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Invite Codes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Invite Codes</CardTitle>
            <CardDescription>View and manage generated invite codes</CardDescription>
          </CardHeader>
          <CardContent>
            {invites?.length === 0 ? (
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
                <p className="text-muted-foreground text-sm">
                  No invite codes generated yet
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites?.map((invite: any) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {invite.code}
                        </TableCell>
                        <TableCell>
                          {invite.used ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Used by {invite.usedByEmail}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!invite.used && (
                            <Button
                              size="sm"
                              onClick={() => handleCopyCode(invite.code)}
                            >
                              {copiedCode === invite.code ? (
                                <>
                                  <Check />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy />
                                  Copy Link
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
