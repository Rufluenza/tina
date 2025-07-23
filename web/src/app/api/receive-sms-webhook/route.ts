import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { receiveMessage } from "@/app/actions"



export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[Webhook] Incoming SMS:", body)

    const existingContact = await prisma.contact.findFirst({
      where: { phone: body.phone },
    })

    const contact =
      existingContact ||
      (await prisma.contact.create({
        data: {
          phone: body.phone,
          name: body.phone,
        },
      }))

    console.log("[Webhook] Contact:", contact)
    await receiveMessage(contact.id, body.content)

    // ✨ NEW: Notify your standalone WebSocket server to broadcast the new message
    const notificationPayload = {
      type: "new-message",
      contactId: contact.id,
      content: body.content,
      phone: body.phone,
    }

    // This fetch request sends the message data to your websocket-server,
    // which will then broadcast it to the frontend.
    fetch("http://localhost:3001/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationPayload),
    }).catch((error) => {
      // Log the error but don't let it block the webhook response
      console.error("[Webhook] Failed to notify WebSocket server:", error)
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[Webhook Error]", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}
/*
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
    console.log("[Webhook] Contact:", contact)
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
*/