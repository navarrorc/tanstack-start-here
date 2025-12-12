import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/marketplace/')({
  component: MarketplacePage,
})

const categories = ['All', 'Electronics', 'Home', 'Clothing', 'Books']

function MarketplacePage() {
  // For scaffold, "All" is always active
  const activeCategory = 'All'

  return (
    <div className="space-y-6">
      {/* Category bar (eBay-style) */}
      <div className="border-b">
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap py-3 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const isActive = category === activeCategory
              return (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  className={`shrink-0 text-sm ${
                    isActive
                      ? 'bg-accent text-accent-foreground rounded-full px-4 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full px-4'
                  }`}
                >
                  {category}
                </Button>
              )
            })}
          </div>
          {/* Subtle edge fade to hint at scrollability - only on small screens where content overflows */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none sm:hidden" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>

      {/* Scaffold content */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Marketplace (Scaffold)</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This is a scaffold page proving the Marketplace route group exists with its own layout and auth enforcement.
          In a specialized version, this would show a grid of items with search, filters, and posting capabilities.
        </p>
      </div>
    </div>
  )
}
