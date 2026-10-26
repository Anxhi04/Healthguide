import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { ReviewStatus } from "../enums/enums";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { ReviewError } from "../services/review.service";
import { getHospitalModerationQueue, moderateHospitalReview } from "../services/reviewModeration.service";

const decisionSchema = z.object({ status: z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED]) }).strict();
const respond = async (req: Request, res: Response, operation: (uid: string) => Promise<unknown>) => {
  res.setHeader("Cache-Control", "private, no-store");
  if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
  try { return res.json(await operation(req.user.uid)); }
  catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid moderation request" });
    if (error instanceof ReviewError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: "Could not moderate reviews. Please try again." });
  }
};
export const getHospitalPendingReviews = (req: Request, res: Response) =>
  respond(req, res, getHospitalModerationQueue);
export const decideHospitalReview = (req: Request, res: Response) =>
  respond(req, res, uid => moderateHospitalReview(uid, reviewDocumentIdSchema.parse(req.params.id), decisionSchema.parse(req.body).status));
