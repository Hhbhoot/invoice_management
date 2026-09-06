"use client"

import { useState } from "react"
import { Party } from "@prisma/client"
import PartyFormModal from "./PartyFormModal"
import { deleteParty } from "@/lib/actions/parties"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"

export default function PartyList({ initialParties }: { initialParties: Party[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)

  const openNewParty = () => {
    setSelectedParty(null)
    setIsModalOpen(true)
  }

  const openEditParty = (party: Party) => {
    setSelectedParty(party)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this party?")) {
      await deleteParty(id)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Parties (Customers)</h2>
          <p className="text-gray-500 text-sm">Manage your customer list for quick invoice creation.</p>
        </div>
        <Button onClick={openNewParty} className="bg-[#1F3B57] hover:bg-[#1F3B57]/90 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Party
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">GSTIN</th>
              <th className="px-6 py-3 font-medium">State</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialParties.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No parties found. Add one to get started.
                </td>
              </tr>
            ) : (
              initialParties.map((party) => (
                <tr key={party.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{party.name}</td>
                  <td className="px-6 py-4">{party.gstin || '-'}</td>
                  <td className="px-6 py-4">{party.stateName} {party.stateCode ? `(${party.stateCode})` : ''}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => openEditParty(party)} className="p-2 text-gray-500 hover:text-[#C9A227] transition-colors rounded hover:bg-gray-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(party.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded hover:bg-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <PartyFormModal 
          party={selectedParty} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  )
}
