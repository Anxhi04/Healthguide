import { Router } from "express";

import {
    createNewDoctorAssignment,
    getDoctorAssignment,
    getAllDoctorAssignments,
    editDoctorAssignment,
    removeDoctorAssignment
} from "../controllers/doctorAssignment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/", authenticate, requireRole(Role.HOSPITAL_ADMIN), createNewDoctorAssignment);
router.get("/", getAllDoctorAssignments);
router.get("/:id", getDoctorAssignment);
router.put("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), editDoctorAssignment);
router.delete("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), removeDoctorAssignment);

export default router;