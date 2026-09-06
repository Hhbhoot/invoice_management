"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

const profileSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
})

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) throw new Error("Invalid data")

  const updateData: any = {
    email: parsed.data.email,
  }

  if (parsed.data.password) {
    const salt = await bcrypt.genSalt(10)
    updateData.passwordHash = await bcrypt.hash(parsed.data.password, salt)
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  })

  revalidatePath('/dashboard/profile')
  return { success: true }
}
