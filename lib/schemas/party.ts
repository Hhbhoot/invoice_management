import { z } from "zod"

export const partySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Party name is required"),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  cityPin: z.string().optional().nullable(),
  stateName: z.string().optional().nullable(),
  stateCode: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
})
