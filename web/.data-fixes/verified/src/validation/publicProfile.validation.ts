import { z } from "zod";

export const publicProfileIdSchema = z.string().trim().min(1).max(128).refine(id => !id.includes("/"));
export const phoneVisibilitySchema = z.object({ showPhonePublicly: z.boolean() }).strict();
