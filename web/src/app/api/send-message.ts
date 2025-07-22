// app/api/send-message.ts (or app/actions.ts if you're using Server Actions)
import { prisma } from "@/lib/prisma"
import { sendSms } from "@/lib/sms"
import { getUserSettingsList } from "@/app/actions"
import { sendSMS } from "@/lib/sms-api"

export async function sendMessage(contactId: number, content: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      messages: true,
    },
  })

  if (!contact) throw new Error("Contact not found")

  
  // Get the setting with the newest createdAt date
  const settingsList = await getUserSettingsList()
  if (!settingsList) throw new Error("User settings not found")
  const settings = settingsList[0]

  const message = await prisma.message.create({
    data: {
      content,
      contactId,
      direction: "OUTGOING", // Assuming this is an outgoing message
    },
  })

  if (settings.enableSms) {
    await sendSMS(contact.phone, content)
  }
  /*
  if (settings?.enableSms) {
    await sendSms(contact.phone, content)
  }
    */

  return message
}
