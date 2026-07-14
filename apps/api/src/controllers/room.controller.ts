import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createRoom = async (req: Request, res: Response) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: "Room name and userId are required" });
    }
    try {
        const room = await prisma.room.create({
            data: {
                name,
                creator: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        return res.json(room); 
    } catch (error: any) {
        console.error("Error creating room:", error);
        return res.status(500).json({ error: error.message });
    }
};


export const listRooms = async (req: Request, res: Response) => {
    const { userId } = req.query;
    try {
        // Only return rooms that are not closed, and filter user-wise if userId is provided
        const rooms = await prisma.room.findMany({
            where: {
                isClosed: false,
                ...(userId && typeof userId === "string" && { userId }),
            },
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

export const addRoomMember = async (req: Request, res: Response) => {
    const roomId = req.params.id as string;
    const userId = req.body.userId as string;
    if (!roomId || !userId) {
        return res.status(400).json({ error: "roomId and userId are required" });
    }
    try {
        const existing = await prisma.roomMember.findFirst({
            where: { roomId, userId },
        });
        if (existing) {
            return res.json({ message: "User is already a member of this room", member: existing });
        }

        const member = await prisma.roomMember.create({
            data: {
                roomId,
                userId,
            },
            include: {
                user: true,
                room: true,
            }
        });
        return res.json({ message: "Member joined successfully", member });
    } catch (error: any) {
        console.error("Error adding room member:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const getRoomMembers = async (req: Request, res: Response) => {
    const roomId = req.params.id as string;
    if (!roomId) {
        return res.status(400).json({ error: "roomId is required" });
    }
    try {
        const members = await prisma.roomMember.findMany({
            where: { roomId },
            include: {
                user: true,
            },
        }) as any[];
        return res.json(members.map(m => m.user));
    } catch (error: any) {
        console.error("Error fetching room members:", error);
        return res.status(500).json({ error: error.message });
    }
};
