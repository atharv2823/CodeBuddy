import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createRoom = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Room name is required" });
    }
    try {
        const room = await prisma.room.create({
            data: { name },
        });
        return res.json(room);
    } catch (error: any) {
        console.error("Error creating room:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const listRooms = async (req: Request, res: Response) => {
    try {
        // Only return rooms that are not closed
        const rooms = await prisma.room.findMany({
            where: { isClosed: false },
        });
        return res.json(rooms);
    } catch (error: any) {
        console.error("Error listing rooms:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const getRoom = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid Room ID parameter" });
    }
    try {
        const room = await prisma.room.findUnique({
            where: { id },
        });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        // Verify if the room is locked/closed by the creator
        if (room.isClosed) {
            return res.status(403).json({ error: "This room has been closed and cannot be entered." });
        }
        return res.json(room);
    } catch (error: any) {
        console.error("Error fetching room:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const closeRoom = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid Room ID parameter" });
    }
    try {
        const room = await prisma.room.update({
            where: { id },
            data: { isClosed: true },
        });
        return res.json({ success: true, message: "Room closed successfully", room });
    } catch (error: any) {
        console.error("Error closing room:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid Room ID parameter" });
    }
    try {
        await prisma.room.delete({
            where: { id },
        });
        return res.json({ success: true, message: "Room deleted successfully from database" });
    } catch (error: any) {
        console.error("Error deleting room:", error);
        return res.status(500).json({ error: error.message });
    }
};
