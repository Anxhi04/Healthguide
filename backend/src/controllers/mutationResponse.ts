import { Response } from "express";
import { ZodError } from "zod";
import { AccountRestrictionError } from "../services/accountStatus.service";
import { AuthorizationError } from "../services/authorization.service";

export const mutationFailure = (res: Response, error: unknown) => {
  if (error instanceof ZodError) return res.status(400).json({ message: "Invalid request", errors: error.issues });
  if (error instanceof AccountRestrictionError) return res.status(403).json({ code: error.code, message: error.message });
  if (error instanceof AuthorizationError) return res.status(error.statusCode).json({ message: error.message });
  console.error("Mutation failed", error instanceof Error ? error.message : "Unknown error");
  return res.status(500).json({ message: "Could not complete the request" });
};
