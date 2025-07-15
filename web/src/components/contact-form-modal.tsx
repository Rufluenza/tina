"use client"

import type React from "react"

import { useState } from "react"
import { createContact } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
  onContactCreated: () => void
}

export function ContactFormModal({ isOpen, onClose, onContactCreated }: ContactFormModalProps) {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d2d2d] border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="bg-[#3b3b3d] border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name"
              className="bg-[#3b3b3d] border-gray-600 text-white"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !phone.trim()} className="bg-[#428aff] hover:bg-[#3a7ae4]">
              {isLoading ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
