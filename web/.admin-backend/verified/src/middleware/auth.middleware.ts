import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { getUserById } from "../services/user.services";
import { UserStatus } from "../enums/enums";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const match = req.headers.authorization?.match(/^Bearer (\S+)$/i);
  if (!match) return res.status(401).json({ message: "Authentication required" });
  try { req.user = await getAuth().verifyIdToken(match[1]); }
  catch { return res.status(401).json({ message: "Invalid or expired token" }); }
  try {
    // Token validity does not bypass the current application account status.
    const user = await getUserById(req.user.uid);
    req.user.role = user?.role;
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && user?.status === UserStatus.BLOCKED)
      return res.status(403).json({ message: "Your HealthGuide account is blocked. Mutations are not permitted." });
    next();
  } catch { return res.status(500).json({ message: "Could not verify account status" }); }
};
