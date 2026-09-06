"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useRouter } from "next/navigation"
import { saveInvoice } from "@/lib/actions/invoices"
import { calculateGST } from "@/lib/gst-calculator"
import { numberToWords } from "@/lib/numberToWords"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Types matching the form structure
type FormValues = {
  id?: string
  invoiceNo: string
  invoiceDate: string // YYYY-MM-DD
  placeOfSupply: string
  challanRef: string
  partyId: string
  discountPercent: number
  remarks: string
  status: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED"
  items: {
    id?: string
    srNo: number
    description: string
    hsnCode: string
    quantity: number
    rate: number
  }[]
}

interface InvoiceFormProps {
  initialData?: any
  parties: any[]
  companySettings: any
  nextInvoiceNo?: string   // passed by new/page.tsx — preview only, server generates authoritatively
  nextChallanRef?: string  // auto-incremented from last invoice
}

export default function InvoiceForm({ initialData, parties, companySettings, nextInvoiceNo, nextChallanRef }: InvoiceFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [partySearch, setPartySearch] = useState("")
  const [selectedParty, setSelectedParty] = useState<any>(
    initialData ? parties.find(p => p.id === initialData.partyId) : null
  )

  const defaultDate = new Date().toISOString().split('T')[0]

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: initialData ? {
      ...initialData,
      invoiceDate: new Date(initialData.invoiceDate).toISOString().split('T')[0],
      discountPercent: Number(initialData.discountPercent),
      items: initialData.items.map((i: any) => ({
        ...i,
        quantity: Number(i.quantity),
        rate: Number(i.rate)
      }))
    } : {
      // invoiceNo intentionally excluded — server auto-generates it in the transaction
      invoiceDate: defaultDate,
      placeOfSupply: "",
      challanRef: nextChallanRef ?? "",
      partyId: "",
      discountPercent: 0,
      remarks: "",
      status: "UNPAID",
      items: [{ srNo: 1, description: "", hsnCode: "", quantity: 1, rate: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const formValues = watch()

  // Handle Party Selection & Auto-fill Place of Supply
  const handleSelectParty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value
    setValue("partyId", pId)
    const party = parties.find(p => p.id === pId)
    setSelectedParty(party)
    if (party) {
      setValue("placeOfSupply", `${party.stateName?.toUpperCase()} (Code : ${party.stateCode})`)
    }
  }

  // Live GST Calculation
  const isIntraState = selectedParty?.stateCode === companySettings.stateCode
  
  const gstResult = calculateGST({
    items: formValues.items.map(i => ({ ...i, amount: (i.quantity || 0) * (i.rate || 0) })),
    discountPercent: formValues.discountPercent || 0,
    isIntraState,
    cgstRate: Number(companySettings.cgstRate),
    sgstRate: Number(companySettings.sgstRate),
    igstRate: Number(companySettings.igstRate),
  })

  const amountInWords = numberToWords(gstResult.grandTotal)

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true)
    try {
      const payload = {
        ...data,
        invoiceDate: new Date(data.invoiceDate),
        // For new invoices, challanRef comes from the auto-filled prop (not a registered input)
        challanRef: initialData ? data.challanRef : (nextChallanRef ?? data.challanRef ?? ""),
        // invoiceNo is intentionally omitted for new invoices — server generates it atomically
      }
      await saveInvoice(payload)
      toast.success("Invoice saved successfully")
      router.push('/dashboard/invoices')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to save invoice")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">
      
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Invoice No — read-only display for new invoices; editable for edits */}
        <div>
          <Label>Invoice No</Label>
          {initialData ? (
            <Input {...register("invoiceNo")} className="bg-gray-50 font-mono" readOnly />
          ) : (
            <div className="flex items-center h-10 px-3 mt-1 rounded-md border border-input bg-gray-100 font-mono text-sm text-gray-700 select-none">
              {nextInvoiceNo ?? "Auto"}
            </div>
          )}
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input type="date" {...register("invoiceDate")} />
          {errors.invoiceDate && <p className="text-red-500 text-sm mt-1">{errors.invoiceDate.message}</p>}
        </div>
        <div>
          <Label>Challan Ref</Label>
          {initialData ? (
            <Input {...register("challanRef")} placeholder="e.g. cl/44" />
          ) : (
            <div className="flex items-center h-10 px-3 mt-1 rounded-md border border-input bg-gray-100 font-mono text-sm text-gray-700 select-none">
              {nextChallanRef || <span className="text-gray-400 italic">e.g. cl/45</span>}
            </div>
          )}
        </div>
      </div>

      {/* Party Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 border rounded-lg">
        <div>
          <Label>Select Party</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
            {...register("partyId")}
            onChange={handleSelectParty}
          >
            <option value="">-- Select Party --</option>
            {parties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.partyId && <p className="text-red-500 text-sm mt-1">{errors.partyId.message}</p>}
        </div>
        
        <div>
          <Label>Place of Supply</Label>
          <Input {...register("placeOfSupply")} placeholder="GUJARAT (Code : 24)" />
          {errors.placeOfSupply && <p className="text-red-500 text-sm mt-1">{errors.placeOfSupply.message}</p>}
        </div>

        {selectedParty && (
          <div className="col-span-1 md:col-span-2 text-sm text-gray-600 grid grid-cols-2 gap-4 mt-2">
            <div>
              <strong>Address:</strong> {selectedParty.addressLine1} {selectedParty.addressLine2} <br />
              {selectedParty.cityPin}
            </div>
            <div>
              <strong>GSTIN:</strong> {selectedParty.gstin || 'N/A'} <br />
              <strong>PAN:</strong> {selectedParty.pan || 'N/A'}
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ srNo: fields.length + 1, description: "", hsnCode: "", quantity: 1, rate: 0 })} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Row
          </Button>
        </div>
        
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#1F3B57] text-white">
              <tr>
                <th className="p-3 w-16">Sr No</th>
                <th className="p-3">Description of Goods</th>
                <th className="p-3 w-32">HSN Code</th>
                <th className="p-3 w-32">Quantity</th>
                <th className="p-3 w-32">Rate</th>
                <th className="p-3 w-32 text-right">Amount</th>
                <th className="p-3 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">
                    <Input type="number" {...register(`items.${index}.srNo` as const)} readOnly className="border-0 bg-transparent px-0 w-full text-center" />
                  </td>
                  <td className="p-3">
                    <Input {...register(`items.${index}.description` as const)} placeholder="Item description" className="w-full" required />
                  </td>
                  <td className="p-3">
                    <Input {...register(`items.${index}.hsnCode` as const)} placeholder="HSN" required />
                  </td>
                  <td className="p-3">
                    <Input type="number" step="0.01" {...register(`items.${index}.quantity` as const)} required />
                  </td>
                  <td className="p-3">
                    <Input type="number" step="0.01" {...register(`items.${index}.rate` as const)} required />
                  </td>
                  <td className="p-3 text-right font-medium text-gray-700">
                    {((formValues.items[index]?.quantity || 0) * (formValues.items[index]?.rate || 0)).toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals & Remarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-4">
          <div>
            <Label>Remarks (Optional)</Label>
            <textarea 
              {...register("remarks")}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-[#1F3B57] mb-1">Amount in Words</h4>
            <p className="text-sm font-semibold text-gray-800">{amountInWords}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Total Value:</span>
            <span>₹ {gstResult.itemsTotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-gray-600">
            <span className="flex items-center gap-2">
              Discount (%):
              <Input type="number" step="0.01" {...register("discountPercent")} className="w-20 h-8" />
            </span>
            <span>- ₹ {gstResult.discountAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-medium text-gray-800 border-t pt-3">
            <span>Taxable Amount:</span>
            <span>₹ {gstResult.taxableTotal.toFixed(2)}</span>
          </div>

          {isIntraState ? (
            <>
              <div className="flex justify-between text-gray-600">
                <span>CGST ({companySettings.cgstRate}%):</span>
                <span>₹ {gstResult.cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST ({companySettings.sgstRate}%):</span>
                <span>₹ {gstResult.sgstAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-gray-600">
              <span>IGST ({companySettings.igstRate}%):</span>
              <span>₹ {gstResult.igstAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Round Off:</span>
            <span>{gstResult.roundOff >= 0 ? '+' : '-'} ₹ {Math.abs(gstResult.roundOff).toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-end border-t border-gray-300 pt-4 mt-2">
            <span className="text-lg font-bold text-[#1F3B57]">Grand Total:</span>
            <span className="text-2xl font-bold text-[#1F3B57]">₹ {gstResult.grandTotal.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setValue("status", "DRAFT")
            handleSubmit(onSubmit)()
          }}
          disabled={isSaving}
        >
          Save as Draft
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-[#C9A227] hover:bg-[#b08e22] text-white"
        >
          {isSaving ? "Saving..." : "Save Invoice"}
        </Button>
      </div>

    </form>
  )
}
