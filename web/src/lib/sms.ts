// src/lib/sms.ts
import { SerialPort } from "serialport"

const SERIAL_PORT = "/dev/serial0"
const BAUD_RATE = 9600

export async function sendSms(phoneNumber: string, message: string) {
  const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE, autoOpen: false })

  try {
    await open(port)

    const writeCommand = (cmd: string) =>
      new Promise<void>((resolve, reject) => {
        port.write(cmd + "\r", (err) => (err ? reject(err) : resolve()))
      })

    const sendControlZ = () =>
      new Promise<void>((resolve) => {
        port.write(Buffer.from([0x1a]))
        setTimeout(resolve, 3000)
      })

    await writeCommand("AT")
    await delay(1000)

    await writeCommand("AT+CMGF=1")
    await delay(1000)

    await writeCommand(`AT+CMGS="${phoneNumber}"`)
    await delay(1000)

    await writeCommand(message)
    await sendControlZ()

    console.log("✅ SMS sent to", phoneNumber)
  } catch (err) {
    console.error("❌ SMS sending failed:", err)
  } finally {
    port.close()
  }
}

function open(port: SerialPort): Promise<void> {
  return new Promise((resolve, reject) => {
    port.open((err) => (err ? reject(err) : resolve()))
  })
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}
