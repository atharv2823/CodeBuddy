import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";

const app = express();

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

// Register Modular API Routers
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

server.listen(5000, () => {
    console.log("Server running");
});