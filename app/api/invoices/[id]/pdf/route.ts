import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { generateInvoiceStream } from "@/lib/pdf-helper"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [invoice, companySettings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { srNo: 'asc' } },
        party: true
      }
    }),
    prisma.companySettings.findFirst()
  ])

  if (!invoice || !companySettings) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const stream = await generateInvoiceStream(invoice, invoice.party, companySettings)

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNo}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
