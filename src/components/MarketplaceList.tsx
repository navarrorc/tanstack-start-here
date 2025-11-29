import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Store } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../lib/toast'

export default function MarketplaceList() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Fetch marketplaces using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['marketplaces'],
    queryFn: async () => {
      const { getMarketplaces } = await import('../lib/server-functions')
      return getMarketplaces()
    },
  })

  // Delete marketplace mutation
  const deleteMutation = useMutation({
    mutationFn: async (marketplaceId: number) => {
      const { deleteMarketplace } = await import('../lib/server-functions')
      return deleteMarketplace({ data: { marketplaceId } })
    },
    onSuccess: () => {
      // Refetch marketplaces and sales entries after deletion
      queryClient.invalidateQueries({ queryKey: ['marketplaces'] })
      queryClient.invalidateQueries({ queryKey: ['salesEntries'] })
      queryClient.invalidateQueries({ queryKey: ['salesStatistics'] })
      setDeleteConfirmId(null)
      // Show success toast
      showToast('success', 'Marketplace deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to delete marketplace:', error.message)
      // Show error toast
      showToast('error', error.message || 'Failed to delete marketplace')
    },
  })

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Loading marketplaces...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load marketplaces'}
          </p>
        </div>
      </div>
    )
  }

  const marketplaces = data?.marketplaces || []

  // Empty state
  if (marketplaces.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12">
        <div className="text-center">
          <Store size={48} className="mx-auto text-gray-300 mb-3" strokeWidth={1} />
          <p className="text-gray-400 text-sm font-light">
            No marketplaces registered yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Your Marketplaces</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
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
            {marketplaces.map((marketplace) => (
              <tr key={marketplace.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-900">{marketplace.name}</td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {new Date(marketplace.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  {deleteConfirmId === marketplace.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmDelete(marketplace.id)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-medium rounded-full transition-all"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 text-xs font-medium rounded-full transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(marketplace.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-full transition-all"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
