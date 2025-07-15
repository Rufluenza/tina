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

/*
UserSettings
  id        Int      @id @default(autoincrement())
  name      String   @default("User")
  theme     String   @default("light")
  language  String   @default("en")
  developmentMode Boolean @default(false)
  enableSms Boolean @default(true)
  notificationsEnabled Boolean @default(true)
  lastSelectedContact Int? @unique
  createdAt DateTime @default(now())
*/
export interface UserSettings {
  id: number
  name: string
  theme: string
  language: string
  developmentMode: boolean
  enableSms: boolean
  notificationsEnabled: boolean
  lastSelectedContact?: number | null
  createdAt: Date
}