"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { partySchema } from "@/lib/schemas/party"
import { createParty, updateParty } from "@/lib/actions/parties"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Party } from "@prisma/client"

interface PartyFormModalProps {
  party?: Party | null
  onClose: () => void
}

export default function PartyFormModal({ party, onClose }: PartyFormModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof partySchema>>({
    resolver: zodResolver(partySchema),
    defaultValues: party || {
      name: "",
      addressLine1: "",
      addressLine2: "",
      cityPin: "",
      stateName: "",
      stateCode: "",
      gstin: "",
      pan: ""
    }
  })

  async function onSubmit(data: z.infer<typeof partySchema>) {
    setIsSaving(true)
    try {
      if (party?.id) {
        await updateParty({ ...data, id: party.id })
        toast.success("Party updated successfully")
      } else {
        await createParty(data)
        toast.success("Party added successfully")
      }
      onClose()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to save party")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{party ? "Edit Party" : "Add New Party"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label>Party Name *</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GSTIN</Label>
              <Input {...register("gstin")} />
            </div>
            <div>
              <Label>PAN</Label>
              <Input {...register("pan")} />
            </div>
          </div>

          <div>
            <Label>Address Line 1</Label>
            <Input {...register("addressLine1")} />
          </div>
          <div>
            <Label>Address Line 2</Label>
            <Input {...register("addressLine2")} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>City & Pincode</Label>
              <Input {...register("cityPin")} />
            </div>
            <div>
              <Label>State Name</Label>
              <Input {...register("stateName")} />
            </div>
            <div>
              <Label>State Code (e.g. 24)</Label>
              <Input {...register("stateCode")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving} className="bg-[#1F3B57] hover:bg-[#1F3B57]/90 text-white">
              {isSaving ? "Saving..." : "Save Party"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
