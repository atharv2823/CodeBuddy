import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
    },
});

io.on("connection", (socket) => {

    console.log("User Connected");

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
    });

    socket.on("code-change", (data) => {
        socket.to(data.roomId).emit("receive-code", data.code);
    });

});

server.listen(5000, () => {
    console.log("Server running");
});