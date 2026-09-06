import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Create an OWNER user
  const passwordHash = await bcrypt.hash('password123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'OWNER',
    },
  })
  console.log(`Created Owner User: ${owner.email}`)

  // 2. Create CompanySettings
  const companySettings = await prisma.companySettings.create({
    data: {
      companyName: 'Your Company Name',
      addressLine: '123 Business Park, City',
      gstin: '24AAAAA0000A1Z5',
      stateName: 'Gujarat',
      stateCode: '24',
      bankName: 'HDFC Bank',
      bankBranch: 'Main Branch',
      bankAccountNo: '50100000000000',
      bankIfsc: 'HDFC0000001',
      termsConditions: '1. Subject to local jurisdiction.\n2. E. & O.E.',
      invoicePrefix: 'INV-',
      nextInvoiceNo: 101,
    }
  })
  console.log(`Created Company Settings for: ${companySettings.companyName}`)

  // 3. Create a Demo Party
  const party = await prisma.party.create({
    data: {
      name: 'Acme Corp',
      addressLine1: '456 Client Road',
      cityPin: 'Ahmedabad 380001',
      stateName: 'Gujarat',
      stateCode: '24',
      gstin: '24BBBBB1111B1Z5',
      pan: 'BBBBB1111B',
    }
  })
  console.log(`Created Party: ${party.name}`)

  // 4. Create a Demo Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: `${companySettings.invoicePrefix}${companySettings.nextInvoiceNo}`,
      invoiceDate: new Date(),
      placeOfSupply: 'GUJARAT (Code : 24)',
      partyId: party.id,
      discountPercent: 0,
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 0,
      isIntraState: true,
      amountInWords: 'Rupees One Hundred Five Only', // Just a placeholder
      status: 'UNPAID',
      items: {
        create: [
          {
            srNo: 1,
            description: 'Web Development Services',
            hsnCode: '9983',
            quantity: 1,
            rate: 100,
            amount: 100,
          }
        ]
      }
    }
  })
  console.log(`Created Invoice: ${invoice.invoiceNo}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
