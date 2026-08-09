// lib/sms-api.ts
// This is the new sms api, changed to updating db instead of sending request to py for python

// sms-api.ts
//const mysql = require('mysql2/promise');
import { db } from "@/lib/dbConnection"

export async function sendSMS(toNumber: string, message: string): Promise<void> {
  await db.execute(
    `INSERT INTO outbox (DestinationNumber, TextDecoded, CreatorID, Coding)
     VALUES (?, ?, ?, ?)`,
    [toNumber, message, 'MyWebApp', 'Default_No_Compression']
  );
  console.log(`Message sent to ${toNumber}: ${message}`);
}


// Usage
//await sendSMS('+4552228856', 'Testos');



// This is the old sms api
/*
const RPI_BASE_URL = "http://raspberrypi:8000"

export async function sendSMS(phone: string, message: string) {
  const res = await fetch(`${RPI_BASE_URL}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phone, message: message }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Failed to send SMS")
  return data
}

export async function readSMS() {
  const res = await fetch(`${RPI_BASE_URL}/receive`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Failed to read SMS")
  return data.messages
}
*/