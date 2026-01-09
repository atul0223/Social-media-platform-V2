import { Router } from "express";
import verifyUser from "../middleware/auth.middleware.js";
import { generateDescription } from "../controllers/ai.controller.js";

const router = Router();

router.route("/generate-description").post(verifyUser, generateDescription);

export default router;
