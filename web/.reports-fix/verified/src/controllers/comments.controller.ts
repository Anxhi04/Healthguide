import { Request, Response } from "express";
import { createComment, getCommentsByPostId, deleteComment, updateComment, CommentError } from "../services/comments.service";
import { CommentsSchema, updateCommentsSchema, commentDocumentIdSchema } from "../validation/comments.validation";
import { ZodError } from "zod";
import crypto from "crypto";

const sendError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) return res.status(400).json({
        message: error.issues[0]?.message ?? "Invalid comment", errors: error.issues,
    });
    if (error instanceof CommentError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: "Could not process the comment. Please try again." });
};

export const createNewComment = async (req: Request, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ message: "Authentication required" });
    try {
        const data = CommentsSchema.parse(req.body);
        const comment = await createComment({ ...data, userId: uid, id: crypto.randomUUID() });
        res.setHeader("Cache-Control", "private, no-store");
        return res.status(200).json(comment);
    } catch (error) { return sendError(res, error); }
};
export const getComments = async (req: Request, res: Response) => {
    try {
        const postId = commentDocumentIdSchema.parse(req.params.postId);
        const comments = await getCommentsByPostId(postId, req.user?.uid);
        res.setHeader("Cache-Control", "private, no-store");
        return res.status(200).json(comments);
    } catch (error) { return sendError(res, error); }
};
export const editComment = async (req: Request, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ message: "Authentication required" });
    try {
        const id = commentDocumentIdSchema.parse(req.params.id);
        const data = updateCommentsSchema.parse(req.body);
        const comment = await updateComment(id, data.content, uid);
        res.setHeader("Cache-Control", "private, no-store");
        return res.status(200).json(comment);
    } catch (error) { return sendError(res, error); }
};
export const removeComment = async (req: Request, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ message: "Authentication required" });
    try {
        const id = commentDocumentIdSchema.parse(req.params.id);
        await deleteComment(id, uid);
        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) { return sendError(res, error); }
};
