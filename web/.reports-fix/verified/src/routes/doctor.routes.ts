import { Router } from "express";
import {
    createNewDoctor,
    getDoctor,
    getDoctors,
    editDoctor,
    removeDoctor,
    getDoctorsofHospital,
    getDirectory,
    getRelationships,
} from "../controllers/doctor.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/", authenticate, requireRole(Role.HOSPITAL_ADMIN), createNewDoctor);
router.get("/", getDoctors);
router.get("/directory", getDirectory);
router.get("/:id/relationships", getRelationships);
router.get("/hospital/:hospitalId",getDoctorsofHospital);
router.get("/:id", getDoctor);
router.put("/:id",  authenticate, requireRole(Role.HOSPITAL_ADMIN), editDoctor);
router.delete("/:id",  authenticate, requireRole(Role.HOSPITAL_ADMIN), removeDoctor);

export default router;
