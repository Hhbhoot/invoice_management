"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    await signIn('credentials', { 
      ...rawData, 
      redirectTo: '/dashboard' 
    })
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Auth error:", error.type)
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}
