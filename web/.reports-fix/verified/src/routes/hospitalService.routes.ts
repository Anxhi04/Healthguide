import { Router } from "express";

import {
    createNewHospitalService,
    getHospitalService,
    getAllHospitalServices,
    editHospitalService,
    removeHospitalService
} from "../controllers/hospitalService.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/", 
    authenticate,
    requireRole(Role.HOSPITAL_ADMIN),
    createNewHospitalService
);
router.get("/", getAllHospitalServices);
router.get("/:id", getHospitalService);
router.put("/:id", 
    authenticate,
    requireRole(Role.HOSPITAL_ADMIN),    
    editHospitalService);
router.delete("/:id", 
    authenticate,
    requireRole(Role.HOSPITAL_ADMIN), 
    removeHospitalService);

export default router;