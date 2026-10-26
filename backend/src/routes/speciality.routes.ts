import { Router } from "express";
import {
    createNewSpeciality,
    editSpeciality,
    removeSpeciality,
    getSpecialities,
    getSpeciality
}from "../controllers/speciality.controller"
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";

const router = Router();

router.post("/",
    authenticate,
    requireRole(Role.ADMIN),
    createNewSpeciality
);
router.get("/", getSpecialities);
router.get("/:id", getSpeciality);
router.put("/:id",
    authenticate,
    requireRole(Role.ADMIN),   
    editSpeciality);
router.delete("/:id",    
    authenticate,
    requireRole(Role.ADMIN), 
    removeSpeciality);

export default router;