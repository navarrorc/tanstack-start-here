import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, DollarSign } from 'lucide-react'
import { useState } from 'react'
import SalesEntryForm from './SalesEntryForm'
import { useToast } from '../lib/toast'

export default function SalesHistory() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [editingEntry, setEditingEntry] = useState<{
    id: number
    marketplaceId: number
    date: string
    amount: string
  } | null>(null)
  const [filterMarketplaceId, setFilterMarketplaceId] = useState<number | null>(null)

  // Fetch marketplaces for filter dropdown
  const { data: marketplacesData } = useQuery({
    queryKey: ['marketplaces'],
    queryFn: async () => {
      const { getMarketplaces } = await import('../lib/server-functions')
      return getMarketplaces()
    },
  })

  // Fetch sales entries using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['salesEntries', filterMarketplaceId],
    queryFn: async () => {
      const { getSalesEntries } = await import('../lib/server-functions')
      return getSalesEntries({
        data: filterMarketplaceId ? { marketplaceId: filterMarketplaceId } : undefined,
      })
    },
  })

  // Delete sales entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (salesEntryId: number) => {
      const { deleteSalesEntry } = await import('../lib/server-functions')
      return deleteSalesEntry({ data: { salesEntryId } })
    },
    onSuccess: () => {
      // Refetch sales entries and statistics after deletion
      queryClient.invalidateQueries({ queryKey: ['salesEntries'] })
      queryClient.invalidateQueries({ queryKey: ['salesStatistics'] })
      setDeleteConfirmId(null)
      // Show success toast
      showToast('success', 'Sales entry deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to delete sales entry:', error.message)
      // Show error toast
      showToast('error', error.message || 'Failed to delete sales entry')
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

  const handleEditClick = (entry: any) => {
    setEditingEntry({
      id: entry.id,
      marketplaceId: entry.marketplaceId,
      date: entry.date,
      amount: entry.amount,
    })
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilterMarketplaceId(value ? parseInt(value) : null)
  }

  // Format amount as currency with $ symbol and 2 decimal places
  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount)
    return `$${numAmount.toFixed(2)}`
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const marketplaces = marketplacesData?.marketplaces || []
  const entries = data?.entries || []

  // If editing, show the form instead
  if (editingEntry) {
    return <SalesEntryForm existingEntry={editingEntry} onCancel={handleCancelEdit} />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Loading sales history...</p>
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
            {error instanceof Error ? error.message : 'Failed to load sales history'}
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Sales History</h2>
          {marketplaces.length > 0 && (
            <div className="w-48">
              <select
                value={filterMarketplaceId || ''}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">All Marketplaces</option>
                {marketplaces.map((marketplace) => (
                  <option key={marketplace.id} value={marketplace.id}>
                    {marketplace.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="text-center py-8">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-3" strokeWidth={1} />
          <p className="text-gray-400 text-sm font-light">
            {filterMarketplaceId ? 'No sales entries for this marketplace' : 'No sales entries yet'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Sales History</h2>
        {marketplaces.length > 0 && (
          <div className="w-48">
            <select
              value={filterMarketplaceId || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">All Marketplaces</option>
              {marketplaces.map((marketplace) => (
                <option key={marketplace.id} value={marketplace.id}>
                  {marketplace.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marketplace
              </th>
              <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-900">
                  {formatDate(entry.date)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900">
                  {entry.marketplaceName}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(entry.amount)}
                </td>
                <td className="py-4 px-6">
                  {deleteConfirmId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmDelete(entry.id)}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-full transition-all"
                      >
                        <Edit2 size={12} strokeWidth={2} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-full transition-all"
                      >
                        <Trash2 size={12} strokeWidth={2} />
                        Delete
                      </button>
                    </div>
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
