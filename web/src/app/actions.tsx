"use server"

import { prisma } from "@/lib/prisma"
import type { MessageDirection } from "@/lib/types"

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

export async function sendMessage(contactId: number, content: string, direction: MessageDirection) {
  try {
    const message = await prisma.message.create({
      data: {
        content,
        contactId,
        direction,
      },
    })
    return message
  } catch (error) {
    console.error("Error sending message:", error)
    return null
  }
}

export async function updateUserSettings(data: {
  name: string
  theme: string
  language: string
  developmentMode: boolean
  enableSms: boolean
  notificationsEnabled: boolean
}) {
  return prisma.userSettings.upsert({
    where: { id: 1 }, // or use userId if you have auth
    update: { ...data },
    create: {
      id: 1,
      ...data,
    },
  })
}