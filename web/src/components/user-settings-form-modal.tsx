"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { updateUserSettings } from "@/app/actions"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSettingsUpdated?: () => void
  settings?: {
    name: string
    theme: string
    language: string
    developmentMode: boolean
    enableSms: boolean
    notificationsEnabled: boolean
  }
}

export function UserSettingsModal({ isOpen, onClose, settings }: UserSettingsModalProps) {
  const [form, setForm] = useState({
    name: settings?.name || "",
    theme: settings?.theme || "light",
    language: settings?.language || "en",
    developmentMode: settings?.developmentMode || false,
    enableSms: settings?.enableSms ?? true,
    notificationsEnabled: settings?.notificationsEnabled ?? true,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateUserSettings(form)
      onClose()
    } catch (err) {
      console.error("Failed to update settings:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d2d2d] border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              onCheckedChange={(val: boolean) => handleChange("developmentMode", val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms">Enable SMS</Label>
            <Switch
              id="sms"
              checked={form.enableSms}
              onCheckedChange={(val: boolean) => handleChange("enableSms", val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Switch
              id="notifications"
              checked={form.notificationsEnabled}
              onCheckedChange={(val: boolean) => handleChange("notificationsEnabled", val)}
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
            <Button type="submit" disabled={isLoading} className="bg-[#428aff] hover:bg-[#3a7ae4]">
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
