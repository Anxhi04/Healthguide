import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/user.services";
import { Role } from "../enums/enums";

export const requireRole = (...allowedRoles: Role[]) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.uid;
            const user = await getUserById(userId);
            if (!user) {
                return res.status(401).json({
                    message: "User not found"
                });
            }
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: "you do not have permission to continue"
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                message: "Server error"
            });
        }
    };
};