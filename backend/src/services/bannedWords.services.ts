import crypto from "crypto";
import { Timestamp, Transaction } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { MODERATION_WORDS, isAllowedModerationWord, matchesModerationWord, normalizeModerationWord } from "../constants/moderationWords";
import { BannedWords } from "../modules/bannedWords.model";
import { getAllDocuments, getDocumentById, getDocumentsByField } from "../utils/firestore.service";
import { createBannedWordsSchema } from "../validation/bannedWords.validation";
import { requireManagedHospital } from "./authorization.service";

export class BannedWordError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
export const getAvailableModerationWords = () => [...MODERATION_WORDS];
export const getBannedWordById = (id: string) => getDocumentById<BannedWords>(COLLECTIONS.BANNED_WORDS, id);
export const getAllBannedWords = async (): Promise<BannedWords[]> =>
  (await getAllDocuments<BannedWords>(COLLECTIONS.BANNED_WORDS)).filter(rule => !rule.hospitalId && typeof rule.word === "string");

const requireHospital = (uid: string) => requireManagedHospital(uid);
const transactionHospital = async (transaction: Transaction, uid: string) => (await requireManagedHospital(uid, transaction, true)).id;
export const getHospitalBannedWords = async (uid: string) => {
  const hospital = await requireHospital(uid);
  return (await getDocumentsByField<BannedWords>(COLLECTIONS.BANNED_WORDS, "hospitalId", hospital.id))
    .filter(rule => typeof rule.word === "string");
};

const activate = async (wordInput: string, uid?: string) => {
  const { word } = createBannedWordsSchema.parse({ word: wordInput });
  return db.runTransaction(async transaction => {
    const hospitalId = uid ? await transactionHospital(transaction, uid) : undefined;
    const id = crypto.createHash("sha256").update(JSON.stringify([hospitalId ?? null, word])).digest("hex");
    const collection = db.collection(COLLECTIONS.BANNED_WORDS);
    const existing = await transaction.get(hospitalId ? collection.where("hospitalId", "==", hospitalId) : collection);
    if (existing.docs.some(doc => {
      const rule = doc.data() as BannedWords;
      const sameScope = hospitalId ? rule.hospitalId === hospitalId : !rule.hospitalId;
      return sameScope && typeof rule.word === "string" && normalizeModerationWord(rule.word) === word;
    })) throw new BannedWordError("This word is already active", 409);
    const rule: BannedWords = { id, word, ...(hospitalId ? { hospitalId } : {}), createdAt: Timestamp.now() };
    transaction.set(collection.doc(id), rule);
    return rule;
  });
};
export const createBannedWord = async (input: BannedWords) => activate(createBannedWordsSchema.parse({ word: input.word }).word);
export const activateHospitalBannedWord = async (uid: string, input: unknown) => {
  const { word } = createBannedWordsSchema.parse(input);
  return activate(word, uid);
};
const remove = async (id: string, uid?: string) => db.runTransaction(async transaction => {
  const hospitalId = uid ? await transactionHospital(transaction, uid) : undefined;
  const ref = db.collection(COLLECTIONS.BANNED_WORDS).doc(id);
  const snapshot = await transaction.get(ref);
  if (!snapshot.exists || snapshot.data()?.hospitalId !== hospitalId)
    throw new BannedWordError("Active word not found", 404);
  transaction.delete(ref);
});
export const deleteBannedWord = (id: string) => remove(id);
export const removeHospitalBannedWord = (uid: string, id: string) => remove(id, uid);

// A single filter serves existing moderation. Hospital reviews use only their
// hospital's selections; community content/doctor reviews retain global rules.
export const containsBannedWord = async (text: string, hospitalId?: string) => {
  const rules = hospitalId
    ? await getDocumentsByField<BannedWords>(COLLECTIONS.BANNED_WORDS, "hospitalId", hospitalId)
    : await getAllBannedWords();
  return rules.some(rule => typeof rule.word === "string" && isAllowedModerationWord(rule.word)
    && matchesModerationWord(text, rule.word));
};
