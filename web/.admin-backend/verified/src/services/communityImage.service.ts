import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db, profileBucket } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { CommunityError, requireCommunity } from "./communityMember.services";
const cleanup = async (id: string, path?: string) => {
  if (!path || !path.startsWith(`communities/${id}/cover/`) || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(path.split("/").at(-1) ?? "")) return;
  try { await profileBucket.file(path).delete({ ignoreNotFound: true }); } catch { console.error("Could not clean up community image"); }
};
export const setCommunityImage = async (id: string, uid: string, bytes: Buffer, contentType: string) => {
  const community = await requireCommunity(id);
  if (community.createdBy !== uid) throw new CommunityError("Only the creator can change the community image", 403);
  // Same Admin Storage bucket, binary validation and download-token convention as profile photos.
  const path = `communities/${id}/cover/${crypto.randomUUID()}.${contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp"}`;
  const token = crypto.randomUUID();
  try { await profileBucket.file(path).save(bytes, { resumable: false, metadata: { contentType, cacheControl: "public,max-age=3600", metadata: { firebaseStorageDownloadTokens: token } } }); }
  catch { throw new CommunityError("Community image storage is unavailable. Ask the administrator to enable Firebase Storage and check its permissions.", 503); }
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${profileBucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  let oldPath: string | undefined;
  try {
    oldPath = await db.runTransaction(async transaction => {
      const ref = db.collection(COLLECTIONS.COMMUNITIES).doc(id);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new CommunityError("Community not found", 404);
      if (snapshot.data()?.createdBy !== uid) throw new CommunityError("Only the creator can change the community image", 403);
      const previous = snapshot.data()?.imageStoragePath as string | undefined;
      transaction.update(ref, { imageUrl, imageStoragePath: path, updatedAt: Timestamp.now() }); return previous;
    });
  } catch (error) { await cleanup(id, path); throw error; }
  await cleanup(id, oldPath);
  return { imageUrl };
};
