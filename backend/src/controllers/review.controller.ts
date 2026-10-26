import crypto from "crypto";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { TargetType } from "../enums/enums";
import {
  ReviewError, createReview,
  deleteReview, getPublicReviewById,
  getPublicReviews,
  getRatingSummary,
  getReviewByDoctorId, getReviewByHospitalId,
  updateReview
} from "../services/review.service";
import { createReviewValidation, reviewDocumentIdSchema, updateReviewValidation } from "../validation/review.validation";

const sendError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid review" });
  if (error instanceof ReviewError) return res.status(error.statusCode).json({ message: error.message });
  return res.status(500).json({ message: "Could not process reviews. Please try again." });
};
const respond = async (res: Response, operation: () => Promise<unknown>) => {
  res.setHeader("Cache-Control", "private, no-store");
  try { return res.status(200).json(await operation()); }
  catch (error) { return sendError(res, error); }
};
export const createNewReview = (req: Request, res: Response) => {
  if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
  return respond(res, () => createReview({ ...createReviewValidation.parse(req.body),
    id: crypto.randomUUID(), userId: req.user.uid }));
};
export const editReview = (req: Request, res: Response) => {
  if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
  return respond(res, () => updateReview(reviewDocumentIdSchema.parse(req.params.id),
    updateReviewValidation.parse(req.body), req.user.uid));
};
export const removeReview = (req: Request, res: Response) => {
  if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
  return respond(res, async () => {
    await deleteReview(reviewDocumentIdSchema.parse(req.params.id), req.user.uid);
    return { message: "Review deleted" };
  });
};
export const getReview = (req: Request, res: Response) => respond(res,
  () => getPublicReviewById(reviewDocumentIdSchema.parse(req.params.id), req.user?.uid));
export const getReviews = (req: Request, res: Response) => respond(res, () => getPublicReviews(req.user?.uid));
export const getDoctorReviews = (req: Request, res: Response) => respond(res,
  () => getReviewByDoctorId(reviewDocumentIdSchema.parse(req.params.id), req.user?.uid));
export const getHospitalReviews = (req: Request, res: Response) => respond(res,
  () => getReviewByHospitalId(reviewDocumentIdSchema.parse(req.params.id), req.user?.uid));
export const getHospitalRatingSummary = (req: Request, res: Response) => respond(res,
  () => getRatingSummary(TargetType.HOSPITAL, reviewDocumentIdSchema.parse(req.params.id)));
export const getDoctorRatingSummary = (req: Request, res: Response) => respond(res,
  () => getRatingSummary(TargetType.DOCTOR, reviewDocumentIdSchema.parse(req.params.id)));
