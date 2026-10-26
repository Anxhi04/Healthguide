import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { auth, db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { Role, UserStatus } from "../enums/enums";
import { updateUserSchema } from "../validation/user.validation";
import { AuthorizationError, requireActor, requireAdministrator } from "./authorization.service";
import { cleanupProfilePhoto } from "./profilePhoto.service";

export const adminUserUpdateSchema = updateUserSchema.extend({ role: z.enum(Role).optional(), status: z.enum(UserStatus).optional() }).strict();
export const editAccount = async (uid: string, id: string, input: unknown, administrative = false) => {
  const data = (administrative ? adminUserUpdateSchema : updateUserSchema).parse(input);
  return db.runTransaction(async tx => {
    if (administrative) await requireAdministrator(uid, tx);
    else { await requireActor(uid, tx); if (id !== uid) throw new AuthorizationError("You can only update your own profile"); }
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const target = await tx.get(ref);
    if (!target.exists || target.data()?.deletedAt) throw new AuthorizationError("User not found", 404);
    if (administrative && target.data()?.role === Role.ADMIN) throw new AuthorizationError("Use personal settings for administrator profiles");
    tx.update(ref, { ...data, ...(data.dateOfBirth ? { dateOfBirth: Timestamp.fromDate(new Date(data.dateOfBirth)) } : {}), updatedAt: Timestamp.now() });
  });
};
export const deleteAccount = async (uid: string, id: string, administrative = false) => {
  const oldPhoto = await db.runTransaction(async tx => {
    if (administrative) await requireAdministrator(uid, tx);
    else { await requireActor(uid, tx); if (id !== uid) throw new AuthorizationError("You can only delete your own profile"); }
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const target = await tx.get(ref);
    if (!target.exists) throw new AuthorizationError("User not found", 404);
    if (target.data()?.role === Role.ADMIN) throw new AuthorizationError("Administrator accounts cannot be deleted through this endpoint");
    const hospitals = await tx.get(db.collection(COLLECTIONS.HOSPITALS).where("adminId", "==", id));
    if (hospitals.docs.length) throw new AuthorizationError("Remove the managed hospital before deleting this account", 409);
    // Retain only a restriction tombstone so a still-valid token, an Auth failure,
    // or a registration retry cannot recreate this UID as ACTIVE.
    tx.set(ref, { id, role: Role.USER, status: UserStatus.BLOCKED, deletedAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return target.data()?.photoStoragePath as string | undefined;
  });
  await cleanupProfilePhoto(id, oldPhoto);
  try { await auth.deleteUser(id); }
  catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") {
      throw new AuthorizationError("Profile removed and access blocked; Firebase account cleanup must be retried by an administrator", 503);
    }
  }
};
