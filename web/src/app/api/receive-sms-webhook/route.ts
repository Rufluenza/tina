import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { receiveMessage } from "@/app/actions"
import { sendToClient } from "@/lib/websocket-server"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[Webhook] Incoming SMS:", body)

    // First get the contact
    const existingContact = await prisma.contact.findFirst({
      where: { phone: body.phone },
    })
    // If the contact does not exist, create one with name as phone number
    const contact = existingContact || await prisma.contact.create({
      data: {
        phone: body.phone,
        name: body.phone, // Default name as phone number
      },
    })
    // Store to database or state here
    await receiveMessage(contact.id, body.content)

    sendToClient({
      type: "new-message",
      contactId: contact.id,
      content: body.content,
      phone: body.phone,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[Webhook Error]", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}
