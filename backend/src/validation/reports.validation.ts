import { z } from "zod";
import { ReportReason, ReportTargetType } from "../enums/enums";
import type { Request, Response, NextFunction } from "express";
export const reportDocumentIdSchema=z.string().trim().min(1).max(1500).refine(value => !value.includes("/"), "Invalid target ID");
export const createReportSchema=z.object({
    targetType:z.enum(ReportTargetType),
    targetId:reportDocumentIdSchema,
    reason:z.enum(ReportReason),
    description:z.string().trim().max(500).optional()
})
export type CreateReportInput = z.infer<typeof createReportSchema>;
export const validateReport = (req: Request, res: Response, next: NextFunction) => {
  const result = createReportSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: "Invalid report", errors: result.error.issues });
  res.locals.reportInput = result.data;
  next();
};

export const reportActionSchema = z.object({ action: z.enum(["DISMISS", "RESOLVE", "REMOVE_CONTENT", "BLOCK_ACCOUNT", "REMOVE_AND_BLOCK"]) }).strict();
export type ReportAction = z.infer<typeof reportActionSchema>["action"];
