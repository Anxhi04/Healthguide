import crypto from "crypto";
import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { ZodError } from "zod";
import {
  activateHospitalBannedWord,
  BannedWordError, createBannedWord,
  deleteBannedWord,
  getAllBannedWords,
  getAvailableModerationWords,
  getBannedWordById,
  getHospitalBannedWords,
  removeHospitalBannedWord
} from "../services/bannedWords.services";
import { bannedWordIdSchema, createBannedWordsSchema } from "../validation/bannedWords.validation";
import { mutationFailure } from "./mutationResponse";

const respond = async (res: Response, operation: () => Promise<unknown> | unknown) => {
  res.setHeader("Cache-Control", "private, no-store");
  try { return res.json(await operation()); }
  catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid word selection" });
    if (error instanceof BannedWordError) return res.status(error.statusCode).json({ message: error.message });
    return mutationFailure(res, error);
  }
};
export const getAvailableWords = (_req: Request, res: Response) => respond(res, getAvailableModerationWords);
export const getBannedWords = (_req: Request, res: Response) => respond(res, getAllBannedWords);
export const addBannedWord = (req: Request, res: Response) => respond(res, () => createBannedWord({
  ...createBannedWordsSchema.parse(req.body), id: crypto.randomUUID(), createdAt: Timestamp.now(),
}));
export const getBannedWord = (req: Request, res: Response) => respond(res, async () => {
  const rule = await getBannedWordById(bannedWordIdSchema.parse(req.params.id));
  if (!rule || rule.hospitalId) throw new BannedWordError("Active word not found", 404);
  return rule;
});
export const removeBannedWord = (req: Request, res: Response) => respond(res, async () => {
  await deleteBannedWord(bannedWordIdSchema.parse(req.params.id)); return { message: "Word removed" };
});
export const getHospitalWords = (req: Request, res: Response) => respond(res, () => getHospitalBannedWords(req.user.uid));
export const addHospitalWord = (req: Request, res: Response) => respond(res, () => activateHospitalBannedWord(req.user.uid, req.body));
export const removeHospitalWord = (req: Request, res: Response) => respond(res, async () => {
  await removeHospitalBannedWord(req.user.uid, bannedWordIdSchema.parse(req.params.id)); return { message: "Word removed" };
});
