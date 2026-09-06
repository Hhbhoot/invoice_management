import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, Users, Settings, LogOut, LayoutDashboard, User } from "lucide-react"

import MobileNav from "./MobileNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const sidebarContent = (
    <div className="w-64 bg-[#1F3B57] text-white flex flex-col h-full">
      <div className="p-6 border-b border-[#2a4d70]">
        <h2 className="text-2xl font-bold text-[#C9A227]">GST Invoicing</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2a4d70] transition-colors">
          <LayoutDashboard className="w-5 h-5 text-[#F4E9C7]" />
          Dashboard
        </Link>
        <Link href="/dashboard/invoices" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2a4d70] transition-colors">
          <FileText className="w-5 h-5 text-[#F4E9C7]" />
          Invoices
        </Link>
        <Link href="/dashboard/parties" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2a4d70] transition-colors">
          <Users className="w-5 h-5 text-[#F4E9C7]" />
          Parties
        </Link>
        {session.user.role === 'OWNER' && (
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2a4d70] transition-colors">
            <Settings className="w-5 h-5 text-[#F4E9C7]" />
            Settings
          </Link>
        )}
        <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2a4d70] transition-colors">
          <User className="w-5 h-5 text-[#F4E9C7]" />
          Profile
        </Link>
      </nav>
      <div className="p-4 border-t border-[#2a4d70]">
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: '/login' })
        }}>
          <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-[#2a4d70] hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        {sidebarContent}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-4 md:px-8 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center">
            <MobileNav>{sidebarContent}</MobileNav>
          </div>
          <div className="text-sm text-gray-500">
            Logged in as {session.user.name || session.user.email}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
