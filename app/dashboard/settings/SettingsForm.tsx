"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateSettings } from "@/lib/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import type { CompanySettings } from "@prisma/client"

// Prisma Decimal / Date fields are serialized to primitives before crossing
// the Server → Client boundary, so we derive a safe serialized type here.
type SerializedCompanySettings = Omit<CompanySettings, 'cgstRate' | 'sgstRate' | 'igstRate' | 'updatedAt'> & {
  cgstRate: number
  sgstRate: number
  igstRate: number
  updatedAt: string
}

const settingsSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  addressLine: z.string().min(1, "Address is required"),
  gstin: z.string().min(15, "GSTIN must be 15 characters").max(15),
  stateName: z.string().min(1, "State name is required"),
  stateCode: z.string().min(1, "State code is required"),
  logoUrl: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  termsConditions: z.string().optional().nullable(),
  cgstRate: z.coerce.number().min(0).max(100),
  sgstRate: z.coerce.number().min(0).max(100),
  igstRate: z.coerce.number().min(0).max(100),
  invoicePrefix: z.string().optional(),
  nextInvoiceNo: z.coerce.number().min(1),
})

export default function SettingsForm({ initialData }: { initialData: SerializedCompanySettings }) {
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...initialData,
      cgstRate: Number(initialData.cgstRate),
      sgstRate: Number(initialData.sgstRate),
      igstRate: Number(initialData.igstRate),
    }
  })

  async function onSubmit(data: z.infer<typeof settingsSchema>) {
    setIsSaving(true)
    try {
      await updateSettings(data)
      toast.success('Settings updated successfully!')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to update settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Company Details</h3>
          <div>
            <Label>Company Name</Label>
            <Input {...register("companyName")} />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
          </div>
          <div>
            <Label>Address</Label>
            <Input {...register("addressLine")} />
            {errors.addressLine && <p className="text-red-500 text-sm mt-1">{errors.addressLine.message}</p>}
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input {...register("gstin")} />
            {errors.gstin && <p className="text-red-500 text-sm mt-1">{errors.gstin.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>State Name</Label>
              <Input {...register("stateName")} />
            </div>
            <div>
              <Label>State Code (e.g. 24)</Label>
              <Input {...register("stateCode")} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Bank Details</h3>
          <div>
            <Label>Bank Name</Label>
            <Input {...register("bankName")} />
          </div>
          <div>
            <Label>Branch Name</Label>
            <Input {...register("bankBranch")} />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input {...register("bankAccountNo")} />
          </div>
          <div>
            <Label>IFSC Code</Label>
            <Input {...register("bankIfsc")} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Tax Defaults</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>CGST %</Label>
              <Input type="number" step="0.01" {...register("cgstRate")} />
            </div>
            <div>
              <Label>SGST %</Label>
              <Input type="number" step="0.01" {...register("sgstRate")} />
            </div>
            <div>
              <Label>IGST %</Label>
              <Input type="number" step="0.01" {...register("igstRate")} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Invoice Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Prefix</Label>
              <Input {...register("invoicePrefix")} placeholder="e.g. INV-" />
            </div>
            <div>
              <Label>Next Invoice No</Label>
              <Input type="number" {...register("nextInvoiceNo")} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Terms & Conditions</h3>
        <div>
          <Label>Terms (shown on every invoice)</Label>
          <textarea
            {...register("termsConditions")}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSaving} className="bg-[#1F3B57] hover:bg-[#1F3B57]/90 text-white">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}
