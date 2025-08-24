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

//import { MessageDirection } from "@prisma/client"

const focusSectionList = ["topbar", "sidebar", "messages", "keyboard", "modal"] as const
const topbarButtons = ["toggle-sidebar-button", "new-contact-button", "user-settings-button", "edit-contact-button"]


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
  const [typedMessage, setTypedMessage] = useState<string>("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [showTopbar, setShowTopbar] = useState(true)
  //const [focusedArea, setFocusedArea] = useState<any | null>(null)
  //const [focusedAreaIndex, setFocusedAreaIndex] = useState<number | null>(null)
  const [arrowNavigation, setArrowNavigation] = useState<boolean>(false) // Whether arrow navigation is enabled
  const { focusedArea, focusedAreaIndex } = useFocusNavigation(arrowNavigation) // Custom hook for focus navigation
  const [topbarIndex, setTopbarIndex] = useState<number>(0) // Index for navigation through focusable areas
  const [topbarItem, setTopbarItem] = useState<string | null>(null) // Currently focused navigation item
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

  // Focus management
  useEffect(() => {
    if (!arrowNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("Key pressed:", e.key)
      // We're inside a section now
      if (focusState.currentSection) {
        console.log("Current active section:", focusState.currentSection)
        const up = e.key === "ArrowUp"
        const down = e.key === "ArrowDown"
        const left = e.key === "ArrowLeft"
        const right = e.key === "ArrowRight"
        const enter = e.key === "Enter"

        if (e.key === "Escape") {
          focusState.clearFocus()
          console.log("Focus cleared")
        }
        const section = focusState.currentSection
        if (section === "topbar") {
          const btnIndex = topbarIndex
          var dir = 0 // 1 for right, -1 for left
          console.log("Topbar item index:", btnIndex)
          if (e.key === "ArrowLeft") {
            // Move focus to the previous topbar button
            if (topbarIndex > 0) {
              dir = -1
              // const oldButton = document.getElementById(topbarButtons[btnIndex])
              // if (oldButton) {
              //   oldButton.classList.remove("bg-white")
              //   oldButton.classList.add("bg-gray-700")
              // }
              // setTopbarIndex(btnIndex - 1)
              // setTopbarItem(topbarButtons[btnIndex - 1])

              // console.log("Focused on previous topbar button:", topbarButtons[btnIndex - 1])
              // const newButton = document.getElementById(topbarButtons[btnIndex - 1])
              // if (newButton) {
              //   newButton.classList.remove("bg-gray-700")
              //   newButton.classList.add("bg-white")
              // }
            }
          } else if (e.key === "ArrowRight") {
            if (topbarIndex < topbarButtons.length - 1) {
              dir = 1
              // setTopbarIndex(btnIndex + 1)
              // setTopbarItem(topbarButtons[btnIndex + 1])
              // console.log("Focused on next topbar button:", topbarButtons[btnIndex + 1])
            }
          }
          if (dir !== 0) {
            // Move focus to the next/previous button
            const newIndex = (btnIndex + dir + topbarButtons.length) % topbarButtons.length
            setTopbarIndex(newIndex)
            setTopbarItem(topbarButtons[newIndex])
            console.log("Focused on topbar button:", topbarButtons[newIndex])
            
            // add
            const oldButton = document.getElementById(topbarButtons[btnIndex])
            if (oldButton) {
              // Remove the on hover effect
              oldButton.classList.remove("hover")
              // Will this remove the hover effect?

              oldButton.classList.remove("bg-white")
              oldButton.classList.add("bg-gray-700")
            }
            const newButton = document.getElementById(topbarButtons[newIndex])
            if (newButton) {
              // Add the on hover effect
              newButton.classList.add("hover")
              // will this activate the hover?
              // a: 
              newButton.classList.remove("bg-gray-700")
              newButton.classList.add("bg-white")
            }
            
            
          }
        } else if (section === "sidebar") {
          // Handle sidebar navigation if needed
          console.log("Navigating sidebar, current section:", section)

        }

        
      } else {
        console.log("Not focused, hovering over:", focusState.currentSection)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [arrowNavigation, focusedArea, focusedAreaIndex, topbarIndex, topbarItem])
  
  /*
  useEffect(() => {
    if (currentUserSettings?.navigationMode === "ARROW_KEYS") {
      if (!focusedAreaIndex) return
      const prevFocusColor = "bg-gray-700"
      const currentFocusColor = "bg-gray-800"
      const handleKeyDown = (e: KeyboardEvent) => {
        //e.preventDefault() // Prevent default arrow key behavior

        // If a focus area is NOT selected
        if (focusState.currentSection === null) { // meaning that we are trying to select a focus area

          if (e.key === "ArrowDown") {
            if (focusedAreaIndex < focusSectionList.length - 1) {
              setFocusedAreaIndex((prev) => (prev !== null ? prev + 1 : 0)) // Move down in the focus list if not at the end
              setFocusedArea(focusSectionList[focusedAreaIndex + 1])
            }
          } else if (e.key === "ArrowUp") {
            if (focusedAreaIndex > 0) {
              setFocusedAreaIndex((prev) => (prev !== null ? prev - 1 : focusSectionList.length - 1)) // Move up in the focus list if not at the start
              setFocusedArea(focusSectionList[focusedAreaIndex - 1])
            }
          } else if (e.key === "Enter") {
            // If it is a button it will be different
            focusState.setFocus(focusedArea) // Set focus to the current focused area
          }
        } 
        // If a focus area is selected
        else {
          if (e.key === "ArrowLeft") {
            if (focusedArea === "topbar") {
              // move through the topbar buttons list and on enter select the item / activate the button
            }
          }
          else if (e.key === "Escape") {
            focusState.setFocus(null) // Clear focus if Escape is pressed
          }
          else if (e.key === "Enter") {
            // Only on top bar should this do something
          }
        }
      }
    } else return
  }, [])
  */

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

  

  const handleSelectContact = async (contactId: number) => {
    
    await updateLastSelectedContact(contactId) // Update last selected contact in user settings
    
    
    console.log("Selected contact ID:", currentUserSettings?.lastSelectedContact)
    loadSelectedContact(contactId)
    
    //setSelectedContact(contacts.find(contact => contact.id === contactId) || null)
  }

  const handleContactCreated = () => {
    loadContacts()
  }

  const handleMessageSent = () => {
    if (selectedContact) {
      loadSelectedContact(selectedContact.id)
    }
  }
  const handleSettingsUpdated = async (newSettings?: any) => { // Expects an optional settings object
    if (newSettings) {
      // If new settings are provided by the modal, use them directly
      setCurrentUserSettings(newSettings);
      setIsKeyboardEnabled(newSettings?.enableVirtualKeyboard || false);
    } else {
      // If no settings are provided (e.g., after a delete), refetch the latest
      const settings = await getUserSettings();
      setCurrentUserSettings(settings);
      setIsKeyboardEnabled(settings?.enableVirtualKeyboard || false);
    }
    setIsUserSettingsOpen(false); // Close the modal
  };
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
    setShowTopbar(!showTopbar)
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
      {/* open / close sidebar button */}

      {/* Sidebar */}
      { showSidebar && (
        <ContactSidebar
        contacts={contacts}
        selectedContactId={selectedContact?.id || null}
        onSelectContact={handleSelectContact}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-600 bg-[#2d2d2d] flex items-center justify-between">
              { /* only show the top bar if showTopbar is true from here --- */}
              { showTopbar && (
                <div>
                
                  <div>
                    <h2 className="text-white font-semibold">{selectedContact.name || selectedContact.phone}</h2>
                    {selectedContact.name && selectedContact.name !== selectedContact.phone && (
                      <p className="text-sm text-gray-400">{selectedContact.phone}</p>
                    )}
                  </div>
                  {/* Toggle Sidebar Button */}
                  <Button
                    onClick={() => setShowSidebar(!showSidebar)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white bg-gray-700 hover:bg-white"
                    id="toggle-sidebar-button"
                  >
                    {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                  </Button>
                  {/* New Contact Button */}
                  <Button
                    onClick={() => setIsContactFormOpen(true)}
                    variant="outline"
                    size="sm"
                    className="m-4 border-gray-600 text-white bg-gray-700 hover:bg-white"
                    id="new-contact-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Contact
                  </Button>
                  {/* User Settings Button */}
                  <Button
                    onClick={() => setIsUserSettingsOpen(true)}
                    variant="outline"
                    size="sm"
                    className="m-4 border-gray-600 text-white bg-gray-700 hover:bg-white"
                    id="user-settings-button"
                  >
                    User Settings
                  </Button>
                  {/* Edit Contact Button */}
                  <Button
                    onClick={() => setIsEditContactOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white bg-gray-700 hover:bg-white"
                    
                    id="edit-contact-button"
                  >
                    Edit Contact
                  </Button>
                  {/* Open communication board /communication-board as url but in the current window */}
                  <Button
                    onClick={() => window.open("/communication-board", "_blank")}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white bg-gray-700 hover:bg-white"
                    id="communication-board-button"
                  >
                    Communication Board
                  </Button>
                  {/* Open /main-menu page as url */}
                  <Button
                    onClick={() => window.open("/main-menu", "_blank")}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white bg-gray-700 hover:bg-white"
                    id="main-menu-button"
                  >
                    Main Menu
                  </Button>
                </div>
              )}
            

            </div>
            { /* End of showTopbar if true */}
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
            {/* Keyboard Component if user has virtual keyboard enabled, TODO: Make Enter send message */}
            { isKeyboardEnabled && (
              <Keyboard 
                typedMessage={typedMessage} 
                setTypedMessage={setTypedMessage}
                onEnter={handleEnterPress}
                onBack={handleBackPress}
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
        onSettingsUpdated={handleSettingsUpdated}
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
