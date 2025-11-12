import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import donRoutes from "./donRoutes.js";
import missionsRoutes from "./routes/missions.js";
import inventoryRoutes from "./routes/inventory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// ✅ Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));
app.use(donRoutes);
app.use(express.json()); // ensure server parses JSON bodies
app.use("/missions", missionsRoutes);
app.use("/inventory", inventoryRoutes);

// ✅ Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/coffee-shop", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// ✅ Socket.io (real-time chat)
io.on("connection", (socket) => {
  console.log("🧠 New Goodfella entered the Coffee Shop.");

  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data); // broadcast to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("🚪 Goodfella left the Coffee Shop.");
  });
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "game.html"));
});

// ✅ Server Start
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`☕ DeFi Goodfellas Bar running on http://localhost:${PORT}`)
);
