import { prisma } from "@/lib/prisma"
import InvoiceForm from "../InvoiceForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

/** Parses trailing digits from a string and returns prefix + (num+1), e.g. "cl/44" → "cl/45" */
function incrementRef(ref: string | null | undefined): string {
  if (!ref) return ""
  const match = ref.match(/^(.*?)(\d+)$/)
  if (match) return `${match[1]}${parseInt(match[2], 10) + 1}`
  return ref
}

export default async function NewInvoicePage() {
  await auth()

  const [parties, settings, lastInvoice] = await Promise.all([
    prisma.party.findMany({ orderBy: { name: 'asc' } }),
    prisma.companySettings.findFirst(),
    prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNo: true, challanRef: true },
    }),
  ])

  if (!settings) {
    redirect('/dashboard/settings')
  }

  // Derive next invoice number from the actual last invoice in the DB
  const prefix = settings.invoicePrefix ?? ''
  let nextNum = settings.nextInvoiceNo
  if (lastInvoice?.invoiceNo) {
    const suffix = lastInvoice.invoiceNo.slice(prefix.length)
    const parsed = parseInt(suffix, 10)
    if (!isNaN(parsed) && parsed >= nextNum) nextNum = parsed + 1
  }
  const nextInvoiceNo = `${prefix}${nextNum}`
  const nextChallanRef = incrementRef(lastInvoice?.challanRef)

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
        <h2 className="text-2xl font-bold text-gray-800">Create New Invoice</h2>
        <p className="text-gray-500 text-sm">Fill in the details below to generate a tax invoice.</p>
      </div>
      
      <InvoiceForm
        parties={parties}
        companySettings={serializedSettings}
        nextInvoiceNo={nextInvoiceNo}
        nextChallanRef={nextChallanRef}
      />
    </div>
  )
}


