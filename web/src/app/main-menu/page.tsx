"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContactSidebar } from "@/components/contact-sidebar"
import { UserSettingsModal } from "@/components/user-settings-form-modal"
import { EditContactModal } from "@/components/contact-edit-form-modal"
import { getContacts, getUserSettings, updateContactLastVisited, updateLastSelectedContact } from "@/app/actions"
import { MainMenuProps } from "@/lib/types"

type MenuOption = "main" | "contacts" | "communication board" | "settings" | "more"

const ButtonOptions: { label: string; action: MenuOption }[] = [
  { label: "BACK", action: "main" },
  { label: "CONTACTS", action: "contacts" },
  { label: "COMMUNICATION BOARD", action: "communication board" },
  { label: "SETTINGS", action: "settings" },
  { label: "MORE", action: "more" },
]

export default function MainMenuPage({ previousPage }: MainMenuProps) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<MenuOption>("main")
  const [contacts, setContacts] = useState<any[]>([])
  const [userSettings, setUserSettings] = useState<any>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number>(0)

  // Run on mount to fetch contacts and user settings
  useEffect(() => {
    const fetchData = async () => {
      const fetchedContacts = await getContacts()
      setContacts(fetchedContacts)

      const settings = await getUserSettings()
      setUserSettings(settings)
      if (settings?.navigationMode === "ARROW_KEYS") {
        setHoveredIndex(0) // Start with first button hovered
      }
    }
    fetchData()
  }, [])

  // Handle hover state for menu buttons and use up/down arrowkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeView !== "main") return // Only navigate menu in main view

      if (e.key === "Escape") {
        setActiveView("main")
      } else if (e.key === "ArrowUp") {
        setHoveredIndex((prev) => (prev > 0 ? prev - 1 : ButtonOptions.length - 1))
      } else if (e.key === "ArrowDown") {
        setHoveredIndex((prev) => (prev < ButtonOptions.length - 1 ? prev + 1 : 0))
      } else if (e.key === "Enter") {
        const action = ButtonOptions[hoveredIndex].action
        handleAction(action)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hoveredIndex, activeView])

  const previousPageUrl = previousPage || "/sms"

  // Handle button click
  const handleAction = (action: MenuOption) => {
    if (action === "communication board") {
      router.push("/communication-board")
    } else if (action === "main") {
      router.push(previousPageUrl)
    } else {
      setActiveView(action)
    }
  }

  const handleSelectContact = async (contactId: number) => {
    await updateLastSelectedContact(contactId)
    await updateContactLastVisited(contactId)
    router.push(previousPageUrl)
  }

  return (
    <div className="w-screen h-screen bg-[#2d2d2d] flex items-center justify-center text-white">
      {activeView === "main" && (
        <div className="flex flex-col gap-6">
          {ButtonOptions.map((btn, index) => (
            <MenuButton
              key={btn.label}
              label={btn.label}
              onClick={() => handleAction(btn.action)}
              isHovered={hoveredIndex === index}
            />
          ))}
        </div>
      )}

      {activeView === "contacts" && (
        <div>
          <Button
            onClick={() => setActiveView("main")}
            className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-500 transition-colors"
          >
            Back
          </Button>
          
          <ContactSidebar
            contacts={contacts}
            selectedContactId={userSettings?.lastSelectedContact || null}
            onSelectContact={handleSelectContact}
            isOpen={true}
            onClose={() => setActiveView("main")}
          />
        </div>
      )}

      {activeView === "settings" && (
        <div>
          <Button
            onClick={() => setActiveView("main")}
            className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-500 transition-colors"
          >
            Back
          </Button>
          <UserSettingsModal isOpen={true} onClose={() => setActiveView("main")} />
        </div>
      )}

      {activeView === "more" && (
        <div>
          <Button
            onClick={() => setActiveView("main")}
            className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-500 transition-colors"
          >
            Back
          </Button>
          <EditContactModal isOpen={true} onClose={() => setActiveView("main")} />
        </div>
      )}
    </div>
  )
}

function MenuButton({
  label,
  onClick,
  isHovered,
}: {
  label: string
  onClick: () => void
  isHovered: boolean
}) {
  return (
    <Button
      onClick={onClick}
      className={`w-96 h-20 text-2xl font-bold transition-colors ${
        isHovered ? "bg-gray-500" : "bg-gray-700 hover:bg-gray-500"
      }`}
    >
      {label}
    </Button>
  )
}
