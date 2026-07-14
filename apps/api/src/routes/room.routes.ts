import { Router } from "express";
import { createRoom, listRooms, getRoom, closeRoom, deleteRoom, addRoomMember, getRoomMembers } from "../controllers/room.controller";

const router: Router = Router();

router.post("/", createRoom);
router.get("/", listRooms);
router.get("/:id", getRoom);
router.put("/:id/close", closeRoom);
router.delete("/:id", deleteRoom);
router.post("/:id/members", addRoomMember);
router.get("/:id/members", getRoomMembers);

export default router;
