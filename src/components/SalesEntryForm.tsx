import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../lib/toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Zod validation schema for sales entry form
const salesEntrySchema = z.object({
  marketplaceId: z.string()
    .min(1, 'Marketplace selection is required')
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num > 0
    }, 'Marketplace selection is required'),
  date: z.string()
    .min(1, 'Date is required')
    .refine(
      (date) => {
        const entryDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return entryDate <= today
      },
      'Sales date cannot be in the future'
    ),
  amount: z.string()
    .min(1, 'Sales amount is required')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num)
    }, 'Sales amount must be a valid number')
    .refine((val) => {
      const num = parseFloat(val)
      return num >= 0
    }, 'Sales amount must be non-negative'),
})

type SalesEntryFormData = z.infer<typeof salesEntrySchema>

interface SalesEntryFormProps {
  existingEntry?: {
    id: number
    marketplaceId: number
    date: string
    amount: string
  }
  onCancel?: () => void
}

export default function SalesEntryForm({ existingEntry, onCancel }: SalesEntryFormProps) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  
  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalesEntryFormData>({
    resolver: zodResolver(salesEntrySchema),
    defaultValues: existingEntry ? {
      marketplaceId: existingEntry.marketplaceId.toString(),
      date: existingEntry.date,
      amount: existingEntry.amount,
    } : undefined,
  })

  // Fetch marketplaces for dropdown
  const { data: marketplacesData, isLoading: isLoadingMarketplaces } = useQuery({
    queryKey: ['marketplaces'],
    queryFn: async () => {
      const { getMarketplaces } = await import('../lib/server-functions')
      return getMarketplaces()
    },
  })

  // Upsert sales entry mutation
  const upsertMutation = useMutation({
    mutationFn: async (data: { marketplaceId: number; date: string; amount: number }) => {
      const { upsertSalesEntry } = await import('../lib/server-functions')
      return upsertSalesEntry({ data })
    },
    onSuccess: () => {
      // Refetch sales entries and statistics after upsert
      queryClient.invalidateQueries({ queryKey: ['salesEntries'] })
      queryClient.invalidateQueries({ queryKey: ['salesStatistics'] })
      // Clear form only if not editing
      if (!existingEntry) {
        reset()
      }
      // Show success toast
      showToast('success', existingEntry ? 'Sales entry updated successfully!' : 'Sales entry added successfully!')
      // Call onCancel if provided (for edit mode)
      if (onCancel) {
        onCancel()
      }
    },
    onError: (error: Error) => {
      console.error('Failed to save sales entry:', error.message)
      // Show error toast
      showToast('error', error.message || 'Failed to save sales entry')
    },
  })

  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const onSubmit = (data: SalesEntryFormData) => {
    upsertMutation.mutate({
      marketplaceId: parseInt(data.marketplaceId, 10),
      date: data.date,
      amount: parseFloat(data.amount),
    })
  }







  const marketplaces = marketplacesData?.marketplaces || []

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        {existingEntry ? 'Edit Sales Entry' : 'Add Sales Entry'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Marketplace Dropdown */}
        <div>
          <label htmlFor="marketplace" className="block text-sm font-medium text-gray-700 mb-2">
            Marketplace
          </label>
          <select
            id="marketplace"
            {...register('marketplaceId')}
            disabled={isSubmitting || isLoadingMarketplaces}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Select a marketplace</option>
            {marketplaces.map((marketplace) => (
              <option key={marketplace.id} value={marketplace.id}>
                {marketplace.name}
              </option>
            ))}
          </select>
          {errors.marketplaceId && (
            <p className="mt-1 text-red-600 text-sm">{errors.marketplaceId.message}</p>
          )}
        </div>

        {/* Date Picker */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register('date')}
            max={getTodayDate()}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errors.date && (
            <p className="mt-1 text-red-600 text-sm">{errors.date.message}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Sales Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            {...register('amount')}
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errors.amount && (
            <p className="mt-1 text-red-600 text-sm">{errors.amount.message}</p>
          )}
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium rounded-full transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? 'Saving...' : existingEntry ? 'Update Entry' : 'Add Entry'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium rounded-full transition-all text-sm"
            >
              Cancel
            </button>
          )}
        </div>

      </form>
    </div>
  )
}
