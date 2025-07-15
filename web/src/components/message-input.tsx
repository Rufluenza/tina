"use client"

import type React from "react"

import { useState } from "react"
import { sendMessage } from "@/app/actions"
import { MessageDirection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface MessageInputProps {
  contactId: number
  onMessageSent: () => void
}

export function MessageInput({ contactId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsLoading(true)
    try {
      await sendMessage(contactId, message.trim(), MessageDirection.OUTGOING)
      setMessage("")
      onMessageSent()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-600">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#3b3b3d] border-gray-600 text-white placeholder-gray-400"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !message.trim()} className="bg-[#428aff] hover:bg-[#3a7ae4]">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
