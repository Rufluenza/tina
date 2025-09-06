import { $Enums, NavigationMode as NavigationModeEnum, UserSettings as PrismaUserSettings } from "@prisma/client"

export type NavigationMode = $Enums.NavigationMode
export const NavigationMode = NavigationModeEnum

export type UserSettings = PrismaUserSettings



export enum MessageDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}
/*
export enum NavigationMode {
  DEFAULT = "DEFAULT",
  MOUSE = "MOUSE",
  ARROW_KEYS = "ARROW_KEYS"
}
  */

export interface Contact {
  id: number
  phone: string
  name: string
  messages?: Message[]
  createdAt?: Date
  lastVisited?: Date
}

export interface Message {
  id: number
  content: string
  contactId: number
  direction: string // MessageDirection
  createdAt: Date
}

/*
export interface UserSettings {
  id: number
  name: string
  theme: string
  language: string
  developmentMode: boolean
  enableSms: boolean
  notificationsEnabled: boolean
  lastSelectedContact: number | null
  sizeMultiplier: number
  enableVirtualKeyboard: boolean
  navigationMode: NavigationMode // NavigationMode
  createdAt: Date
}
*/
export interface KeyboardProps {
  typedMessage: string
  setTypedMessage: React.Dispatch<React.SetStateAction<string>>
  onEnter?: () => void
  onBack?: () => void
  usageType?: string // This is for when the keyboard is used in different contexts, like text in modal or chat
  onArrow?: (direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => void // optional, only needed if usageType is 'chat'
  //setTypedMessage: (message: string) => void
}

export interface MainMenuProps {
  //handleSelectContact?: () => void
  previousPage?: string // url for either communication board or / (message page)
  onSelectContact?: (contactId: number) => void
}

export interface CommunicationItem {
  id: string;
  text?: string;
  image?: string;
  x: number; // column position (0-based)
  y: number; // row position (0-based)
  isFixed?: boolean;
  function?: () => void;
  isEmpty?: boolean;
}

export interface GridDimensions {
  rows: number;
  cols: number;
}
