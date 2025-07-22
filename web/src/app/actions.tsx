"use server"

import { prisma } from "@/lib/prisma"
import type { MessageDirection } from "@/lib/types"
import { UserSettings } from "@/lib/types"
import { sendSMS } from "@/lib/sms-api"

export async function getContacts() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return contacts
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return []
  }
}

export async function getContactsClean() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return contacts
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return []
  }
}

export async function getContactWithMessages(contactId: number) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })
    return contact
  } catch (error) {
    console.error("Error fetching contact:", error)
    return null
  }
}

export async function createContact(phone: string, name: string) {
  try {
    const contact = await prisma.contact.create({
      data: {
        phone,
        name,
      },
    })
    return contact
  } catch (error) {
    console.error("Error creating contact:", error)
    return null
  }
}

export async function updateContact(id: number, data: { name: string; phone: string }) {
  return prisma.contact.update({
    where: { id },
    data,
  })
}

export async function deleteContact(id: number) {
  try {
    const contact = await prisma.contact.delete({
      where: { id },
    })
    return contact
  } catch (error) {
    console.error("Error deleting contact:", error)
    return null
  }
}

export async function sendMessage(contactId: number, content: string, direction: MessageDirection) {
  try {
    const message = await prisma.message.create({
      data: {
        content,
        contactId,
        direction,
      },
    })
    // send sms using sendSMS function
    // First get the phone number of the contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })
    if (!contact) {
      throw new Error("Contact not found")
    }
    await sendSMS(contact.phone, content)
    return message
  } catch (error) {
    console.error("Error sending message:", error)
    return null
  }
}

export async function receiveMessage(contactId: number, content: string) {
  try {
    const message = await prisma.message.create({
      data: {
        content,
        contactId,
        direction: "INCOMING",
      },
    })
    return message
  } catch (error) {
    console.error("Error receiving message:", error)
    return null
  }
}

export async function updateUserSettings(data: UserSettings, id: number) {
  // Update the createdAt field to the current date
  return prisma.userSettings.update({
    where: { id },
    data: {
      ...data,
      createdAt: new Date(),
    },
  })
}

export async function createUserSettings(data: Omit<UserSettings, "id" | "createdAt">) {
  return prisma.userSettings.create({
    data,
  })
}

export async function deleteUserSettings(id: number) {
  return prisma.userSettings.delete({
    where: { id },
  })
}

export async function getUserSettings() {
  try {
    const settings = await prisma.userSettings.findFirst({
      where: {},
      orderBy: { createdAt: "desc" }, // Get the most recent settings
    })
    return settings || null
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return null
  }
}

export async function getUserSettingsList() {
  return prisma.userSettings.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function getUserSettingsById(id: number) {
  return prisma.userSettings.findUnique({
    where: { id },
  })
}