import { Request, Response } from "express";
import {
    getPostById,
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    presentPosts
} from "../services/posts.service";

import {
    createPostsSchema,
    updatePostsSchema
} from "../validation/posts.validation";    

import { ZodError } from "zod";
import crypto from "crypto";


export const createNewPost = async (
    req: Request,
    res: Response
) => {

    try {

        const uid = req.user?.uid;
        if (!uid) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const validatedData = createPostsSchema.parse(req.body);

        const post = await createPost({
            ...validatedData,
            userId: uid,
            id: crypto.randomUUID()
        });

        return res.status(200).json((await presentPosts([post], uid))[0]);

    } catch (error: any) {

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


export const getPost = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const post = await getPostById(id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const publicPost = (await presentPosts([post as import("../modules/posts.model").Post], req.user?.uid))[0];
        if (!publicPost) return res.status(404).json({ message: "Post not found" });
        return res.status(200).json(publicPost);

    } catch (error: any) {

        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};


export const getPosts = async (
    req: Request,
    res: Response
) => {

    try {

        const communityId = req.query.communityId;
        if (communityId !== undefined &&
            (typeof communityId !== "string" || communityId.length === 0)) {
            return res.status(400).json({ message: "Invalid community ID" });
        }
        const posts = await getAllPosts(communityId);

        return res.status(200).json(await presentPosts(posts, req.user?.uid));

    } catch (error: any) {

        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};


export const editPost = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const validatedData = updatePostsSchema.parse(req.body);

        await updatePost(
            id,
            validatedData
        );

        return res.status(200).json({
            message: "Post updated"
        });

    } catch (error: any) {

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


export const removePost = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        await deletePost(id);

        return res.status(200).json({
            message: "Post deleted"
        });

    } catch (error: any) {

        return res.status(400).json({
            message: error.message
        });
    }
};
