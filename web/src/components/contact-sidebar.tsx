"use client"

import type { Contact } from "@/lib/types"
import { format } from "date-fns"

interface ContactSidebarProps {
  contacts: Contact[]
  selectedContactId: number | null
  onSelectContact: (contactId: number) => void
}

export function ContactSidebar({ contacts, selectedContactId, onSelectContact }: ContactSidebarProps) {
  
  return (
    <div className="w-80 bg-[#2d2d2d] border-r border-gray-600 flex flex-col">
      <div className="p-4 border-b border-gray-600">
        <h2 className="text-white font-semibold text-lg">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => {
          const lastMessage = contact.messages[contact.messages.length - 1]
          return (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#3b3b3d] transition-colors ${
                selectedContactId === contact.id ? "bg-[#428aff]" : ""
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
    </div>
  )
}
