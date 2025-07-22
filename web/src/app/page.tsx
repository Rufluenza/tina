"use client"

import { useState, useEffect } from "react"
import { getContacts, getContactWithMessages } from "@/app/actions"
import type { Contact } from "@/lib/types"
import { ContactSidebar } from "@/components/contact-sidebar"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { ContactFormModal } from "@/components/contact-form-modal"
import { EditContactModal } from "@/components/contact-edit-form-modal"
import { UserSettingsModal } from "@/components/user-settings-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadContacts = async () => {
    setIsLoading(true)
    const fetchedContacts = await getContacts()
    setContacts(fetchedContacts)
    /*
    if (fetchedContacts instanceof Response) {
      // If fetchedContacts is a Response object, parse it as JSON
      const data = await fetchedContacts.json()
      setContacts(data)
    }
    */
    // Why do i get error when trying to parse fetchedContacts?
    // if (fetchedContacts instanceof Response) {
    //   const data = await fetchedContacts.json()
    //   setContacts(data)
    // } else {
    //   setContacts(fetchedContacts)
    // }
    // If no contacts exist, open the contact form

    if (fetchedContacts.length === 0) {
      setIsContactFormOpen(true)
    } else if (!selectedContact) { // TODO: MAKE DEFAULT SELECTED CONTACT THE LAST ONE
      setSelectedContact(fetchedContacts[0])

    }
    setIsLoading(false)
  }

  const loadSelectedContact = async (contactId: number) => {
    const contact = await getContactWithMessages(contactId)
    if (contact) {
      setSelectedContact(contact)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const handleSelectContact = (contactId: number) => {
    loadSelectedContact(contactId)
  }

  const handleContactCreated = () => {
    loadContacts()
  }

  const handleMessageSent = () => {
    if (selectedContact) {
      loadSelectedContact(selectedContact.id)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#1e1e1e] flex">
      {/* Sidebar */}
      <ContactSidebar
        contacts={contacts}
        selectedContactId={selectedContact?.id || null}
        onSelectContact={handleSelectContact}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-600 bg-[#2d2d2d] flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{selectedContact.name || selectedContact.phone}</h2>
                {selectedContact.name && selectedContact.name !== selectedContact.phone && (
                  <p className="text-sm text-gray-400">{selectedContact.phone}</p>
                )}
              </div>
              <Button
                onClick={() => setIsContactFormOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white bg-gray-700 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Contact
              </Button>
              {/* User Settings Button */}
              <Button
                onClick={() => setIsUserSettingsOpen(true)}
                variant="outline"
                size="sm"
                className="m-4 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
              >
                User Settings
              </Button>
              {/* Edit Contact Button */}
              <Button
                onClick={() => setIsEditContactOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white bg-gray-700 hover:bg-gray-700"
              >
                Edit Contact
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedContact.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>

            {/* Message Input */}
            <MessageInput contactId={selectedContact.id} onMessageSent={handleMessageSent} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-4">Select a conversation to start messaging</p>
              <Button onClick={() => setIsContactFormOpen(true)} className="bg-[#428aff] hover:bg-[#3a7ae4]">
                <Plus className="w-4 h-4 mr-2" />
                Add New Contact
              </Button>
            </div>
          </div>
        )}
        
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        onContactCreated={handleContactCreated}
      />
      {/* User Settings Form Modal*/ }
      <UserSettingsModal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        onSettingsUpdated={() => {
          // Optionally handle settings update
          
          setIsUserSettingsOpen(false)
        }}
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
