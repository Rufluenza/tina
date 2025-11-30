"use client"

import { useState, useEffect } from "react"
import { getContactsClean, createContact } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Contact } from "@/lib/types"
import Keyboard from "./keyboard"

interface CreateContactForm {
  isOpen: boolean
  onClose: () => void
  onContactCreated: () => void
}

export function CreateContactForm({ isOpen, onClose, onContactCreated }: CreateContactForm) {
  if (!isOpen) return null
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [activeField, setActiveField] = useState<"phone" | "name" | null>(null)
  const [hoveredItem, setHoveredItem] = useState(0) // 0=contact select, 1=phone, 2=name, 3=cancel, 4=save
  const [existingContacts, setExistingContacts] = useState<Contact[]>([])
  // ---- Keyboard navigation ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (activeField) return // ignore when typing

      // --- Normal navigation ---
      if (e.key === "ArrowDown") {
        setHoveredItem(i => Math.min(i + 1, 3))
      } else if (e.key === "ArrowUp") {
        setHoveredItem(i => Math.max(i - 1, 0))
      } else if (e.key === "ArrowRight") {
        if (hoveredItem === 3) {
          setHoveredItem(3)
        }
      } else if (e.key === "ArrowLeft") {
        if (hoveredItem === 4) {
          setHoveredItem(2)
        }
      }
      else if (e.key === "Enter") {
        if (hoveredItem === 0) {
          setActiveField("phone")
        } else if (hoveredItem === 1) {
          setActiveField("name")
        } else if (hoveredItem === 2) {
          onClose()
        } else if (hoveredItem === 3) {
          handleSubmit(new Event("submit") as any)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hoveredItem, isOpen, activeField])

  

  

  // Fetch existing contacts when the modal opens
  useEffect(() => {
    const fetchContacts = async () => {
      const contacts = await getContactsClean()
      setExistingContacts(contacts)
    }

    if (isOpen) {
      fetchContacts()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setIsLoading(true)
    try {
      const contact = await createContact(phone, name || phone)
      if (contact) {
        onContactCreated()
        onClose()
        setPhone("")
        setName("")
      }
    } catch (error) {
      console.error("Error creating contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#2d2d2d] border-gray-600 text-white p-4 w-full">
      <h2 className="text-lg font-semibold mb-4">Add Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div>
          <Label htmlFor="edit-phone">Phone</Label>
          <Input
            id="edit-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onFocus={() => setActiveField("phone")}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${
              hoveredItem === 0 ? "ring-2 ring-blue-500" : ""
            }`}
            required
          />
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setActiveField("name")}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${
              hoveredItem === 1 ? "ring-2 ring-blue-500" : ""
            }`}
            required
          />
        </div>

        
          

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${
              hoveredItem === 2 ? "ring-2 ring-blue-500" : ""
            }`}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className={`bg-[#3b3b3d] border-gray-600 text-white ${
              hoveredItem === 3 ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Full-width keyboard */}
      {activeField && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Keyboard
            typedMessage={activeField === "phone" ? phone : name}
            setTypedMessage={activeField === "phone" ? setPhone : setName}
            onEnter={() => setActiveField(null)}
            onBack={() => setActiveField(null)} // Revert to previous state
            usageType={activeField === "phone" ? "phone" : "form"}
          />
        </div>
      )}
    </div>
  )
}
