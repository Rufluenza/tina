// lib/websocket-server.ts
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"

const PORT = 3001

// This set will store all active client connections
const clients = new Set<WebSocket>()

// Create a standard HTTP server
const httpServer = createServer((req, res) => {
  // This part handles internal notifications from your Next.js webhook
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString()
    })
    req.on("end", () => {
      console.log("📢 Received broadcast request from backend")
      broadcast(JSON.parse(body)) // Forward the message to all connected clients
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ success: true, message: "Broadcasted successfully" }))
    })
  } else {
    // Handle any other HTTP requests if necessary, or just return 404
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Not Found" }))
  }
})

// Attach the WebSocket server to the HTTP server
const wss = new WebSocketServer({ server: httpServer })

wss.on("connection", (ws) => {
  console.log("🔗 WebSocket client connected")
  clients.add(ws)

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected")
    clients.delete(ws)
  })

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket error:", err)
  })
})

// Function to send a message to every connected client
function broadcast(message: any) {
  const data = JSON.stringify(message)
  if (clients.size === 0) {
    console.warn("⚠️ No WebSocket clients connected, message was not sent.")
    return
  }
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

// Start listening
httpServer.listen(PORT, () => {
  console.log(`🚀 Real-time server running on http://localhost:${PORT}`)
})
/*
import { WebSocketServer, WebSocket } from "ws"

const wss = new WebSocketServer({ port: 3000 }) // Match your frontend ws://localhost:3000

let clients: Set<WebSocket> = new Set()

wss.on("connection", (ws) => {
  console.log("🔌 New WebSocket client connected")
  clients.add(ws)

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected")
    clients.delete(ws)
  })

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket error:", err)
  })
})

export function sendToClient(message: any) {
  const data = JSON.stringify(message)
  if (clients.size === 0) {
    console.warn("⚠️ No WebSocket client connected")
  }
  clients.forEach((client) => {
    try {
      client.send(data)
    } catch (err) {
      console.error("Failed to send to client", err)
    }
  })
}
*/
/*
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
*/