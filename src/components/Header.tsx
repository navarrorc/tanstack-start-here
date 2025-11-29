import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Home,
  Menu,
  X,
  Lock,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-medium text-gray-900 tracking-tight">
            Invite Auth
          </span>
        </Link>
        
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-gray-600" strokeWidth={1.5} />
        </button>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-600" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors mb-1 text-gray-700"
            activeProps={{
              className:
                'flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 text-white transition-colors mb-1',
            }}
          >
            <Home size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </nav>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
