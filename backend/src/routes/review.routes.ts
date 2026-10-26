import { Router } from "express";
import { createNewReview, removeReview, getReview, getReviews, editReview,
  getDoctorReviews, getHospitalReviews, getDoctorRatingSummary, getHospitalRatingSummary } from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../enums/enums";
import { getHospitalPendingReviews, decideHospitalReview, getDoctorPendingReviews, decideDoctorReview } from "../controllers/reviewModeration.controller";

const router = Router();
router.get("/moderation/doctor", authenticate, requireRole(Role.ADMIN), getDoctorPendingReviews);
router.patch("/moderation/doctor/:id", authenticate, requireRole(Role.ADMIN), decideDoctorReview);
router.get("/moderation/hospital", authenticate, requireRole(Role.HOSPITAL_ADMIN), getHospitalPendingReviews);
router.patch("/moderation/hospital/:id", authenticate, requireRole(Role.HOSPITAL_ADMIN), decideHospitalReview);
// Verify supplied tokens for ownership; guest reads stay public.
router.use((req, res, next) => req.method === "GET" && req.headers.authorization ? authenticate(req, res, next) : next());
router.post("/", authenticate, createNewReview);
router.put("/:id", authenticate, editReview);
router.delete("/:id", authenticate, removeReview);
router.get("/", getReviews);
router.get("/doctor/:id/summary", getDoctorRatingSummary);
router.get("/hospital/:id/summary", getHospitalRatingSummary);
router.get("/doctor/:id", getDoctorReviews);
router.get("/hospital/:id", getHospitalReviews);
router.get("/:id", getReview);
export default router;
