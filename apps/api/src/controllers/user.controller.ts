import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const checkUser = async (req: Request, res: Response) => {
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
};

export const saveUser = async (req: Request, res: Response) => {
    const { email, username, role } = req.body;
    if (!email || !username) {
        return res.status(400).json({ error: "Missing email or username" });
    }
    try {
        // Upsert the user profile details with the newly selected role
        const user = await prisma.user.upsert({
            where: { email },
            update: { username, role },
            create: { email, username, role: role || "Developer" },
        });
        return res.json(user);
    } catch (error: any) {
        console.error("Error saving user to MongoDB:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { email, username, role } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required to update details" });
    }
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                ...(username && { username }),
                ...(role && { role }),
            },
        });
        return res.json({ success: true, message: "User profile updated successfully", user });
    } catch (error: any) {
        console.error("Error updating user details:", error);
        return res.status(500).json({ error: error.message });
    }
};
