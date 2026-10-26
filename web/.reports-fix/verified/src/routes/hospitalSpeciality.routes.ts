import { Router } from "express";

import {
    createNewHospitalSpeciality,
    getHospitalSpeciality,
    getAllHospitalSpecialities,
    editHospitalSpeciality,
    removeHospitalSpeciality,
    getSpecialitiesOfHospital,
    getDoctorsByHospitalAndSpecialityController
} from "../controllers/hospitalSpeciality.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/",  authenticate, requireRole(Role.HOSPITAL_ADMIN), createNewHospitalSpeciality);
router.get("/", getAllHospitalSpecialities);
router.get("/hospital/:hospitalId", getSpecialitiesOfHospital);
router.get("/hospital/:hospitalId/speciality/:specialityId",getDoctorsByHospitalAndSpecialityController);
router.get("/:id", getHospitalSpeciality);
router.put("/:id",  authenticate, requireRole(Role.HOSPITAL_ADMIN), editHospitalSpeciality);
router.delete("/:id",  authenticate, requireRole(Role.HOSPITAL_ADMIN), removeHospitalSpeciality);

export default router;