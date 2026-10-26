import { Router, raw } from "express";
import { uploadPhoto, deletePhoto } from "../controllers/profilePhoto.controller";
import {
    getUser,
    getPublicUser,
    getCurrentUser,
    editUser,
    removeUser,
    createNewUser,
    createNewUserByAdmin,
    getUsers
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router= Router();

router.post("/",
    authenticate,
    createNewUser
);
router.post(
  "/admin",
  authenticate,
  requireRole(Role.ADMIN),
  createNewUserByAdmin
);
router.get("/me", authenticate, getCurrentUser);
router.put("/me/photo", authenticate, raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }), uploadPhoto);
router.delete("/me/photo", authenticate, deletePhoto);
router.get("/:id/public", getPublicUser);
router.get("/:id", authenticate, getUser);
router.put("/:id",
    authenticate,
    editUser
);
router.get("/", authenticate, requireRole(Role.ADMIN), getUsers);
router.delete("/:id",
    authenticate, requireRole(Role.ADMIN),
    removeUser
);
export default router;
