"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getUserSettings, updateUserSettings } from "@/app/actions"
import { NavigationMode, type UserSettings } from "@/lib/types"

export function UserSettingsForm({ onSettingsUpdated }: { onSettingsUpdated?: (s: UserSettings) => void }) {
  const [form, setForm] = useState<UserSettings | null>(null)
  const [hoveredItem, setHoveredItem] = useState(0)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)

  const fields = [
    "name",
    "theme",
    "language",
    "developmentMode",
    "enableSms",
    "notificationsEnabled",
    "enableVirtualKeyboard",
    "navigationMode",
    "sizeMultiplier",
    "apply",
    "cancel",
  ]

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getUserSettings()
      setForm(settings)
      setUserSettings(settings)
    }
    loadSettings()
  }, [])

  // --- Keyboard navigation ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!userSettings?.navigationMode || userSettings.navigationMode !== "ARROW_KEYS") return
      if (activeField) return // typing

      if (e.key === "ArrowDown") {
        setHoveredItem(i => Math.min(i + 1, fields.length - 1))
      } else if (e.key === "ArrowUp") {
        setHoveredItem(i => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        const field = fields[hoveredItem]
        if (["name", "language"].includes(field)) setActiveField(field)
        else if (field === "theme")
          handleChange("theme", form?.theme === "light" ? "dark" : "light")
        else if (field === "developmentMode")
          handleChange("developmentMode", !form?.developmentMode)
        else if (field === "enableSms")
          handleChange("enableSms", !form?.enableSms)
        else if (field === "notificationsEnabled")
          handleChange("notificationsEnabled", !form?.notificationsEnabled)
        else if (field === "enableVirtualKeyboard")
          handleChange("enableVirtualKeyboard", !form?.enableVirtualKeyboard)
        else if (field === "apply") handleApply()
        else if (field === "cancel") window.history.back()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hoveredItem, userSettings, activeField, form])

  const handleChange = (key: keyof UserSettings, value: any) => {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleApply = async () => {
    if (!form) return
    const updated = await updateUserSettings(form, form.id)
    onSettingsUpdated?.(updated)
  }

  if (!form) return null

  return (
    <div className="bg-[#2d2d2d] text-white p-6 max-w-lg mx-auto rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">User Settings</h2>

      <div className="space-y-4">
        {/* Loop through all items on the list and if they are not a special item show them as below */}
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${
              hoveredItem === 0 ? "ring-2 ring-blue-500" : ""
            }`}
          />
        </div>

        {/* Theme */}
        <div>
          <Label>Theme</Label>
          <select
            value={form.theme}
            onChange={e => handleChange("theme", e.target.value)}
            className={`bg-[#3b3b3d] border-gray-600 text-white w-full p-2 rounded ${
              hoveredItem === 1 ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <Label>Language</Label>
          <Input
            value={form.language}
            onChange={e => handleChange("language", e.target.value)}
            className={`bg-[#3b3b3d] border-gray-600 text-white ${
              hoveredItem === 2 ? "ring-2 ring-blue-500" : ""
            }`}
          />
        </div>

        {/* Example toggle fields */}
        <div className={`flex justify-between ${hoveredItem === 3 ? "ring-2 ring-blue-500" : ""}`}>
          <Label>Development Mode</Label>
          <Switch
            checked={form.developmentMode}
            onCheckedChange={v => handleChange("developmentMode", v)}
          />
        </div>

        <div className={`flex justify-between ${hoveredItem === 4 ? "ring-2 ring-blue-500" : ""}`}>
          <Label>Enable SMS</Label>
          <Switch
            checked={form.enableSms}
            onCheckedChange={v => handleChange("enableSms", v)}
          />
        </div>

        

        <div className={`flex justify-between ${hoveredItem === 5 ? "ring-2 ring-blue-500" : ""}`}>
          <Label>Enable Virtual Keyboard</Label>
          <Switch
            checked={form.enableVirtualKeyboard}
            onCheckedChange={v => handleChange("enableVirtualKeyboard", v)}
          />
        </div>
        {/* ...repeat for remaining fields... */}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            className={`bg-[#3b3b3d] border-gray-600 ${
              hoveredItem === fields.indexOf("cancel") ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            className={`bg-blue-600 hover:bg-blue-700 ${
              hoveredItem === fields.indexOf("apply") ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
