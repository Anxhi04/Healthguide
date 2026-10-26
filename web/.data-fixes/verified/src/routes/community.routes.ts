import { Router, raw } from "express";
import { createNewCommunity, getCommunities, getCommunity, editCommunity, removeCommunity, getMyCommunities, uploadCommunityImage } from "../controllers/communities.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateCommunity } from "../validation/communities.validation";
const router = Router();
const optionalAuth = (req: Parameters<typeof authenticate>[0], res: Parameters<typeof authenticate>[1], next: Parameters<typeof authenticate>[2]) =>
  req.headers.authorization ? authenticate(req, res, next) : next();
router.post("/", authenticate, validateCommunity("create"), createNewCommunity);
router.get("/", optionalAuth, getCommunities);
router.get("/my", authenticate, getMyCommunities);
router.get("/:id", optionalAuth, validateCommunity("id"), getCommunity);
router.put("/:id/image", authenticate, raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }), validateCommunity("image"), uploadCommunityImage);
router.put("/:id", authenticate, validateCommunity("update"), editCommunity);
router.delete("/:id", authenticate, validateCommunity("id"), removeCommunity);
export default router;
