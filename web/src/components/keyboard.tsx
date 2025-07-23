"use client"

import { Button } from "@/components/ui/button"
import type { KeyboardProps } from "@/lib/types"
const keys = [
  ['Back', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '"'],
  ['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø', 'Enter'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'],
  ['Space']
]



export default function Keyboard({ typedMessage, setTypedMessage }: KeyboardProps) {
  const handleKeyPress = (key: string) => {
    if (key === "Backspace") {
      setTypedMessage(typedMessage.slice(0, -1))
    } else if (key === "Space") {
      setTypedMessage(typedMessage + " ")
    } else if (["Enter", "Caps Lock", "Back"].includes(key)) {
      console.log(`Special key pressed: ${key}`)
    } else {
      setTypedMessage(typedMessage + key)
    }
  }

  

  return (
    <div className="w-full p-2 bg-[#2d2d2d] border-t border-gray-700">
      <div className="grid gap-1">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center flex-wrap">
            {row.map((key, keyIndex) => (
              <Button
                key={keyIndex}
                variant="outline"
                className={`
                  h-10 font-medium text-sm text-white bg-gray-800 border-gray-600 hover:bg-gray-700
                  ${key === 'Space' ? 'w-64' : 'w-10'}
                  ${['Backspace', 'Enter'].includes(key) ? 'w-20' : ''}
                  ${['Back', 'Caps Lock'].includes(key) ? 'w-24' : ''}
                  ${['Å', 'Æ', 'Ø', '"'].includes(key) ? 'w-10' : ''}
                `}
                onClick={() =>
                  handleKeyPress(key)

                }
              >
                {key}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
