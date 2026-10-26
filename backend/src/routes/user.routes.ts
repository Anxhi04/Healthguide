import { getPublicPosts, updatePhoneVisibility } from "../controllers/publicProfile.controller";
import { Router, raw, ErrorRequestHandler } from "express";
import { uploadPhoto, deletePhoto } from "../controllers/profilePhoto.controller";
import {
    editUserByAdmin,
    removeUserByAdmin,
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
const optionalAuth = (req: Parameters<typeof authenticate>[0], res: Parameters<typeof authenticate>[1], next: Parameters<typeof authenticate>[2]) =>
    req.headers.authorization ? authenticate(req, res, next) : next();

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
router.put("/admin/:id", authenticate, requireRole(Role.ADMIN), editUserByAdmin);
router.delete("/admin/:id", authenticate, requireRole(Role.ADMIN), removeUserByAdmin);
router.get("/me", authenticate, getCurrentUser);
router.put("/me/privacy", authenticate, updatePhoneVisibility);
router.put("/me/photo", authenticate, raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }), uploadPhoto);
router.delete("/me/photo", authenticate, deletePhoto);
const photoBodyError: ErrorRequestHandler = (error, req, res, next) => {
    if (req.path === "/me/photo" && error?.type === "entity.too.large") {
        res.status(413).json({ message: "Choose an image smaller than 5 MB" });
        return;
    }
    next(error);
};
router.use(photoBodyError);
router.get("/:id/public", optionalAuth, getPublicUser);
router.get("/:id/public/posts", optionalAuth, getPublicPosts);
router.get("/:id", authenticate, getUser);
router.put("/:id",
    authenticate,
    editUser
);
router.get("/", authenticate, requireRole(Role.ADMIN), getUsers);
router.delete("/:id",
    authenticate, 
    removeUser
);
export default router;

