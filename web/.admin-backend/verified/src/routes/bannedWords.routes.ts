import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";
import { addBannedWord, getBannedWord, getBannedWords, removeBannedWord, getAvailableWords,
  getHospitalWords, addHospitalWord, removeHospitalWord } from "../controllers/bannedWords.controller";

const router = Router();
router.use(authenticate);
router.get("/available", requireRole(Role.ADMIN, Role.HOSPITAL_ADMIN), getAvailableWords);
router.get("/hospital", requireRole(Role.HOSPITAL_ADMIN), getHospitalWords);
router.post("/hospital", requireRole(Role.HOSPITAL_ADMIN), addHospitalWord);
router.delete("/hospital/:id", requireRole(Role.HOSPITAL_ADMIN), removeHospitalWord);
router.post("/", requireRole(Role.ADMIN), addBannedWord);
router.get("/", requireRole(Role.ADMIN), getBannedWords);
router.get("/:id", requireRole(Role.ADMIN), getBannedWord);
router.delete("/:id", requireRole(Role.ADMIN), removeBannedWord);
export default router;
