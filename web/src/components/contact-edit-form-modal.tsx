"use client"

import { useState, useEffect } from "react"
import { getContactsClean, updateContact, deleteContact } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Contact } from "@/lib/types"

interface EditContactModalProps {
  isOpen: boolean
  onClose: () => void
  onContactUpdated?: () => void
}

export function EditContactModal({ isOpen, onClose, onContactUpdated }: EditContactModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch contacts on open
  useEffect(() => {
    const fetchContacts = async () => {
      const result = await getContactsClean()
      setContacts(result)
    }

    if (isOpen) {
      fetchContacts()
    }
  }, [isOpen])

  // Populate form when a contact is selected
  useEffect(() => {
    if (selectedId !== null) {
      const selected = contacts.find((c) => c.id === selectedId)
      if (selected) {
        setName(selected.name)
        setPhone(selected.phone)
      }
    }
  }, [selectedId, contacts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || !phone.trim()) return

    setIsLoading(true)
    try {
      await updateContact(selectedId, { name, phone })
      onClose()
      onContactUpdated?.()
      setSelectedId(null)
      setName("")
      setPhone("")
    } catch (err) {
      console.error("Failed to update contact:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d2d2d] border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="contact-select">Select Contact</Label>
            <select
              id="contact-select"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="bg-[#3b3b3d] border-gray-600 text-white w-full p-2 rounded"
              required
            >
              <option value="">-- Choose contact --</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.phone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#3b3b3d] border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#3b3b3d] border-gray-600 text-white"
            />
          </div>
          { /* Only show delete button if a contact is selected */ }
          {selectedId && (
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                if (selectedId) {
                  await deleteContact(selectedId)
                  setSelectedId(null)
                  setName("")
                  setPhone("")
                  onContactUpdated?.()
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              >
                Delete Contact
              </Button>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#428aff] hover:bg-[#3a7ae4]">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
