import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { logFirebaseError } from "../config/firebase";
import { getUserById } from "../services/user.services";
import { AccountRestrictionError, assertAccountCanMutate } from "../services/accountStatus.service";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? "");
    if (!match) return res.status(401).json({ message: "Authentication required" });
    try {
        req.user = await getAuth().verifyIdToken(match[1]);
    } catch (error) {
        logFirebaseError("ID token verification failed", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
    try {
        if (!["GET", "HEAD", "OPTIONS"].includes(req.method ?? "GET")) {
            const user = await getUserById(req.user.uid);
            const registration = req.method === "POST" && req.baseUrl === "/users" && req.path === "/";
            if (!user && !registration) return res.status(403).json({ code: "PROFILE_REQUIRED", message: "Complete your profile before making changes" });
            assertAccountCanMutate(user);
        }
        return next();
    } catch (error) {
        if (error instanceof AccountRestrictionError) return res.status(error.statusCode).json({ code: error.code, message: error.message });
        console.error("ACCOUNT AUTHORIZATION ERROR:", error);
        return res.status(500).json({ message: "Could not authorize this request" });
    }
};
