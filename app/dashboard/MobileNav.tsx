"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1F3B57] shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/70 hover:text-white rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Render the passed sidebar content inside the drawer */}
        <div className="h-full w-full" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </div>
    </div>
  )
}
