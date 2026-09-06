export interface InvoiceItemInput {
  quantity: number
  rate: number
  amount: number
}

export interface GSTCalculationParams {
  items: InvoiceItemInput[]
  discountPercent: number
  isIntraState: boolean
  cgstRate: number
  sgstRate: number
  igstRate: number
}

export interface GSTCalculationResult {
  itemsTotal: number
  discountAmount: number
  taxableTotal: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalBeforeRoundOff: number
  roundOff: number
  grandTotal: number
}

export function calculateGST(params: GSTCalculationParams): GSTCalculationResult {
  const { items, discountPercent, isIntraState, cgstRate, sgstRate, igstRate } = params

  const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const discountAmount = (itemsTotal * (discountPercent || 0)) / 100
  const taxableTotal = itemsTotal - discountAmount

  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  if (isIntraState) {
    cgstAmount = (taxableTotal * (cgstRate || 0)) / 100
    sgstAmount = (taxableTotal * (sgstRate || 0)) / 100
  } else {
    igstAmount = (taxableTotal * (igstRate || 0)) / 100
  }

  const totalBeforeRoundOff = taxableTotal + cgstAmount + sgstAmount + igstAmount
  const grandTotal = Math.round(totalBeforeRoundOff)
  const roundOff = grandTotal - totalBeforeRoundOff

  return {
    itemsTotal,
    discountAmount,
    taxableTotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalBeforeRoundOff,
    roundOff,
    grandTotal
  }
}
