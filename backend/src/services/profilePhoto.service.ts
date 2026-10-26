import { Timestamp } from "firebase-admin/firestore";
import crypto from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "../config/firebase";
import { PROFILE_PHOTO_DIRECTORY, PROFILE_PHOTO_URL_PREFIX } from "../config/uploads";
import { COLLECTIONS } from "../constants/collections";
import { User } from "../modules/users.model";
import { assertAccountCanMutate } from "./accountStatus.service";

export class ProfilePhotoError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
const ownerPrefix = (uid: string) => crypto.createHash("sha256").update(uid).digest("hex");
export const cleanupProfilePhoto = async (uid: string, path?: string) => {
  const filename = path?.slice(PROFILE_PHOTO_URL_PREFIX.length) ?? "";
  // Only generated filenames for this exact owner may be deleted.
  if (path !== `${PROFILE_PHOTO_URL_PREFIX}${filename}` ||
      !new RegExp(`^${ownerPrefix(uid)}-[a-f0-9-]{36}\\.(jpg|png|webp)$`).test(filename)) return;
  try { await unlink(join(PROFILE_PHOTO_DIRECTORY, filename)); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("Could not clean up an old profile image");
  }
};
const swapReference = async (uid: string, photoUrl: string, photoStoragePath: string) => {
  const reference = db.collection(COLLECTIONS.USERS).doc(uid);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw new ProfilePhotoError("Complete your profile before setting a photo", 404);
    const user = snapshot.data() as User;
    assertAccountCanMutate(user);
    transaction.update(reference, { photoUrl, photoStoragePath, updatedAt: Timestamp.now() });
    return { oldPath: user.photoStoragePath, photoUrl };
  });
};
export const setProfilePhoto = async (uid: string, bytes: Buffer, contentType: string, origin: string) => {
  const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
  const filename = `${ownerPrefix(uid)}-${crypto.randomUUID()}.${extension}`;
  const path = `${PROFILE_PHOTO_URL_PREFIX}${filename}`;
  try {
    await mkdir(PROFILE_PHOTO_DIRECTORY, { recursive: true });
    await writeFile(join(PROFILE_PHOTO_DIRECTORY, filename), bytes, { flag: "wx" });
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") await cleanupProfilePhoto(uid, path);
    throw new ProfilePhotoError("Could not save your profile photo on the server. Please try again.", 503);
  }
  let result;
  try { result = await swapReference(uid, `${origin.replace(/\/$/, "")}${path}`, path); }
  catch (error) { await cleanupProfilePhoto(uid, path); throw error; }
  await cleanupProfilePhoto(uid, result.oldPath);
  return { photoUrl: result.photoUrl };
};
export const removeProfilePhoto = async (uid: string) => {
  const result = await swapReference(uid, "", "");
  await cleanupProfilePhoto(uid, result.oldPath);
  return { photoUrl: "" };
};
