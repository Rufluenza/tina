"use client"

import { useState, useEffect } from "react"
import type { Contact } from "@/lib/types"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ContactFormModal } from "@/components/contact-form-modal"
import { EditContactModal } from "@/components/contact-edit-form-modal"
import { getContacts, getUserSettings } from "@/app/actions"
interface ContactSidebarProps {
  contacts: Contact[]
  selectedContactId: number | null
  onSelectContact: (contactId: number) => void
}



export function ContactSidebar({ contacts, selectedContactId, onSelectContact }: ContactSidebarProps) {
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [fetchedContacts, setFetchedContacts] = useState<Contact[]>([])
  const [hoveredItem, setHoveredItem] = useState<number | null>(null) // index to fetched contact and buttons
  const [userSettings, setUserSettings] = useState<any>(null)

  const navigableItems = [
    { type: "button", id: "edit-contact-button", action: () => setIsEditContactOpen(true) },
    { type: "button", id: "add-contact-button", action: () => setIsContactFormOpen(true) },
    ...fetchedContacts.map((contact) => ({
      type: "contact",
      id: contact.id,
      action: () => onSelectContact(contact.id),
    })),
  ]

  const handleContactCreated = () => {
    setIsContactFormOpen(false)
    // Update contacts
    loadContacts() // Reload contacts after creating a new one
    // Optionally, you can refresh contacts or perform other actions here
  }
  const loadContacts = async () => {
    const fetchedContacts = await getContacts()
    setFetchedContacts(fetchedContacts)
    if (fetchedContacts.length === 0) {
      setIsContactFormOpen(true)
    } else {
      const sortedContacts = fetchedContacts.sort((a, b) => {
        return (b.lastVisited?.getTime() || 0) - (a.lastVisited?.getTime() || 0)
      })
      setFetchedContacts(sortedContacts)
      
      //setSelectedContact(sortedContacts[0]) // Select the first contact by default
    }
  }
  

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
    const fetchSettings = async () => {
      const settings = await getUserSettings()
      setUserSettings(settings)
      if (settings?.navigationMode === "ARROW_KEYS") {
        setHoveredItem(0) // Start with first item hovered
        selectedContactId = fetchedContacts[0]?.id || null
      }
    }
    fetchSettings()
  }, [])

  // Now add event listener for when user presses the up/down arrow
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((isContactFormOpen || isEditContactOpen)) return; // disable when modal is open

      if (userSettings?.navigationMode === "ARROW_KEYS") {
        if (event.key === "ArrowDown") {
          var newIndex = hoveredItem !== null ? Math.min(hoveredItem + 1, navigableItems.length - 1) : 0
          setHoveredItem(newIndex)
          
          console.log(newIndex)
        } else if (event.key === "ArrowUp") {
          var newIndex = hoveredItem !== null ? Math.max(hoveredItem - 1, 0) : 0
          setHoveredItem(newIndex)
          
          console.log(newIndex)
        } else if (event.key === "Enter") {
          if (hoveredItem !== null) {
            navigableItems[hoveredItem]?.action()
          }
        }
      }
      
    }
    

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [hoveredItem])

  // useEffect on moving with arrow keys to select contacts or buttons
  return (
    <div className="w-80 bg-[#2d2d2d] border-r border-gray-600 flex flex-col">
      <div className="p-4 border-b border-gray-600">
        <h2 className="text-white font-semibold text-lg">Contacts</h2>
        {/* Edit Contact Button */}
        <Button
          onClick={() => setIsEditContactOpen(true)}
          variant="outline"
          size="sm"
          className={`border-gray-600 text-white bg-gray-700 hover:bg-white ${hoveredItem === 0 ? "bg-[#428aff]" : ""}`}
          id="edit-contact-button"
        >
          Edit Contact
        </Button>
        {/* Add Contact Button */}
        <Button
          onClick={() => setIsContactFormOpen(true)}
          variant="outline"
          size="sm"
          className={`border-gray-600 text-white bg-gray-700 hover:bg-white ml-2 ${hoveredItem === 1 ? "bg-[#428aff]" : ""}`}
          id="add-contact-button"
        >
          Add Contact
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {fetchedContacts.map((contact) => {
          const lastMessage = contact.messages[contact.messages.length - 1]
          return (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#3b3b3d] transition-colors ${
                selectedContactId === contact.id && hoveredItem === null || hoveredItem !== null && hoveredItem > 1 && fetchedContacts[hoveredItem - 2]?.id === contact.id ? "bg-[#428aff]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{contact.name || contact.phone}</h3>
                {lastMessage && (
                  <span className="text-xs text-gray-400">{format(new Date(lastMessage.createdAt), "MMM d")}</span>
                )}
              </div>
              {contact.name && contact.name !== contact.phone && (
                <p className="text-sm text-gray-400">{contact.phone}</p>
              )}
              {lastMessage && <p className="text-sm text-gray-300 truncate mt-1">{lastMessage.content}</p>}
            </div>
          )
        })}
      </div>
      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        onContactCreated={handleContactCreated}
      />
      {/* Edit Contact Modal */}
      
      <EditContactModal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        onContactUpdated={handleContactCreated}
      />
      
    </div>
    
  )
  
}
