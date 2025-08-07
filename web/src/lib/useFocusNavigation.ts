// src/lib/useFocusNavigation.ts
import { useEffect, useState } from "react"
import { focusState, type FocusSection } from "./focusManager"

const focusSectionList: FocusSection[] = ["topbar", "sidebar", "messages", "keyboard", "modal"]

export function useFocusNavigation(enabled: boolean) {
  const [focusedAreaIndex, setFocusedAreaIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusState.currentSection !== null) return // already focused into section

      if (e.key === "ArrowDown") {
        setFocusedAreaIndex((prev) => (prev + 1) % focusSectionList.length)
      } else if (e.key === "ArrowUp") {
        setFocusedAreaIndex((prev) => (prev - 1 + focusSectionList.length) % focusSectionList.length)
      } else if (e.key === "Enter") {
        focusState.setFocus(focusSectionList[focusedAreaIndex])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, focusedAreaIndex])

  return {
    focusedArea: focusSectionList[focusedAreaIndex],
    focusedAreaIndex,
  }
}
