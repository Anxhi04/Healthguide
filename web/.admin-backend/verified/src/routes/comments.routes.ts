import { Router } from "express";
import {
    createNewComment,
    removeComment,
    getComments,
    editComment,
}from "../controllers/comments.controller"
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/", authenticate, createNewComment);
router.get("/post/:postId", (req, res, next) => {
    // Guest reads stay public; supplied tokens must be verified for ownership.
    if (req.headers.authorization) return authenticate(req, res, next);
    next();
}, getComments);
// router.get("/:id", getCommentById);
router.put("/:id", authenticate, editComment);
router.delete("/:id", authenticate, requireRole(Role.ADMIN, Role.USER), removeComment);

export default router;
