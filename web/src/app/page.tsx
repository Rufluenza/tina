"use client"

import { useState, useEffect, useRef } from "react"
import { getContacts, getContactWithMessages, getUserSettings } from "@/app/actions"
import type { Contact } from "@/lib/types"
import { useSettings } from "@/contexts/settings-context"
import { ContactSidebar } from "@/components/contact-sidebar"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { ContactFormModal } from "@/components/contact-form-modal"
import { EditContactModal } from "@/components/contact-edit-form-modal"
import { UserSettingsModal } from "@/components/user-settings-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
//import { WebSocket } from "ws" // Ensure you have ws installed if using Node.js
import Keyboard from "@/components/keyboard"




export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  //const { settings, isLoading: isLoadingSettings } = useSettings() // Assuming you have a SettingsContext
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false) // Based on user settings
  const [currentUserSettings, setCurrentUserSettings] = useState<any>(null) // Adjust type as needed
  const [typedMessage, setTypedMessage] = useState("")
  // Load user settings on mount
  useEffect(() => {
    const loadUserSettings = async () => {
      const settings = await getUserSettings()
      setCurrentUserSettings(settings)
      setIsKeyboardEnabled(settings?.enableVirtualKeyboard || false) // Example condition
    }

    loadUserSettings()
  }, [])
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }



  const loadContacts = async () => {
    setIsLoading(true)
    const fetchedContacts = await getContacts()
    setContacts(fetchedContacts)
    

    if (fetchedContacts.length === 0) {
      setIsContactFormOpen(true)
    } else if (!selectedContact) { // TODO: MAKE DEFAULT SELECTED CONTACT THE LAST ONE
      // TODO: Get the contact with the most recent messages that are outgoing

      setSelectedContact(fetchedContacts[0])
      //scrollToBottom()

    }
    setIsLoading(false)
  }

  const loadSelectedContact = async (contactId: number) => {
    const contact = await getContactWithMessages(contactId)
    if (contact) {
      setSelectedContact(contact)
      scrollToBottom()
    }
  }

  useEffect(() => {
    loadContacts()
    try {
      // ✨ CHANGE: Point to your new WebSocket server port
      const socket = new WebSocket(`ws://localhost:3001`)

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === "new-message") {
          setSelectedContact((prev) => {
            if (prev?.id === data.contactId) {
              
              loadSelectedContact(data.contactId)
            }
            return prev
          })
        }
      }

      return () => {
        socket.close()
      }
    } catch (error) {
      console.error("WebSocket connection error:", error)
    }
  }, []) // This effect should run only once on mount
  /*
  useEffect(() => {
    loadContacts()
    try {
      const socket = new WebSocket(`ws://localhost:3000`)
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === "new-message") {
          setSelectedContact((prev) => {
            if (prev?.id === data.contactId) {
              loadSelectedContact(data.contactId)
            }
            return prev
          })
        }
      }

      return () => {
        socket.close()
      }
    } catch (error) {
      console.error("WebSocket connection error:", error)
    }
  }, [])
  */

  useEffect(() => {
    scrollToBottom(false)
  }, [selectedContact?.messages])

  

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
              {selectedContact.messages?.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>


            {/* Message Input */}
            <MessageInput contactId={selectedContact.id} onMessageSent={handleMessageSent} typedMessage={typedMessage} setTypedMessage={setTypedMessage} />
            {/* Keyboard Component if user has developer mode enabled */}
            { isKeyboardEnabled && (<Keyboard typedMessage={typedMessage} setTypedMessage={setTypedMessage} />)}
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
