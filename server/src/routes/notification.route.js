import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get(
    "/",
    getNotifications
);

router.patch(
    "/:id/mark-read",
    markNotificationAsRead
);

router.patch(
    "/mark-all-read",
    markAllNotificationsAsRead
);

router.delete(
    "/:id",
    deleteNotification
);

export default router;