import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const contacts = await prisma.contact.findMany({
        include: { messages: true },
      })
      return res.status(200).json(contacts)
    }
    catch (error) {
      console.error('Error fetching contacts:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    return res.status(405).end() // Method Not Allowed
    }
}
