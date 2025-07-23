import { type Message, MessageDirection } from "@/lib/types"
import { format } from "date-fns"

interface MessageBubbleProps {
  message: Message
}


export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === MessageDirection.OUTGOING
  

  return (
    <div className={`flex mb-2 ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div className="max-w-xs lg:max-w-md">
        <div
          className={`px-4 py-2 rounded-2xl text-white text-sm ${
            isOutgoing ? "bg-[#428aff] rounded-br-md" : "bg-[#3b3b3d] rounded-bl-md"
          }`}
        >
          {message.content}
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${isOutgoing ? "text-right" : "text-left"}`}>
          {format(new Date(message.createdAt), "MMM d, h:mm a")}
        </div>
      </div>
    </div>
  )
}
