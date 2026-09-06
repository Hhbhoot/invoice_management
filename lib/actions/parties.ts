"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { partySchema } from "@/lib/schemas/party"



export async function createParty(data: z.infer<typeof partySchema>) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = partySchema.safeParse(data)
  if (!parsed.success) throw new Error("Invalid data")

  const party = await prisma.party.create({
    data: {
      name: parsed.data.name,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2,
      cityPin: parsed.data.cityPin,
      stateName: parsed.data.stateName,
      stateCode: parsed.data.stateCode,
      gstin: parsed.data.gstin,
      pan: parsed.data.pan,
    }
  })

  revalidatePath('/dashboard/parties')
  return { success: true, party }
}

export async function updateParty(data: z.infer<typeof partySchema>) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = partySchema.safeParse(data)
  if (!parsed.success || !parsed.data.id) throw new Error("Invalid data")

  const party = await prisma.party.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2,
      cityPin: parsed.data.cityPin,
      stateName: parsed.data.stateName,
      stateCode: parsed.data.stateCode,
      gstin: parsed.data.gstin,
      pan: parsed.data.pan,
    }
  })

  revalidatePath('/dashboard/parties')
  return { success: true, party }
}

export async function deleteParty(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.party.delete({
    where: { id }
  })

  revalidatePath('/dashboard/parties')
  return { success: true }
}
