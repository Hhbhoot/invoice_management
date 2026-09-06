import { prisma } from "@/lib/prisma"
import PartyList from "./PartyList"
import { auth } from "@/auth"

export default async function PartiesPage() {
  await auth() // ensure authenticated
  
  const parties = await prisma.party.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <PartyList initialParties={parties} />
  )
}
