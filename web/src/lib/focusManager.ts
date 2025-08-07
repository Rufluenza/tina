// src/lib/focusManager.ts
export type FocusSection = "topbar" | "sidebar" | "messages" | "keyboard" | "modal" | null

type FocusManager = {
  currentSection: FocusSection
  listeners: ((section: FocusSection) => void)[]
  setFocus: (section: FocusSection) => void
  clearFocus: () => void
  subscribe: (cb: (section: FocusSection) => void) => () => void
}

export const focusState: FocusManager = {
  currentSection: null,
  listeners: [],
  setFocus(section) {
    this.currentSection = section
    this.listeners.forEach((cb) => cb(section))
  },
  clearFocus() {
    this.setFocus(null)
  },
  subscribe(cb) {
    this.listeners.push(cb)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb)
    }
  },
}
