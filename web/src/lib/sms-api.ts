// lib/sms-api.ts
const RPI_BASE_URL = "http://192.168.1.217:8000"

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
