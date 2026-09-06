import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { calculateGST } from "@/lib/gst-calculator"
import { FileText, Users, DollarSign, AlertCircle } from "lucide-react"

export default async function DashboardHome() {
  await auth() // ensure authenticated

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [invoicesThisMonth, unpaidInvoicesCount, recentInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { invoiceDate: { gte: firstDayOfMonth }, status: { not: 'CANCELLED' } },
      include: { items: true }
    }),
    prisma.invoice.count({
      where: { status: 'UNPAID' }
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { party: true, items: true }
    })
  ])

  let totalRevenueThisMonth = 0
  
  invoicesThisMonth.forEach(invoice => {
    const gstResult = calculateGST({
      items: invoice.items.map(i => ({ quantity: Number(i.quantity), rate: Number(i.rate), amount: Number(i.amount) })),
      discountPercent: Number(invoice.discountPercent),
      isIntraState: invoice.isIntraState,
      cgstRate: Number(invoice.cgstRate),
      sgstRate: Number(invoice.sgstRate),
      igstRate: Number(invoice.igstRate),
    })
    totalRevenueThisMonth += gstResult.grandTotal
  })

  // Compute totals for recent invoices and serialize all Decimal fields
  const formattedRecentInvoices = recentInvoices.map(invoice => {
    const gstResult = calculateGST({
      items: invoice.items.map(i => ({ quantity: Number(i.quantity), rate: Number(i.rate), amount: Number(i.amount) })),
      discountPercent: Number(invoice.discountPercent),
      isIntraState: invoice.isIntraState,
      cgstRate: Number(invoice.cgstRate),
      sgstRate: Number(invoice.sgstRate),
      igstRate: Number(invoice.igstRate),
    })
    return {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      invoiceDate: invoice.invoiceDate.toISOString(),
      status: invoice.status,
      party: invoice.party,
      grandTotal: gstResult.grandTotal
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">Here is what is happening with your business today.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/parties">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Add Party
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new">
            <Button className="bg-[#1F3B57] hover:bg-[#1F3B57]/90 text-white flex items-center gap-2">
              <FileText className="w-4 h-4" /> New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-[#1F3B57]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Invoices this Month</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{invoicesThisMonth.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FileText className="w-6 h-6 text-[#1F3B57]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-[#C9A227]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue this Month</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">₹{totalRevenueThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <DollarSign className="w-6 h-6 text-[#C9A227]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Unpaid Invoices</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{unpaidInvoicesCount}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mt-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800">Recent Invoices</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-gray-500 uppercase border-b text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Invoice No</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Party Name</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {formattedRecentInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No invoices created yet.
                </td>
              </tr>
            ) : (
              formattedRecentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNo}</td>
                  <td className="px-6 py-4">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{invoice.party.name}</td>
                  <td className="px-6 py-4 font-medium">₹{Number(invoice.grandTotal).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                        invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 
                        invoice.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-gray-50 border-t text-center">
          <Link href="/dashboard/invoices" className="text-sm font-medium text-[#1F3B57] hover:underline">
            View all invoices &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
