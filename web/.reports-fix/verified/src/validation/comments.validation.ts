import { z } from "zod";
import { DisplayMode } from "../enums/enums";

export const commentDocumentIdSchema = z.string().trim().min(1).max(1500)
    .refine(value => !value.includes("/"), "Invalid document ID");
export const commentContentSchema = z.string().trim().min(1, "Write a comment first.")
    .max(5000, "Comments must be 5000 characters or fewer.");
export const CommentsSchema = z.object({
    postId: commentDocumentIdSchema,
    content: commentContentSchema,
    displayMode: z.enum(DisplayMode).default(DisplayMode.REAL),
    parentCommentId: commentDocumentIdSchema.nullable().default(null),
});
// Author, moderation status, and anonymity cannot be changed through editing.
export const updateCommentsSchema = z.object({ content: commentContentSchema });
