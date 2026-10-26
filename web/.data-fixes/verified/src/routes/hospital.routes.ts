import { Router } from "express";
import {
    createNewHospital,
    getHospital,
    getAllHospital,
    editHospital,
    removeHospital,
    getMyHospital
} from "../controllers/hospitals.controller";
import { Role } from "../enums/enums";
import { requireRole } from "../middleware/role.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();


router.get( "/me", authenticate, getMyHospital);
router.post("/",
    authenticate,
    requireRole(Role.HOSPITAL_ADMIN),
    createNewHospital);
router.get("/", getAllHospital);

router.get("/:id", getHospital);
router.put("/:id",
    authenticate,
    requireRole(Role.HOSPITAL_ADMIN), 
    editHospital);

router.delete("/:id",
    authenticate,
    requireRole(Role.HOSPITAL_ADMIN),
    removeHospital);

export default router;