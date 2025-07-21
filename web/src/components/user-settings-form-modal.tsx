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

interface UserSettings {
  id: number
  name: string
  theme: string
  language: string
  developmentMode: boolean
  enableSms: boolean
  notificationsEnabled: boolean
}

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSettingsUpdated?: () => void
  settings?: UserSettings
}

export function UserSettingsModal({ isOpen, onClose, settings }: UserSettingsModalProps) {
  const [form, setForm] = useState<UserSettings>({
    id: 0,
    name: settings?.name || "",
    theme: settings?.theme || "light",
    language: settings?.language || "en",
    developmentMode: settings?.developmentMode || false,
    enableSms: settings?.enableSms ?? true,
    notificationsEnabled: settings?.notificationsEnabled ?? true,
  })

  const [existingProfiles, setExistingProfiles] = useState<UserSettings[]>([])
  const [selectedId, setSelectedId] = useState<number | "">("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
  
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setIsLoading(true)
    try {
      await updateUserSettings(form, form.id) // pass current ID
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
      await createUserSettings(newSettings)
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
          {existingProfiles.length > 0 && (
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

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-[#3b3b3d] border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={form.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              className="bg-[#3b3b3d] border-gray-600 text-white w-full p-2 rounded"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={form.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="bg-[#3b3b3d] border-gray-600 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dev-mode">Development Mode</Label>
            <Switch
              id="dev-mode"
              checked={form.developmentMode}
              onCheckedChange={(val) => handleChange("developmentMode", val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sms">Enable SMS</Label>
            <Switch
              id="sms"
              checked={form.enableSms}
              onCheckedChange={(val) => handleChange("enableSms", val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Switch
              id="notifications"
              checked={form.notificationsEnabled}
              onCheckedChange={(val) => handleChange("notificationsEnabled", val)}
            />
          </div>

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
