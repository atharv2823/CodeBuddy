import { Router } from "express";
import { checkUser, saveUser, updateUser } from "../controllers/user.controller";

const router: Router = Router();

router.get("/check", checkUser);
router.post("/", saveUser);
router.put("/update", updateUser);

export default router;
