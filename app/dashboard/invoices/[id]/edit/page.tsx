import { prisma } from "@/lib/prisma"
import InvoiceForm from "../../InvoiceForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await auth()
  const { id } = await params

  const [invoice, parties, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { items: { orderBy: { srNo: 'asc' } } }
    }),
    prisma.party.findMany({ orderBy: { name: 'asc' } }),
    prisma.companySettings.findFirst()
  ])

  if (!settings) {
    redirect('/dashboard/settings')
  }

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  // Serialize Decimal and Date fields — cannot cross the Server→Client boundary as-is
  const serializedSettings = {
    ...settings,
    cgstRate: Number(settings.cgstRate),
    sgstRate: Number(settings.sgstRate),
    igstRate: Number(settings.igstRate),
    updatedAt: settings.updatedAt.toISOString(),
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Invoice {invoice.invoiceNo}</h2>
      </div>
      
      <InvoiceForm initialData={invoice} parties={parties} companySettings={serializedSettings} />
    </div>
  )
}

