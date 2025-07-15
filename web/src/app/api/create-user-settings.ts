import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
/*
UserSettings
  id        Int      @id @default(autoincrement())
  name      String   @default("User")
  theme     String   @default("light")
  language  String   @default("en")
  developmentMode Boolean @default(false)
  enableSms Boolean @default(true)
  notificationsEnabled Boolean @default(true)
  lastSelectedContact Int? @unique
  createdAt DateTime @default(now())
*/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Try to fetch the most recent user settings
    // if no user settings exist, create a default one
    try {
      const userSettings = await prisma.userSettings.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 1, // Get the most recent user settings
      })

      if (userSettings.length > 0) {
        return res.status(200).json(userSettings)
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    }
  }

  if (req.method === 'POST') {
    const { name, theme, language, developmentMode, enableSms, notificationsEnabled, lastSelectedContact } = req.body
    const userSettings = await prisma.userSettings.create({
      data: { name, theme, language, developmentMode, enableSms, notificationsEnabled, lastSelectedContact: lastSelectedContact || null},
    })
    return res.status(201).json(userSettings)
  }

  return res.status(405).end() // Method Not Allowed
}