import { Router } from "express";
import {
    createNewDoctorSpeciality,
    getAllDoctorSpecialities,
    getDoctorSpeciality,
    editDoctorSpeciality,
    removeDoctorSpeciality
    
}from "../controllers/doctorSpeciality.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/",  authenticate, requireRole(Role.HOSPITAL_ADMIN, Role.ADMIN), createNewDoctorSpeciality);
router.get("/", getAllDoctorSpecialities);
router.get("/:id", getDoctorSpeciality);
router.put("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN, Role.ADMIN), editDoctorSpeciality);
router.delete("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN, Role.ADMIN), removeDoctorSpeciality);

export default router;