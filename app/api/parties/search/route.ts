import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q) {
    return NextResponse.json([])
  }

  const parties = await prisma.party.findMany({
    where: {
      name: {
        contains: q,
        mode: 'insensitive' // Requires PostgreSQL for insensitive search, which we are using
      }
    },
    take: 10,
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(parties)
}
