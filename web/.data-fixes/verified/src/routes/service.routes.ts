import { Router } from "express";
import {
    createNewService,
    getService,
    editService,
    removeService,
    getServices,
} from "../controllers/service.controller";
import { authenticate } from "../middleware/auth.middleware";
import { Role } from "../enums/enums";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/",  authenticate, requireRole(Role.HOSPITAL_ADMIN), createNewService);
router.get("/", getServices);
router.get("/:id", getService);
router.put("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), editService);
router.delete("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), removeService);

export default router;