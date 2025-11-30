"use client"

import { useEffect, useState, useRef } from "react"
import type React from "react"
import { sendMessage } from "@/app/actions"
import { MessageDirection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  contactId: number
  onMessageSent: () => void
  typedMessage: string
  setTypedMessage?: (message: string) => void
  messagePointer?: number
}

export function MessageInput({ contactId, onMessageSent, typedMessage, setTypedMessage, messagePointer=typedMessage.length }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync controlled prop
  useEffect(() => {
    if (typedMessage !== undefined) {
      setMessage(typedMessage)
    }
  }, [typedMessage])

  // Auto resize on content change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px" // reset first
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [message])

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
  
  // Split the message into three parts: before cursor, at cursor, after cursor
  const beforeCursor = message.slice(0, messagePointer)
  const afterCursor = message.slice(messagePointer)

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-600">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-[#3b3b3d] border border-gray-600 text-white placeholder-gray-400 
                     rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#428aff] 
                     max-h-40 overflow-y-auto"
        />
        <Button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-[#428aff] hover:bg-[#3a7ae4] h-10 w-10 flex items-center justify-center rounded-lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
