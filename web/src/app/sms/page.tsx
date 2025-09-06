"use client"

import { useState, useEffect, useRef } from "react"
import { 
  getContacts, 
  getContactWithMessages, 
  getUserSettings, 
  updateLastSelectedContact, 
  getContactById, 
  updateContactLastVisited,
  sendMessage
} from "@/app/actions"
import type { 
  Contact, 
  UserSettings,
} from "@/lib/types"
import { MessageDirection } from "@/lib/types"
import { useSettings } from "@/contexts/settings-context"
import { ContactSidebar } from "@/components/contact-sidebar"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { ContactFormModal } from "@/components/contact-form-modal"
import { EditContactModal } from "@/components/contact-edit-form-modal"
import { UserSettingsModal } from "@/components/wip-user-settings-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
//import { WebSocket } from "ws" // Ensure you have ws installed if using Node.js
import Keyboard from "@/components/keyboard"
import { useFocusNavigation } from "@/lib/useFocusNavigation"
import { focusState } from "@/lib/focusManager"

import { set } from "date-fns"
const showContactTopbar = true // Whether to show the top bar with contact name and phone number

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false) // Based on user settings
  const [currentUserSettings, setCurrentUserSettings] = useState<any>(null) // Adjust type as needed
  const [typedMessage, setTypedMessage] = useState<string>("")
  
  const [arrowNavigation, setArrowNavigation] = useState<boolean>(false) // Whether arrow navigation is enabled
  const [messageScrollPos, setMessageScrollPos] = useState<number>(0) // Track scroll position for messages
  // Load user settings on mount
  useEffect(() => {
    const loadUserSettings = async () => {
      const settings = await getUserSettings()
      setCurrentUserSettings(settings)
      setIsKeyboardEnabled(settings?.enableVirtualKeyboard || false) // Example condition

      // Set initial focused area based on settings
      if (settings?.navigationMode === "ARROW_KEYS") {
        //setFocusedArea("topbar") // Default focus area
        //setFocusedAreaIndex(0)
        setArrowNavigation(true) // Enable arrow navigation
      } else {
        setArrowNavigation(false) // Disable arrow navigation
      }
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
    } else {
      const sortedContacts = fetchedContacts.sort((a, b) => {
        return (b.lastVisited?.getTime() || 0) - (a.lastVisited?.getTime() || 0)
      })
      setContacts(sortedContacts)
      setSelectedContact(sortedContacts[0]) // Select the first contact by default
    }
    
    setIsLoading(false)
  }

  const loadSelectedContact = async (contactId: number) => {
    const contact = await getContactWithMessages(contactId)
    if (contact) {
      setSelectedContact(contact)
      // Update last visited time
      await updateContactLastVisited(contactId)
      scrollToBottom()
    }
  }

  useEffect(() => {
    loadContacts()
    try {
      
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
  
  useEffect(() => {
    scrollToBottom(false)
  }, [selectedContact?.messages])

  const handleMessageSent = () => {
    if (selectedContact) {
      loadSelectedContact(selectedContact.id)
    }
  }
  
  const handleEnterPress = async () => {
    if (selectedContact && typedMessage.trim()) {
      // Send the message
      // handleMessageSent();
      // Use message-input.tsx to activate the handleSubmit function
      const message = typedMessage.trim();
      await sendMessage(selectedContact.id, message, MessageDirection.OUTGOING)
        .then(() => {
          handleMessageSent();
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
      setTypedMessage(""); // Clear the input after sending
    }
  }

  const handleBackPress = () => {
    window.location.href = "/main-menu";
  }
  // if esc key is pressed handleBackPress
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.location.href = "/main-menu";
        //handleBackPress();
        //window.location.href = "/main-menu";
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }
  , []);
  // why does it not work?
  

  const handleVirtualArrow = (direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    // messageScrollPos is the current scroll position of the messages container (i.e the last message)
    // When pressing UP, we want to scroll up to the message above the current one
    const messagesContainer = document.querySelector(".flex-1.overflow-y-auto") as HTMLDivElement
    if (!messagesContainer) return;
    const scrollAmount = 50; // Adjust this value as needed for smoother or faster scrolling
    if (direction === "UP") {
      messagesContainer.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    } else if (direction === "DOWN") {
      messagesContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
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
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header showing selectedContact.Name */}
            { showContactTopbar &&
              <div className="p-2 border-b border-gray-600 bg-[#2d2d2d] flex items-center justify-between">
                <div>
                <h2 className="text-white font-semibold">{selectedContact.name || selectedContact.phone}</h2>
                {selectedContact.name && selectedContact.name !== selectedContact.phone && (
                  <p className="text-sm text-gray-400">{selectedContact.phone}</p>
                )}
                </div>
              </div>
            }
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedContact.messages?.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            <MessageInput 
              contactId={selectedContact.id} 
              onMessageSent={handleMessageSent} 
              typedMessage={typedMessage} 
              setTypedMessage={setTypedMessage} />
            {/* Keyboard Component if user has virtual keyboard enabled */}
            { isKeyboardEnabled && (
              <Keyboard 
                typedMessage={typedMessage} 
                setTypedMessage={setTypedMessage}
                onEnter={handleEnterPress}
                onBack={handleBackPress}
                usageType={"chat"}
                onArrow={(direction) => {
                  // Handle arrow navigation within messages if needed
                  handleVirtualArrow(direction)
                  console.log("Arrow pressed in chat:", direction)
                }}
              />)}
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
    </div>
  )
}
