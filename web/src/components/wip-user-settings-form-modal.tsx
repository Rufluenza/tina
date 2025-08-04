"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  updateUserSettings,
  getUserSettings,
  getUserSettingsList,
  getUserSettingsById,
  createUserSettings,
  deleteUserSettings
} from "@/app/actions"

import type { UserSettings } from "@/lib/types"
import { NavigationMode } from "@/lib/types"


interface UserSettingsFormProps {
  settings: UserSettings
  onChange: (settings: UserSettings) => void
}


interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSettingsUpdated?: (newSettings?: any) => void
  settings?: UserSettings
}
const menuItemList = [
  { label: "Name", value: "name", editType: "text" },
  { label: "Theme", value: "theme", editType: "list", options: ["light", "dark"] },
  { label: "Language", value: "language", editType: "list", options: ["en", "no", "sv", "da"] },
  { label: "Development Mode", value: "developmentMode", editType: "check" },
  { label: "Enable SMS", value: "enableSms", editType: "check" },
  { label: "Notifications Enabled", value: "notificationsEnabled", editType: "check" },
  { label: "Enable Virtual Keyboard", value: "enableVirtualKeyboard", editType: "check" },
  { label: "Size Multiplier", value: "sizeMultiplier", editType: "number"},
  { label: "Navigation Mode", value: "navigationMode", editType: "list", options: Object.values(NavigationMode) }
]

export function UserSettingsModal({ isOpen, onClose, settings, onSettingsUpdated }: UserSettingsModalProps) {
  const [form, setForm] = useState<UserSettings>({
    id: 0,
    name: settings?.name || "",
    theme: settings?.theme || "light",
    language: settings?.language || "en",
    developmentMode: settings?.developmentMode || false,
    enableSms: settings?.enableSms || true,
    notificationsEnabled: settings?.notificationsEnabled || true,
    enableVirtualKeyboard: settings?.enableVirtualKeyboard || false,
    sizeMultiplier: settings?.sizeMultiplier || 1,
    navigationMode: settings?.navigationMode || NavigationMode.DEFAULT,
    createdAt: settings?.createdAt || new Date(),
    lastSelectedContact: settings?.lastSelectedContact || null,
  })
  

  const [existingProfiles, setExistingProfiles] = useState<UserSettings[]>([])
  const [selectedId, setSelectedId] = useState<number | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [enableNavigation, setEnableNavigation] = useState(false)
  const [hoveredMenuItemIndex, setHoveredMenuItemIndex] = useState<number | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<object | null>(null)
  // Load initial settings if provided
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getUserSettings()
      if (settings?.navigationMode === "ARROW_KEYS") {
        setEnableNavigation(true)
        setHoveredMenuItemIndex(0) // Start with the first item hovered
      } else {
        setEnableNavigation(false)
      }
    }
    fetchSettings()
  }, []) // Run on mount

  // Make navigation mode work with arrow keys
  
  useEffect(() => {
    if (!enableNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement).tagName
      if (tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA") return // don't override form fields

      if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === "ArrowUp") {
        setHoveredMenuItemIndex((prev) => (prev! > 0 ? prev! - 1 : menuItemList.length - 1))
      } else if (e.key === "ArrowDown") {
        setHoveredMenuItemIndex((prev) => (prev! < menuItemList.length - 1 ? prev! + 1 : 0))
      } else if (e.key === "Enter") {
        const selectedItem = menuItemList[hoveredMenuItemIndex!]
        if (selectedItem.editType === "check") {
          const current = form[selectedItem.value as keyof UserSettings]
          handleChange(selectedItem.value, !current)
        }
        // Do NOT submit form
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enableNavigation, hoveredMenuItemIndex, form])


  
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
  
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setIsLoading(true)
    try {
      const updatedSettings = await updateUserSettings(form, form.id) // pass current ID
      if (onSettingsUpdated) {
        onSettingsUpdated(updatedSettings)
      }
      onClose()
      
    } catch (err) {
      console.error("Apply failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { id, ...newSettings } = form // exclude ID for creation
      const createdSettings = await createUserSettings(newSettings)
      if (onSettingsUpdated) {
        onSettingsUpdated(createdSettings)
      }
      onClose()
    } catch (err) {
      console.error("Create failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    if (!form.id) return
    setIsLoading(true)
    try {
      await deleteUserSettings(form.id)
      if (onSettingsUpdated) {
        onSettingsUpdated() // Notify parent that settings were deleted
      }
      onClose()
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setIsLoading(false)
    }
  }


  // Load settings profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const allSettings = await getUserSettingsList()

        setExistingProfiles(allSettings)
        if (allSettings.length > 0) {
          // Find the user's with the last created at date (most recent)
          allSettings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          const latest = allSettings[0]
          //const latest = allSettings[allSettings.length - 1]
          setSelectedId(latest.id)
          setForm(latest)
        }
      } catch (err) {
        console.error("Error loading settings list:", err)
      }
    }

    if (isOpen) fetchProfiles()
  }, [isOpen])


  // Handle dropdown change
  const handleSelectProfile = async (idStr: string) => {
    if (!idStr) {
      setSelectedId("")
      return
    }

    const id = parseInt(idStr)
    setSelectedId(id)
    try {
      const selected = await getUserSettingsById(id)
      if (selected) {
        setForm(selected)
      }
    } catch (err) {
      console.error("Failed to load selected settings:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d2d2d] border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleApply} className="space-y-4">
          { /* If there are existing profiles, don't show the select dropdown */ }
          {existingProfiles.length > 1 && (
            <div>
              <Label htmlFor="existing-settings">Select Profile</Label>
              <select
                id="existing-settings"
              value={selectedId}
              onChange={(e) => handleSelectProfile(e.target.value)}
              className="bg-[#3b3b3d] border-gray-600 text-white w-full p-2 rounded"
            >
              
              {existingProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
          )}

          {menuItemList.map((item, index) => {
            const isSelected = enableNavigation && hoveredMenuItemIndex === index
            const value = form[item.value as keyof UserSettings]

            return (
              <div
                key={item.value}
                className={`flex items-center justify-between border-b border-gray-700 py-1 px-2 rounded ${
                  isSelected && enableNavigation ? "bg-gray-700" : ""
                }`}
              >
                <Label htmlFor={item.value}>{item.label}</Label>
                {item.editType === "text" && (
                  <Input
                    id={item.value}
                    value={value as string}
                    onChange={(e) => handleChange(item.value, e.target.value)}
                    className="bg-[#3b3b3d] border-gray-600 text-white"
                  />
                )}
                {item.editType === "number" && (
                  <Input
                    id={item.value}
                    type="number"
                    value={value as number}
                    onChange={(e) => handleChange(item.value, parseFloat(e.target.value))}
                    className="bg-[#3b3b3d] border-gray-600 text-white w-24"
                  />
                )}
                {item.editType === "check" && (
                  <Switch
                    id={item.value}
                    checked={Boolean(value)}
                    onCheckedChange={(val) => handleChange(item.value, val)}
                  />
                )}
                {item.editType === "list" && item.options && (
                  <select
                    id={item.value}
                    value={value as string}
                    onChange={(e) => handleChange(item.value, e.target.value)}
                    className="bg-[#3b3b3d] border-gray-600 text-white p-2 rounded"
                  >
                    {item.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}


          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
            { /* Only show Apply button if there are existing profiles */ }
            { existingProfiles.length > 0 && (
              
              <Button
                type="submit"
                onClick={handleApply}
                disabled={!selectedId || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            )}
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Create
            </Button>
            { existingProfiles.length > 0 && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={!selectedId || isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            )}
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
