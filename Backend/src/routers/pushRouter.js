import Router from "express";
import verifyUser from "../middleware/auth.middleware.js";
import {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
} from "../controllers/push.controller.js";

const router = Router();

router.route("/vapidPublicKey").get(getVapidPublicKey);
router.route("/subscribe").post(verifyUser, subscribe);
router.route("/unsubscribe").post(verifyUser, unsubscribe);

export default router;
