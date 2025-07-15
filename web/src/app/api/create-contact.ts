// pages/api/contacts.ts
import type { NextApiRequest, NextApiResponse } from 'next'
//import { PrismaClient } from '@prisma/client'

import { prisma } from '@/lib/prisma'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const contacts = await prisma.contact.findMany({
      include: { messages: true },
    })
    return res.status(200).json(contacts)
  }

  if (req.method === 'POST') {
    const { phone, name } = req.body
    const contact = await prisma.contact.create({
      data: { phone, name },
    })
    return res.status(201).json(contact)
  }

  return res.status(405).end() // Method Not Allowed
}
