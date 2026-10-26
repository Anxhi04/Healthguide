import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { DisplayMode, ReviewStatus } from "../enums/enums";
import { Comment } from "../modules/comments.model";
import { createDocument, getDocumentById, getDocumentsByField } from "../utils/firestore.service";
import { CommentsSchema, commentContentSchema } from "../validation/comments.validation";
import { containsBannedWord } from "./bannedWords.services";
import { getAnonymousNumber } from "./commentAnonymousIdentity.service";
import { getPostById } from "./posts.service";
import { toPublicUser } from "./publicUser.service";
import { getUserById } from "./user.services";

export class CommentError extends Error {
    constructor(message: string, public readonly statusCode: number) { super(message); }
}

export const toPublicComment = async (comment: Comment, viewerUid?: string,
    authors = new Map<string, ReturnType<typeof getUserById>>()) => {
    const common = {
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        displayMode: comment.displayMode,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        isMine: viewerUid !== undefined && comment.userId === viewerUid,
        parentCommentId: comment.parentCommentId ?? null,
    };
    if (comment.displayMode === DisplayMode.ANONYMOUS) {
        // Legacy anonymous comments receive a persistent mapping without rewriting them.
        const anonymousNumber = comment.anonymousNumber ??
            await getAnonymousNumber(comment.postId, comment.userId);
        return { ...common, anonymousNumber, anonymousLabel: `Anonymous ${anonymousNumber}` };
    }
    if (!authors.has(comment.userId)) authors.set(comment.userId, getUserById(comment.userId));
    const user = await authors.get(comment.userId);
    return { ...common, author: user ? toPublicUser(user) : null };
};

export const createComment = async (
    input: Pick<Comment, "id" | "postId" | "userId" | "content" | "displayMode" | "parentCommentId">
) => {
    const { postId, content, displayMode, parentCommentId } = CommentsSchema.parse(input);
    const user = await getUserById(input.userId);
    if (!user) throw new CommentError("Complete your user profile before commenting.", 404);
    if (!await getPostById(postId)) throw new CommentError("Post not found", 404);
    const hasBannedWord = await containsBannedWord(content);
    const newComment: Comment = {
        id: input.id, postId, userId: input.userId, content,
        displayMode, parentCommentId,
        status: hasBannedWord ? ReviewStatus.PENDING : ReviewStatus.APPROVED,
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
        ...(input.displayMode === DisplayMode.ANONYMOUS
            ? { anonymousNumber: await getAnonymousNumber(postId, input.userId) } : {}),
    };
    if (parentCommentId) {
        // Read the thread root in the same transaction as creation so deletion
        // cannot race with a new reply and leave an orphan.
        await db.runTransaction(async transaction => {
            const parentRef = db.collection(COLLECTIONS.COMMENTS).doc(parentCommentId);
            const snapshot = await transaction.get(parentRef);
            if (!snapshot.exists) throw new CommentError("Parent comment not found", 404);
            const parent = snapshot.data() as Comment;
            if (parent.postId !== postId) throw new CommentError("Parent comment belongs to another post", 400);
            if (parent.status !== ReviewStatus.APPROVED && parent.userId !== input.userId)
                throw new CommentError("Parent comment not found", 404);
            if (parent.parentCommentId) {
                const rootRef = db.collection(COLLECTIONS.COMMENTS).doc(parent.parentCommentId);
                const rootSnapshot = await transaction.get(rootRef);
                if (!rootSnapshot.exists) throw new CommentError("Parent comment not found", 404);
                const root = rootSnapshot.data() as Comment;
                if (root.postId !== postId || root.parentCommentId)
                    throw new CommentError("Invalid comment thread", 400);
                if (root.status !== ReviewStatus.APPROVED && root.userId !== input.userId)
                    throw new CommentError("Parent comment not found", 404);
                newComment.parentCommentId = parent.parentCommentId;
            } else newComment.parentCommentId = parentCommentId;
            transaction.set(db.collection(COLLECTIONS.COMMENTS).doc(newComment.id), newComment);
        });
    } else await createDocument(COLLECTIONS.COMMENTS, newComment.id, newComment);
    return toPublicComment(newComment, input.userId);
};

export const getCommentById = async (id: string) =>
    getDocumentById<Comment>(COLLECTIONS.COMMENTS, id);

export const getCommentsByPostId = async (postId: string, viewerUid?: string) => {
    if (!await getPostById(postId)) throw new CommentError("Post not found", 404);
    const comments = await getDocumentsByField<Comment>(COLLECTIONS.COMMENTS, "postId", postId);
    const visible = comments.filter(comment => comment.status === ReviewStatus.APPROVED ||
        (viewerUid !== undefined && comment.userId === viewerUid));
    visible.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis() || a.id.localeCompare(b.id));
    const authors = new Map<string, ReturnType<typeof getUserById>>();
    return Promise.all(visible.map(comment => toPublicComment(comment, viewerUid, authors)));
};

export const updateComment = async (id: string, content: string, viewerUid: string) => {
    content = commentContentSchema.parse(content);
    const status = await containsBannedWord(content) ? ReviewStatus.PENDING : ReviewStatus.APPROVED;
    const updated = await db.runTransaction(async transaction => {
        const ref = db.collection(COLLECTIONS.COMMENTS).doc(id);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new CommentError("Comment not found", 404);
        const comment = snapshot.data() as Comment;
        if (comment.userId !== viewerUid) throw new CommentError("You can only edit your own comments", 403);
        const result = { ...comment, id, content, status, updatedAt: Timestamp.now() };
        transaction.update(ref, { content, status, updatedAt: result.updatedAt });
        return result;
    });
    return toPublicComment(updated, viewerUid);
};

export const deleteComment = async (id: string, viewerUid: string) => {
    await db.runTransaction(async transaction => {
        const ref = db.collection(COLLECTIONS.COMMENTS).doc(id);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new CommentError("Comment not found", 404);
        if (snapshot.data()!.userId !== viewerUid)
            throw new CommentError("You can only delete your own comments", 403);
        const replies = await transaction.get(db.collection(COLLECTIONS.COMMENTS)
            .where("parentCommentId", "==", id));
        // Preserve hard deletion and surviving replies without broken references.
        for (const reply of replies.docs) transaction.update(reply.ref, { parentCommentId: null });
        transaction.delete(ref);
    });
    // Keep the anonymous mapping: deleting a comment must never renumber authors.
};
