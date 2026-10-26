import { Transaction } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { Role } from "../enums/enums";
import { Hospital } from "../modules/hospitals.model";
import { User } from "../modules/users.model";
import { assertAccountCanMutate } from "./accountStatus.service";

export class AuthorizationError extends Error {
  constructor(message: string, public readonly statusCode = 403) { super(message); }
}
export const requireActor = async (uid: string, transaction?: Transaction, mutate = true) => {
  const ref = db.collection(COLLECTIONS.USERS).doc(uid);
  const snapshot = await (transaction ? transaction.get(ref) : ref.get());
  if (!snapshot.exists) throw new AuthorizationError("Complete your profile before making changes", 403);
  const user = { ...snapshot.data(), id: snapshot.id } as User;
  if (mutate) assertAccountCanMutate(user);
  return user;
};
export const requireAdministrator = async (uid: string, transaction?: Transaction, mutate = true) => {
  const user = await requireActor(uid, transaction, mutate);
  if (user.role !== Role.ADMIN) throw new AuthorizationError("Administrator permission required");
  return user;
};
// Use document IDs, never a client-supplied hospitalId or the document's id field.
export const requireManagedHospital = async (uid: string, transaction?: Transaction, mutate = false) => {
  const user = await requireActor(uid, transaction, mutate);
  if (user.role !== Role.HOSPITAL_ADMIN) throw new AuthorizationError("Hospital Admin permission required");
  const query = db.collection(COLLECTIONS.HOSPITALS).where("adminId", "==", uid);
  const result = await (transaction ? transaction.get(query) : query.get());
  if (result.docs.length !== 1) throw new AuthorizationError("Exactly one managed hospital is required");
  return { ...result.docs[0].data(), id: result.docs[0].id } as Hospital;
};
export const assertHospitalScope = (hospitalId: unknown, managedId: string) => {
  if (hospitalId !== managedId) throw new AuthorizationError("You can only manage resources at your own hospital");
};
