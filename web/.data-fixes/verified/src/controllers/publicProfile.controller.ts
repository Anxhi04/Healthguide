import { Request, Response } from "express";
import { ZodError } from "zod";
import { getPublicPostsByUser } from "../services/posts.service";
import { setPhoneVisibility } from "../services/profilePrivacy.service";
import { AccountRestrictionError } from "../services/accountStatus.service";
import { publicProfileIdSchema, phoneVisibilitySchema } from "../validation/publicProfile.validation";

export const getPublicPosts = async (req: Request, res: Response) => {
    try {
        const id = publicProfileIdSchema.parse(req.params.id);
        const posts = await getPublicPostsByUser(id, req.user?.uid);
        if (!posts) return res.status(404).json({ message: "Public profile not available" });
        return res.status(200).json(posts);
    } catch (error) {
        if (error instanceof ZodError) return res.status(400).json({ message: "Invalid profile ID" });
        return res.status(500).json({ message: "Could not load public posts" });
    }
};
export const updatePhoneVisibility = async (req: Request, res: Response) => {
    if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
    try {
        const input = phoneVisibilitySchema.parse(req.body);
        const result = await setPhoneVisibility(req.user.uid, input.showPhonePublicly);
        if (!result) return res.status(404).json({ message: "Profile not found" });
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof ZodError) return res.status(400).json({ message: "Invalid privacy update" });
        if (error instanceof AccountRestrictionError) return res.status(error.statusCode).json({ code: error.code, message: error.message });
        return res.status(500).json({ message: "Could not save phone visibility" });
    }
};
