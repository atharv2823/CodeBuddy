import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
    },
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
    });

    socket.on("code-change", (data) => {
        socket.to(data.roomId).emit("receive-code", data.code);
    });
});

// Root route to verify server is running
app.get("/", (req, res) => {
    res.json({ status: "success", message: "CodeBuddy API is running" });
});

// Register Modular API Routers
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

if (!process.env.VERCEL) {
    server.listen(5000, () => {
        console.log("Server running on port 5000");
    });
}

export default app; 