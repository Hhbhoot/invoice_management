"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { calculateGST } from "@/lib/gst-calculator"
import { numberToWords } from "@/lib/numberToWords"

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  srNo: z.number(),
  description: z.string().min(1, "Description required"),
  hsnCode: z.string().min(1, "HSN Code required"),
  quantity: z.coerce.number().min(0.01),
  rate: z.coerce.number().min(0),
})

const invoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNo: z.string().optional().nullable(), // Generated server-side if omitted
  invoiceDate: z.coerce.date(),
  placeOfSupply: z.string().min(1, "Place of supply required"),
  challanRef: z.string().optional().nullable(),
  partyId: z.string().min(1, "Party required"),
  discountPercent: z.coerce.number().min(0).max(100),
  status: z.enum(['DRAFT', 'UNPAID', 'PAID', 'CANCELLED']).default('UNPAID'),
  remarks: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "At least one item required")
})

export async function saveInvoice(data: z.infer<typeof invoiceSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = invoiceSchema.safeParse(data)
  if (!parsed.success) throw new Error("Invalid data")

  const invoiceData = parsed.data

  // Fetch Company Settings & Party to compute GST server-side securely
  const [settings, party] = await Promise.all([
    prisma.companySettings.findFirst(),
    prisma.party.findUnique({ where: { id: invoiceData.partyId } })
  ])

  if (!settings || !party) throw new Error("Missing settings or party")

  // Server-side GST recalculation
  const isIntraState = settings.stateCode === party.stateCode

  const itemsWithAmount = invoiceData.items.map(item => ({
    ...item,
    amount: item.quantity * item.rate
  }))

  const gstResult = calculateGST({
    items: itemsWithAmount,
    discountPercent: invoiceData.discountPercent,
    isIntraState,
    cgstRate: Number(settings.cgstRate),
    sgstRate: Number(settings.sgstRate),
    igstRate: Number(settings.igstRate),
  })

  const amountInWords = numberToWords(gstResult.grandTotal)

  // Save to Database (invoiceNo handled separately per create/update path)
  const dbData = {
    invoiceDate: invoiceData.invoiceDate,
    placeOfSupply: invoiceData.placeOfSupply,
    challanRef: invoiceData.challanRef,
    partyId: invoiceData.partyId,
    discountPercent: invoiceData.discountPercent,
    cgstRate: isIntraState ? settings.cgstRate : 0,
    sgstRate: isIntraState ? settings.sgstRate : 0,
    igstRate: !isIntraState ? settings.igstRate : 0,
    isIntraState,
    amountInWords,
    remarks: invoiceData.remarks,
    status: invoiceData.status,
  }

  let invoice;
  if (invoiceData.id) {
    // Update existing invoice
    // First, delete existing items to replace them
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoiceData.id }
    })
    
    invoice = await prisma.invoice.update({
      where: { id: invoiceData.id },
      data: {
        ...dbData,
        // On edit, allow the user to change invoiceNo if they supplied one
        ...(invoiceData.invoiceNo?.trim() ? { invoiceNo: invoiceData.invoiceNo.trim() } : {}),
        items: {
          create: itemsWithAmount.map(item => ({
            srNo: item.srNo,
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          }))
        }
      }
    })
  } else {
    // Create new invoice — generate invoiceNo atomically inside a transaction
    invoice = await prisma.$transaction(async (tx) => {
      const freshSettings = await tx.companySettings.findFirst()
      if (!freshSettings) throw new Error("Company settings not found")

      let resolvedInvoiceNo: string

      if (invoiceData.invoiceNo && invoiceData.invoiceNo.trim()) {
        // User explicitly typed a custom invoice number — use it as-is
        resolvedInvoiceNo = invoiceData.invoiceNo.trim()
      } else {
        const prefix = freshSettings.invoicePrefix ?? ''

        // Scan ALL existing invoice numbers with this prefix and find the true numeric max.
        // This is the only approach that is immune to ordering bugs, gaps, or manual DB edits.
        const existingInvoices = await tx.invoice.findMany({
          where: { invoiceNo: { startsWith: prefix } },
          select: { invoiceNo: true },
        })

        let maxNum = 0
        for (const inv of existingInvoices) {
          const suffix = inv.invoiceNo.slice(prefix.length)
          const parsed = parseInt(suffix, 10)
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed
          }
        }

        // nextNum is guaranteed to be higher than every invoice already in the DB
        const nextNum = Math.max(maxNum + 1, freshSettings.nextInvoiceNo)
        resolvedInvoiceNo = `${prefix}${nextNum}`

        // Advance the settings counter to stay ahead
        await tx.companySettings.update({
          where: { id: freshSettings.id },
          data: { nextInvoiceNo: nextNum + 1 },
        })
      }

      return tx.invoice.create({
        data: {
          ...dbData,
          invoiceNo: resolvedInvoiceNo,
          items: {
            create: itemsWithAmount.map((item) => ({
              srNo: item.srNo,
              description: item.description,
              hsnCode: item.hsnCode,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            })),
          },
        },
      })
    })
  }

  revalidatePath('/dashboard/invoices')
  return { success: true, id: invoice.id }
}
