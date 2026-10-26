import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { profilePhotoSchema } from "./profilePhoto.validation";
export const communityIdSchema = z.string().min(1).max(1500).refine(value => !/[\\/]/.test(value), "Invalid community ID");
export const communitiesSchema = z.object({
  name: z.string().trim().min(2).max(30),
  description: z.string().trim().min(10).max(1000).optional(),
}).strict();
export const updateCommunitiesSchema = communitiesSchema.partial();
export const validateCommunity = (mode: "create" | "update" | "id" | "image") =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = mode === "create" ? null : communityIdSchema.safeParse(req.params.id ?? req.params.communityId);
    if (id && !id.success) return res.status(400).json({ message: "Invalid community ID" });
    const schema = mode === "create" ? communitiesSchema : mode === "update" ? updateCommunitiesSchema : mode === "image" ? profilePhotoSchema : null;
    const body = mode === "image" ? { contentType: req.get("Content-Type")?.split(";")[0], bytes: req.body } : req.body;
    const input = schema?.safeParse(body);
    if (input && !input.success) return res.status(400).json({ message: "Invalid community data", errors: input.error.issues });
    res.locals.communityId = id && id.success ? id.data : undefined;
    res.locals.communityInput = input?.success ? input.data : undefined;
    next();
  };
