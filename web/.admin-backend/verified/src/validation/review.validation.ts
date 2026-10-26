import { z } from "zod";
import { TargetType, DisplayMode } from "../enums/enums";

export const reviewDocumentIdSchema = z.string().trim().min(1).max(1500)
  .refine(value => !value.includes("/"), "Invalid document ID");
const fields = {
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(5000).optional(),
};
export const reviewContentValidation = z.object(fields).refine(
  data => data.rating !== undefined || !!data.comment,
  { message: "Provide a rating or write a review.", path: ["rating"] },
);
export const createReviewValidation = z.object({
  ...fields,
  targetType: z.enum(TargetType),
  targetId: reviewDocumentIdSchema,
  displayMode: z.enum(DisplayMode).default(DisplayMode.REAL),
}).refine(data => data.rating !== undefined || !!data.comment,
  { message: "Provide a rating or write a review.", path: ["rating"] });
// Ownership, target, moderation, and anonymity cannot be rewritten by clients.
export const updateReviewValidation = z.object(fields).refine(
  data => data.rating !== undefined || data.comment !== undefined,
  { message: "Provide a rating or review text to update." },
);
