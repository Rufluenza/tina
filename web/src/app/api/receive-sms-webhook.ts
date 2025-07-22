import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    
    const message = await prisma.message.create({
      data: {
        content: body.message,
        contactId: contact.id, // Use the contact ID
        direction: "INCOMING", // Assuming this is an incoming message
      },
    })

    return NextResponse.json({ success: true, message, contact }, { status: 200 })
  } catch (error) {
    console.error("[Webhook Error]", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}
