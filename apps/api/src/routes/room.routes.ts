import { Router } from "express";
import { createRoom, listRooms, getRoom, closeRoom, deleteRoom } from "../controllers/room.controller";

const router = Router();

router.post("/", createRoom);
router.get("/", listRooms);
router.get("/:id", getRoom);
router.put("/:id/close", closeRoom);
router.delete("/:id", deleteRoom);

export default router;
