export enum MessageDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export interface Contact {
  id: number
  phone: string
  name: string
  messages: Message[]
  createdAt: Date
}

export interface Message {
  id: number
  content: string
  contactId: number
  direction: MessageDirection
  createdAt: Date
}


export interface UserSettings {
  id: number
  name: string
  theme: string
  language: string
  developmentMode: boolean
  enableSms: boolean
  notificationsEnabled: boolean
  lastSelectedContact?: number | null
}