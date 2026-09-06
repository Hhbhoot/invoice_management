import { prisma } from "@/lib/prisma"
import InvoiceList from "./InvoiceList"
import { auth } from "@/auth"
import { calculateGST } from "@/lib/gst-calculator"

export default async function InvoicesPage() {
  await auth() // ensure authenticated
  
  const invoicesData = await prisma.invoice.findMany({
    orderBy: { invoiceDate: 'desc' },
    include: {
      party: true,
      items: true
    }
  })

  // Compute grand totals and serialize Decimal fields for client components
  const invoices = invoicesData.map(invoice => {
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
      placeOfSupply: invoice.placeOfSupply,
      challanRef: invoice.challanRef,
      partyId: invoice.partyId,
      discountPercent: Number(invoice.discountPercent),
      cgstRate: Number(invoice.cgstRate),
      sgstRate: Number(invoice.sgstRate),
      igstRate: Number(invoice.igstRate),
      isIntraState: invoice.isIntraState,
      amountInWords: invoice.amountInWords,
      remarks: invoice.remarks,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      party: invoice.party,
      items: invoice.items.map(i => ({
        id: i.id,
        invoiceId: i.invoiceId,
        srNo: i.srNo,
        description: i.description,
        hsnCode: i.hsnCode,
        quantity: Number(i.quantity),
        rate: Number(i.rate),
        amount: Number(i.amount),
      })),
      grandTotal: gstResult.grandTotal
    }
  })

  return (
    <InvoiceList invoices={invoices} />
  )
}
