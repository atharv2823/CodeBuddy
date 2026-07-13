import { Router } from "express";
import { generateChatResponse } from "../controllers/ai.controller";

const router: Router = Router();

router.post("/chat", generateChatResponse);

export default router;
