import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Calendar, DollarSign } from 'lucide-react'

export default function StatisticsDashboard() {
  // Fetch sales statistics using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['salesStatistics'],
    queryFn: async () => {
      const { getSalesStatistics } = await import('../lib/server-functions')
      return getSalesStatistics()
    },
  })

  // Format amount as currency with $ symbol and 2 decimal places
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Loading statistics...</p>
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
            {error instanceof Error ? error.message : 'Failed to load statistics'}
          </p>
        </div>
      </div>
    )
  }

  const stats = data || { totalSales: 0, monthSales: 0, weekSales: 0 }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Sales Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <DollarSign size={24} className="text-blue-600" strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Sales
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalSales)}
          </p>
        </div>
      </div>

      {/* Month Sales Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <Calendar size={24} className="text-green-600" strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Month Sales
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.monthSales)}
          </p>
        </div>
      </div>

      {/* Week Sales Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <TrendingUp size={24} className="text-purple-600" strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Week Sales
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.weekSales)}
          </p>
        </div>
      </div>
    </div>
  )
}
