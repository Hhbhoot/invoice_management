import { renderToStream } from "@react-pdf/renderer"
import InvoicePDF from "@/components/pdf/InvoicePDF"

export async function generateInvoiceStream(invoice: any, party: any, companySettings: any) {
  return await renderToStream(
    <InvoicePDF 
      invoice={invoice} 
      party={party} 
      companySettings={companySettings} 
    />
  )
}
