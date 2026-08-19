"use client"

import { useState } from "react"
import type React from "react"
import { sendMessage } from "@/app/actions"
import { MessageDirection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  contactId: number
  onMessageSent: () => void
  typedMessage: string
  setTypedMessage?: React.Dispatch<React.SetStateAction<string>>
  messagePointer?: number
}

export function MessageInput({
  contactId,
  onMessageSent,
  typedMessage,
  setTypedMessage,
  messagePointer = typedMessage.length,
}: MessageInputProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedMessage.trim()) return

    setIsLoading(true)
    try {
      await sendMessage(contactId, typedMessage.trim(), MessageDirection.OUTGOING)
      setTypedMessage?.("")
      onMessageSent()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clamp defensively in case pointer and message length are momentarily out of sync
  const pos = Math.max(0, Math.min(messagePointer, typedMessage.length))
  const beforeCursor = typedMessage.slice(0, pos)
  const afterCursor = typedMessage.slice(pos)

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-600 min-w-0">
      <div className="flex gap-2 items-end min-w-0">
        <div
          className="flex-1 min-w-0 bg-[#3b3b3d] border border-gray-600 rounded-lg px-3 py-2
                     min-h-[40px] max-h-40 overflow-y-auto overflow-x-hidden focus:outline-none"
        >
          <div className="whitespace-pre-wrap break-all text-white text-sm leading-relaxed">
            {typedMessage.length === 0 ? (
              <span className="text-gray-400">Type a message...</span>
            ) : (
              <>
                {beforeCursor}
                <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle animate-caret-blink -mb-[2px]" />
                {afterCursor}
              </>
            )}
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading || !typedMessage.trim()}
          className="bg-[#428aff] hover:bg-[#3a7ae4] h-10 w-10 flex items-center justify-center rounded-lg shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}