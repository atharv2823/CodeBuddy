import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";
import aiRoutes from "./routes/ai.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// In-memory chat storage to persist history for active sessions
interface ChatMessage {
    roomId: string;
    sender: string;
    text: string;
    time: string;
}
const roomChats: Record<string, ChatMessage[]> = {};

io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
        socket.join(roomId);

        // Emit chat history to user on join
        if (roomChats[roomId]) {
            socket.emit("chat-history", roomChats[roomId]);
        }
    });

    socket.on("code-change", (data) => {
        socket.to(data.roomId).emit("receive-code", data.code);
    });

    socket.on("send-chat-message", (data: ChatMessage) => {
        if (!data.roomId) return;

        if (!roomChats[data.roomId]) {
            roomChats[data.roomId] = [];
        }

        const chats = roomChats[data.roomId];
        if (chats) {
            chats.push(data);
            // Limit history size per room
            if (chats.length > 50) {
                chats.shift();
            }
        }

        // Broadcast message to everyone in the room (including sender)
        io.to(data.roomId).emit("receive-chat-message", data);
    });
});

// Root route to verify server is running
app.get("/", (req, res) => {
    res.json({ status: "success", message: "CodeBuddy API is running" });
});

// Health check endpoint for deployment monitoring
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Register Modular API Routers
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/ai", aiRoutes);

if (!process.env.VERCEL) {
    server.listen(5000, () => {
        console.log("Server running on port 5000");
    });
}

export default app; 