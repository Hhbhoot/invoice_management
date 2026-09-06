import { prisma } from "@/lib/prisma"
import SettingsForm from "./SettingsForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()
  
  // Extra layer of protection on the server side
  if (session?.user?.role !== "OWNER") {
    redirect('/dashboard')
  }

  // Get the first settings record (since it's a single-tenant setup for one company)
  let settings = await prisma.companySettings.findFirst()

  if (!settings) {
    // Fallback if seeded data is somehow missing
    settings = await prisma.companySettings.create({
      data: {
        companyName: 'New Company',
        addressLine: '',
        gstin: '',
        stateName: '',
        stateCode: '',
      }
    })
  }

  // Serialize Decimal and Date fields — Prisma Decimals cannot cross the Server→Client boundary
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
        <h2 className="text-2xl font-bold text-gray-800">Company Settings</h2>
        <p className="text-gray-500 text-sm">Manage your business details, bank information, and tax defaults.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <SettingsForm initialData={serializedSettings} />
      </div>
    </div>
  )
}
