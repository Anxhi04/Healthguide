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

router.post("/",  authenticate, requireRole(Role.HOSPITAL_ADMIN), createNewDoctorSpeciality);
router.get("/", getAllDoctorSpecialities);
router.get("/:id", getDoctorSpeciality);
router.put("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), editDoctorSpeciality);
router.delete("/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), removeDoctorSpeciality);

export default router;