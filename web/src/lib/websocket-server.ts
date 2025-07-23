import { WebSocketServer, WebSocket } from "ws"

let wss: WebSocketServer | null = null
let clientSocket: WebSocket | null = null

export function initWebSocketServer(server: any) {
  if (wss) return // Don't re-init

  wss = new WebSocketServer({ server })

  wss.on("connection", (ws) => {
    clientSocket = ws
    console.log("✅ WebSocket client connected")

    ws.on("close", () => {
      clientSocket = null
      console.log("❌ WebSocket client disconnected")
    })
  })

  console.log("✅ WebSocket server started")
}

export function sendToClient(message: any) {
  if (clientSocket && clientSocket.readyState === 1) {
    clientSocket.send(JSON.stringify(message))
  } else {
    console.log("⚠️ No WebSocket client connected")
  }
}
