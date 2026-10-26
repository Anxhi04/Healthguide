import { Request, Response } from "express";
import { ZodError } from "zod";
import { AccountRestrictionError } from "../services/accountStatus.service";
import { ProfilePhotoError, removeProfilePhoto, setProfilePhoto } from "../services/profilePhoto.service";
import { publicBackendUrl } from "../utils/publicBackendUrl";
import { profilePhotoSchema, profilePhotoUidSchema } from "../validation/profilePhoto.validation";

const failure = (res: Response, error: unknown) => {
  if (error instanceof AccountRestrictionError) return res.status(403).json({ code: error.code, message: error.message });
  if (!(error instanceof ZodError) && !(error instanceof ProfilePhotoError))
    console.error("Profile photo request failed", { name: (error as Error)?.name, message: (error as Error)?.message });
  return res.status(error instanceof ZodError ? 400 :
  error instanceof ProfilePhotoError ? error.statusCode : 500).json({ message: error instanceof ZodError ?
    "Choose a valid JPEG, PNG or WebP image smaller than 5 MB" : error instanceof ProfilePhotoError ? error.message : "Could not save your profile photo" });
};
export const uploadPhoto = async (req: Request, res: Response) => {
  if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
  try {
    const uid = profilePhotoUidSchema.parse(req.user.uid);
    const input = profilePhotoSchema.parse({ contentType: req.get("Content-Type")?.split(";")[0], bytes: req.body,
      filename: req.get("X-Photo-Filename") });
    const origin = publicBackendUrl(req);
    return res.json(await setProfilePhoto(uid, input.bytes, input.contentType, origin));
  } catch (error) { return failure(res, error); }
};
export const deletePhoto = async (req: Request, res: Response) => {
  if (!req.user?.uid) return res.status(401).json({ message: "Authentication required" });
  try { return res.json(await removeProfilePhoto(profilePhotoUidSchema.parse(req.user.uid))); }
  catch (error) { return failure(res, error); }
};
