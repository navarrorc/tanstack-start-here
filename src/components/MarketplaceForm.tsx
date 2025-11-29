import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '../lib/toast'

// Zod validation schema for marketplace form
const marketplaceSchema = z.object({
  marketplaceTypeId: z.number({
    invalid_type_error: 'Please select a marketplace',
  }).int().positive('Please select a marketplace'),
})

// TypeScript type inferred from schema
type MarketplaceFormData = z.infer<typeof marketplaceSchema>

export default function MarketplaceForm() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Fetch marketplace types for dropdown
  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ['marketplaceTypes'],
    queryFn: async () => {
      const { getMarketplaceTypes } = await import('../lib/server-functions')
      return getMarketplaceTypes()
    },
  })

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MarketplaceFormData>({
    resolver: zodResolver(marketplaceSchema),
  })

  // Create marketplace mutation
  const createMutation = useMutation({
    mutationFn: async (marketplaceTypeId: number) => {
      const { createMarketplace } = await import('../lib/server-functions')
      return createMarketplace({ data: { marketplaceTypeId } })
    },
    onSuccess: () => {
      // Refetch marketplaces after creation
      queryClient.invalidateQueries({ queryKey: ['marketplaces'] })
      // Clear form using React Hook Form reset
      reset()
      // Show success toast
      showToast('success', 'Marketplace added successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to create marketplace:', error.message)
      // Show error toast
      showToast('error', error.message || 'Failed to create marketplace')
    },
  })

  // Form submission handler
  const onSubmit = (data: MarketplaceFormData) => {
    createMutation.mutate(data.marketplaceTypeId)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Add New Marketplace
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            {...register('marketplaceTypeId', {
              setValueAs: (v) => v === '' ? undefined : parseInt(v, 10),
            })}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            disabled={isSubmitting || typesLoading}
          >
            <option value="">Select a marketplace...</option>
            {typesData?.types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting || typesLoading}
            className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium rounded-full transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? 'Adding...' : 'Add Marketplace'}
          </button>
        </div>
        
        {/* Validation error */}
        {errors.marketplaceTypeId && (
          <p className="text-red-600 text-sm font-light">
            {errors.marketplaceTypeId.message}
          </p>
        )}
        

      </form>
    </div>
  )
}
