"use client"

import { useState } from "react"
import Link from "next/link"
import { deleteInvoice, updateInvoiceStatus } from "@/lib/actions/invoice-actions"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, FileText, CheckCircle } from "lucide-react"

export default function InvoiceList({ invoices }: { invoices: any[] }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setIsProcessing(true)
      await deleteInvoice(id)
      setIsProcessing(false)
    }
  }

  const handleMarkPaid = async (id: string) => {
    setIsProcessing(true)
    await updateInvoiceStatus(id, "PAID")
    setIsProcessing(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
          <p className="text-gray-500 text-sm">Manage your past and current invoices.</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="bg-[#1F3B57] hover:bg-[#1F3B57]/90 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Invoice No</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Party Name</th>
                <th className="px-6 py-3 font-medium">Grand Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No invoices found. Create one to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {invoice.status !== 'PAID' && (
                        <button 
                          onClick={() => handleMarkPaid(invoice.id)} 
                          disabled={isProcessing}
                          title="Mark as Paid"
                          className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded hover:bg-gray-100"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <a 
                        href={`/api/invoices/${invoice.id}/pdf`} 
                        target="_blank" 
                        rel="noreferrer"
                        title="View PDF"
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                      <Link 
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        title="Edit Invoice"
                        className="p-2 text-gray-500 hover:text-[#C9A227] transition-colors rounded hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(invoice.id)} 
                        disabled={isProcessing}
                        title="Delete Invoice"
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
