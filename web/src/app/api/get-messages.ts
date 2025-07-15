import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// This API route handles fetching messages for a specific contact
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { contactId } = req.query

    if (!contactId || typeof contactId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing contactId' })
    }

    try {
      const messages = await prisma.message.findMany({
        where: { contactId: Number(contactId) },
        orderBy: { createdAt: 'asc' },
      })

      return res.status(200).json(messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  return res.status(405).end() // Method Not Allowed
}