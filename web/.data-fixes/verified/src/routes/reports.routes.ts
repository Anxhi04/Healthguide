import { Router } from "express";
import {
    addReport,
    removeReport,
    getPostReports,
    getReports,
    getReport,
    getUserReports,
    actOnReport
} from "../controllers/reports.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";


import { validateReport } from "../validation/reports.validation";

const router = Router();
router.get("/hospital", authenticate, requireRole(Role.HOSPITAL_ADMIN), getReports);
router.patch("/:id/moderation", authenticate, requireRole(Role.ADMIN), actOnReport);

router.post("/", authenticate, validateReport, addReport);
router.get("/my", authenticate, getUserReports);
router.get("/",
    authenticate,
    requireRole(Role.ADMIN),
    getReports
);
router.get("/:id",
    authenticate,
    requireRole(Role.ADMIN, Role.HOSPITAL_ADMIN),    
    getReport);
router.get("/post/:postId",
    authenticate,
    requireRole(Role.ADMIN, Role.HOSPITAL_ADMIN),
    getPostReports);
router.delete("/:id",
    authenticate,
    requireRole(Role.ADMIN),
    removeReport
);

export default router;
