"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const settingsSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  addressLine: z.string().min(1, "Address is required"),
  gstin: z.string().min(15, "GSTIN must be 15 characters").max(15),
  stateName: z.string().min(1, "State name is required"),
  stateCode: z.string().min(1, "State code is required"),
  logoUrl: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  termsConditions: z.string().optional().nullable(),
  cgstRate: z.coerce.number().min(0).max(100),
  sgstRate: z.coerce.number().min(0).max(100),
  igstRate: z.coerce.number().min(0).max(100),
  invoicePrefix: z.string().optional(),
  nextInvoiceNo: z.coerce.number().min(1),
})

export async function updateSettings(data: z.infer<typeof settingsSchema>) {
  const session = await auth()
  if (session?.user?.role !== "OWNER") {
    throw new Error("Unauthorized")
  }

  const parsed = settingsSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("Invalid data")
  }

  await prisma.companySettings.update({
    where: { id: parsed.data.id },
    data: parsed.data,
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}
