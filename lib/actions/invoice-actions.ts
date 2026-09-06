"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { InvoiceStatus } from "@prisma/client"

export async function deleteInvoice(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.invoice.delete({
    where: { id }
  })

  revalidatePath('/dashboard/invoices')
  return { success: true }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.invoice.update({
    where: { id },
    data: { status }
  })

  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard')
  return { success: true }
}
