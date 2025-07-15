// app/api/send-message.ts (or app/actions.ts if you're using Server Actions)
import { prisma } from "@/lib/prisma"
import { sendSms } from "@/lib/sms"

export async function sendMessage(contactId: number, content: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      messages: true,
    },
  })

  if (!contact) throw new Error("Contact not found")

  const settings = await prisma.userSettings.findFirst({
    where: {},
    orderBy: { id: "asc" }, // Replace with `userId` if your app supports auth
  })

  const message = await prisma.message.create({
    data: {
      content,
      contactId,
      direction: "OUTGOING", // Assuming this is an outgoing message
    },
  })

  if (settings?.enableSms) {
    await sendSms(contact.phone, content)
  }

  return message
}
