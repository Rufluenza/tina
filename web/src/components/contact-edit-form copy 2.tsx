"use client"

import { useState, useEffect } from "react"
import { getContactsClean, updateContact, deleteContact } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Contact } from "@/lib/types"
import Keyboard from "./keyboard"

interface EditContactProps {
  isOpen: boolean
  onClose: () => void
  onContactUpdated?: () => void
}

export function EditContact({ isOpen, onClose, onContactUpdated }: EditContactProps) {
  if (!isOpen) return null
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [activeField, setActiveField] = useState<"phone" | "name" | null>(null)
  const [hoveredItem, setHoveredItem] = useState(0) // 0=contact select, 1=phone, 2=name, 3=cancel, 4=save

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownIndex, setDropdownIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (activeField) return // when a field is active, ignore navigation

      // Dropdown navigation
      if (dropdownOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setDropdownIndex(i => Math.min(i + 1, contacts.length - 1))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setDropdownIndex(i => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
          e.preventDefault()
          const chosen = contacts[dropdownIndex]
          if (chosen) {
            setSelectedId(chosen.id)
            setDropdownOpen(false)
          }
        } else if (e.key === "Escape") {
          setDropdownOpen(false)
        }
        return
      }

      // Normal navigation
      if (e.key === "ArrowDown") {
        setHoveredItem(i => Math.min(i + 1, 4))
      } else if (e.key === "ArrowUp") {
        setHoveredItem(i => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        if (hoveredItem === 1) {
          setActiveField("phone")
        } else if (hoveredItem === 2) {
          setActiveField("name")
        } else if (hoveredItem === 3) {
          onClose()
        } else if (hoveredItem === 4) {
          handleSubmit(new Event("submit") as any)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hoveredItem, isOpen, activeField, dropdownOpen, dropdownIndex, contacts])


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
    <div className="bg-[#2d2d2d] border-gray-600 text-white p-4 max-w-md w-full">
      <h2 className="text-lg font-semibold mb-4">Edit Contact</h2>
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
            onFocus={(e) => setActiveField("phone")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                setActiveField(null)
              }
            }}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${hoveredItem === 1 ? "ring-2 ring-blue-500" : ""}`}
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
            onFocus={(e) => setActiveField("name")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                setActiveField(null)
              }
            }}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${hoveredItem === 2 ? "ring-2 ring-blue-500" : ""}`}
            required
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
        

      
      {activeField && (
        <Keyboard
          typedMessage={activeField === "phone" ? phone : name}
          setTypedMessage={activeField === "phone" ? setPhone : setName}
          onEnter={() => setActiveField(null)} // pressing Enter in virtual keyboard also hides it
          usageType="form"
        />
      )}
    </div>
  );
}
