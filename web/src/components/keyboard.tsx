"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { KeyboardProps, UserSettings } from "@/lib/types"
import { NavigationMode } from "@/lib/types"
import { get } from "http"
import { getUserSettings } from "@/app/actions"
import { set } from "date-fns"

const keys = [
  ['Back', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '"'],
  ['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø', 'Enter'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'],
  ['Space']
]



export default function Keyboard({ typedMessage, setTypedMessage, onEnter, onBack }: KeyboardProps) {
  const [isCapsLock, setIsCapsLock] = useState(false)
  const [enableNavigation, setEnableNavigation] = useState(false) // while testing this will be true later it will be dependent on the userSettings
  const [activeFocus, setActiveFocus] = useState(false) // this will be used to enable focus on the keyboard
  const [hoveredKeyIndex, setHoveredKeyIndex] = useState<[number, number]>([0, 0])
  const [previousHoveredKeyIndex, setPreviousHoveredKeyIndex] = useState<[number, number]>([0, 0])
  const hoveredKey = keys[hoveredKeyIndex[1]]?.[hoveredKeyIndex[0]] || null

  const updateHoveredKeyIndex = (col: number, row: number) => {
    // Ensure it is within bounds of keyboard array
    setHoveredKeyIndex([hoveredKeyIndex[0] + col, hoveredKeyIndex[1] + row])
  }
  
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getUserSettings()
      if (settings?.navigationMode === "ARROW_KEYS") {
        setEnableNavigation(true)
      } else {
        setEnableNavigation(false)
      }
    }
    fetchSettings()
  }, []) // Run on mount

  // Focus management
  /*
  useEffect(() => {
    const handleFocusChange = (e: CustomEvent) => {
      if (e.detail === "keyboard") {
        setActiveFocus(true)
        
      } else {
        setActiveFocus(false)
      }
    }

    document.addEventListener("focus-change", handleFocusChange as EventListener)
    return () => document.removeEventListener("focus-change", handleFocusChange as EventListener)
  }, [])
  */
  useEffect(() => {
    if (!enableNavigation) return
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.key == "ArrowLeft") {
        setHoveredKeyIndex(([col, row]) => [Math.max(col - 1, 0), row])
      } else if (e.key == "ArrowRight") {
        setHoveredKeyIndex(([col, row]) => [Math.min(col + 1, keys[row].length - 1), row])
      } else if (e.key == "ArrowUp") {
        setHoveredKeyIndex(([col, row]) => {
          if (row == keys.length - 1) { // on spacebar 
            console.log("on spacebar")
            return [previousHoveredKeyIndex[0], previousHoveredKeyIndex[1]]
          }
          const offsetX = row == 3 ? 1 : 0
          
          // what will the offsetX be for the 3rd row?
          // if col is 3, we will move one to the right
          const newRow = Math.max(row - 1, 0)
          const newCol = Math.min(col + offsetX, keys[newRow].length - 1)
          return [newCol, newRow]
        })
      } else if (e.key == "ArrowDown") {
        setHoveredKeyIndex(([col, row]) => {
          const offsetX = row == 2 ? -1 : 0
          const newRow = Math.min(row + 1, keys.length - 1)
          const newCol = Math.min(Math.max(col + offsetX, 0), keys[newRow].length - 1)
          if (row != keys.length - 1) {
            setPreviousHoveredKeyIndex([col, row])
          }
          return [newCol, newRow]
      }) 
      } else if (e.key == "Enter") { // instead of enter
        const key = keys[hoveredKeyIndex[1]]?.[hoveredKeyIndex[0]]
        if (key) {
          handleKeyPress(key)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hoveredKeyIndex, enableNavigation])

  const handleKeyPress = (key: string) => {
    if (key === "Backspace") {
      setTypedMessage(prev => prev.slice(0, -1))
    } else if (key === "Space") {
      setTypedMessage(prev => prev + " ")
    } else if (key === "Caps Lock") {
      setIsCapsLock(prev => !prev)
    } else if (key === "Enter") {
      if (onEnter) {
        onEnter()
      } else {
        setTypedMessage(prev => prev + "\n")
      }
    } else if (key === "Back") {
      if (onBack) {
        onBack()
      }
      console.log("Back key pressed")
    }
    /*else if (["Enter", "Caps Lock", "Back"].includes(key)) {
      console.log(`Special key pressed: ${key}`)
    }*/ else {
      const normalizedKey = isCapsLock ? key.toUpperCase() : key.toLowerCase()
      setTypedMessage(prev => prev + normalizedKey)
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
                  ${['Caps Lock'].includes(key) ? (isCapsLock ? 'bg-green-600' : 'bg-gray-800') : ''}
                  ${['Å', 'Æ', 'Ø', '"'].includes(key) ? 'w-10' : ''}
                  ${enableNavigation && hoveredKey === key && hoveredKeyIndex[1] === rowIndex && hoveredKeyIndex[0] === keyIndex ? 'bg-blue-600' : ''}
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
