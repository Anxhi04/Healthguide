import { Request } from "express";
export const publicBackendUrl = (req: Request) =>
  (process.env.PUBLIC_BACKEND_URL?.trim() || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
