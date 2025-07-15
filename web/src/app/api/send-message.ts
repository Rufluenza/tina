import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// This API route handles sending messages to a contact
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'POST') {
        
        /* 
        TODO:
        if contact is not provided: 
        1. create a new contact with the provided phone number and name as contact 
        2. then send the message

        */
        const { contactId, content } = req.body
    
        if (!contactId || !content) {
        return res.status(400).json({ error: 'Missing contactId or content' })
        }
    
        try {
        const message = await prisma.message.create({
            data: {
            content,
            contactId,
            direction: 'OUTGOING', // Assuming this is an outgoing message
            },
        })
        return res.status(201).json(message)
        } catch (error) {
        console.error('Error creating message:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
        }
    }
    
    return res.status(405).end() // Method Not Allowed
}