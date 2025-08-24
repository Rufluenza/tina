// This will fill the entire screen and have a background color of #2d2d2d
// Then i want to have a vertical menu in the center of the screen with 5 buttons
// I want to have the following buttons:
/*
BACK // closes modal
CONTACTS // Open contacts modal
COMMUNICATION BOARD // Open communication board url /communication-board
SETTINGS // Open settings modal (user-settings-form-modal.tsx)
MORE // For now open modal /contact-edit-form-modal
*/
"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContactSidebar } from "@/components/contact-sidebar" // You'll change this to full screen later
import { UserSettingsModal } from "@/components/user-settings-form-modal"
import { EditContactModal } from "@/components/contact-edit-form-modal"
import { getContacts, getUserSettings, updateLastSelectedContact } from "@/app/actions"
import { MainMenuProps } from "@/lib/types"


type MenuOption = "main" | "contacts" | "settings" | "contactEdit"

export default function MainMenuPage({previousPage}: MainMenuProps) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<MenuOption>("main")
  const [contacts, setContacts] = useState<any[]>([])
  const [userSettings, setUserSettings] = useState<any>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)


  // Run on mount to fetch contacts and user settings
  useEffect(() => {
    const fetchData = async () => {
      const fetchedContacts = await getContacts()
      setContacts(fetchedContacts)

      const settings = await getUserSettings()
      setUserSettings(settings)
    }
    fetchData()
  }, [])

  // Handle hover state for menu buttons and use up/down arrowkeys

  // Escape key closes modals and returns to main menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveView("main")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const previousPageUrl = previousPage || "/"

  // Handle button click
  const handleAction = (action: MenuOption | "navigateBoard") => {
    if (action === "navigateBoard") {
      router.push("/communication-board")
    } else {
      setActiveView(action)
    }
  }
  const handleSelectContact = async (contactId: number) => {
    await updateLastSelectedContact(contactId)
    // go to main page just called /
    setActiveView("main")
    router.push("/") // previousPage || "/"
  }

  return (
    <div className="w-screen h-screen bg-[#2d2d2d] flex items-center justify-center text-white">
      {activeView === "main" && (
        <div className="flex flex-col gap-6">
          <MenuButton label="BACK" onClick={() => router.push(previousPageUrl)} />
          <MenuButton label="CONTACTS" onClick={() => handleAction("contacts")} />
          <MenuButton label="COMMUNICATION BOARD" onClick={() => handleAction("navigateBoard")} />
          <MenuButton label="SETTINGS" onClick={() => handleAction("settings")} />
          <MenuButton label="MORE" onClick={() => handleAction("contactEdit")} />
        </div>
      )}

      {activeView === "contacts" && (
        <ContactSidebar contacts={contacts}
          selectedContactId={userSettings?.lastSelectedContact || null}
          onSelectContact={handleSelectContact}
          isOpen={true} 
          onClose={() => setActiveView("main")} />
      )}

      {activeView === "settings" && (
        <UserSettingsModal isOpen={true} onClose={() => setActiveView("main")} />
      )}

      {activeView === "contactEdit" && (
        <EditContactModal isOpen={true} onClose={() => setActiveView("main")} />
      )}
    </div>
  )
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="w-96 h-20 text-2xl font-bold bg-gray-700 hover:bg-gray-500 transition-colors"
    >
      {label}
    </Button>
  )
}
