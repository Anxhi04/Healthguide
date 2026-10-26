import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db, profileBucket } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { User } from "../modules/users.model";

export class ProfilePhotoError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
const cleanup = async (uid: string, path?: string) => {
  // Delete only versioned files created by this service for this exact owner.
  const filename = path?.split("/").at(-1) ?? "";
  if (path !== `users/${uid}/profile/${filename}` || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename)) return;
  try { await profileBucket.file(path).delete({ ignoreNotFound: true }); }
  catch { console.error("Could not clean up an old profile image"); }
};
const swapReference = async (uid: string, photoUrl: string, photoStoragePath: string) => {
  const reference = db.collection(COLLECTIONS.USERS).doc(uid);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw new ProfilePhotoError("Complete your profile before setting a photo", 404);
    const user = snapshot.data() as User;
    transaction.update(reference, { photoUrl, photoStoragePath, updatedAt: Timestamp.now() });
    return { oldPath: user.photoStoragePath, photoUrl };
  });
};
export const setProfilePhoto = async (uid: string, bytes: Buffer, contentType: string) => {
  const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
  const path = `users/${uid}/profile/${crypto.randomUUID()}.${extension}`;
  const token = crypto.randomUUID();
  const file = profileBucket.file(path);
  try { await file.save(bytes, { resumable: false, metadata: { contentType, cacheControl: "public,max-age=3600",
    metadata: { firebaseStorageDownloadTokens: token } } }); }
  catch (error) {
    console.error("Profile photo Storage upload failed", { bucket: profileBucket.name,
      code: (error as { code?: unknown })?.code, message: (error as Error)?.message });
    const code = Number((error as { code?: unknown })?.code);
    // A failed save has not produced a referenced file; clean up only if it may exist.
    if (code !== 404) await cleanup(uid, path);
    if (code === 404) throw new ProfilePhotoError("Profile photo storage is not configured. Ask the administrator to enable Firebase Storage for this project.", 503);
    if (code === 403) throw new ProfilePhotoError("The server cannot access profile photo storage. Ask the administrator to check its Storage permissions.", 503);
    throw error;
  }
  const url = `https://firebasestorage.googleapis.com/v0/b/${profileBucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  let result;
  try { result = await swapReference(uid, url, path); }
  catch (error) { await cleanup(uid, path); throw error; }
  await cleanup(uid, result.oldPath);
  return { photoUrl: result.photoUrl };
};
export const removeProfilePhoto = async (uid: string) => {
  const result = await swapReference(uid, "", "");
  await cleanup(uid, result.oldPath);
  return { photoUrl: "" };
};
