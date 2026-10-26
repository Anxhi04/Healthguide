import { Timestamp } from "firebase-admin/firestore";
import crypto from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "../config/firebase";
import { COMMUNITY_IMAGE_DIRECTORY, COMMUNITY_IMAGE_URL_PREFIX } from "../config/uploads";
import { COLLECTIONS } from "../constants/collections";
import { communityIdSchema } from "../validation/communities.validation";
import { profilePhotoSchema } from "../validation/profilePhoto.validation";
import { requireActor } from "./authorization.service";
import { CommunityError, requireCommunity } from "./communityMember.services";

const ownerPrefix = (id: string) => crypto.createHash("sha256").update(id).digest("hex");
export const cleanupCommunityImage = async (id: string, path?: string) => {
  if (typeof path !== "string" || !path.startsWith(COMMUNITY_IMAGE_URL_PREFIX)) return;
  const filename = path.slice(COMMUNITY_IMAGE_URL_PREFIX.length);
  if (!new RegExp(`^${ownerPrefix(id)}-[a-f0-9-]{36}\\.(jpg|png|webp)$`).test(filename)) return;
  try { await unlink(join(COMMUNITY_IMAGE_DIRECTORY, filename)); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("Could not clean up community image"); }
};
export const setCommunityImage = async (id: string, uid: string, bytes: Buffer, contentType: string, origin: string) => {
  communityIdSchema.parse(id);
  profilePhotoSchema.parse({ bytes, contentType });
  await requireActor(uid);
  const community = await requireCommunity(id);
  if (community.createdBy !== uid) throw new CommunityError("Only the creator can change the community image", 403);
  const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
  const filename = `${ownerPrefix(id)}-${crypto.randomUUID()}.${extension}`;
  const path = `${COMMUNITY_IMAGE_URL_PREFIX}${filename}`;
  const imageUrl = `${origin.replace(/\/$/, "")}${path}`;
  try {
    await mkdir(COMMUNITY_IMAGE_DIRECTORY, { recursive: true });
    await writeFile(join(COMMUNITY_IMAGE_DIRECTORY, filename), bytes, { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") await cleanupCommunityImage(id, path);
    throw new CommunityError("Could not save the community image on the server", 503);
  }
  let oldPath: string | undefined;
  try {
    oldPath = await db.runTransaction(async transaction => {
      await requireActor(uid, transaction);
      const ref = db.collection(COLLECTIONS.COMMUNITIES).doc(id);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new CommunityError("Community not found", 404);
      if (snapshot.data()?.createdBy !== uid) throw new CommunityError("Only the creator can change the community image", 403);
      const previous = snapshot.data()?.imageStoragePath as string | undefined;
      transaction.update(ref, { imageUrl, imageStoragePath: path, updatedAt: Timestamp.now() });
      return previous;
    });
  } catch (error) { await cleanupCommunityImage(id, path); throw error; }
  await cleanupCommunityImage(id, oldPath);
  return { imageUrl };
};
