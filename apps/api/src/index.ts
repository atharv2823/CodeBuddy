import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { prisma } from "./utils/prisma";

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

    // console.log("User Connec
    //     ted");

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
    });

    socket.on("code-change", (data) => {
        socket.to(data.roomId).emit("receive-code", data.code);
    });

});

app.get("/api/users/check", async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Missing email query parameter" });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return res.json({ exists: !!user, user });
    } catch (error: any) {
        console.error("Error checking user in MongoDB:", error);
        return res.status(500).json({ error: error.message });
    }
});

app.post("/api/users", async (req, res) => {
    const { email, username } = req.body;
    if (!email || !username) {
        return res.status(400).json({ error: "Missing email or username" });
    }
    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { username },
            create: { email, username },
        });
        return res.json(user);
    } catch (error: any) {
        console.error("Error saving user to MongoDB:", error);
        return res.status(500).json({ error: error.message });
    }
});

server.listen(5000, () => {
    console.log("Server running");
});