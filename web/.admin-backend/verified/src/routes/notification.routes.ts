import { Router } from "express";
import{
    addNotification,
    removeAllNotifications,
    removeNotification,
    getMyNotification,
    getNotification,
    markAsRead
}from "../controllers/notification.controller"
import { authenticate } from "../middleware/auth.middleware";

const router=  Router();

router.post("/", addNotification);
router.get("/my", authenticate, getMyNotification);
router.get("/:id", authenticate, getNotification);
router.patch("/:id/read", authenticate, markAsRead);
router.delete("/",authenticate, removeAllNotifications);
router.delete("/:id",authenticate, removeNotification);
export default router;