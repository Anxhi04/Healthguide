import { db } from "../config/firebase";
import type { DocumentData } from "firebase-admin/firestore";

export type FirestoreDocument<T> = T & { id: string };

// Resolve relationship IDs in batches instead of one request per record or a full scan.
export const getDocumentsByIds = async <T>(collectionName: string, ids: string[]): Promise<FirestoreDocument<T>[]> => {
    const unique = [...new Set(ids)];
    const batches: string[][] = [];
    for (let offset = 0; offset < unique.length; offset += 100) batches.push(unique.slice(offset, offset + 100));
    const snapshots = await Promise.all(batches.map(batch => db.getAll(
        ...batch.map(id => db.collection(collectionName).doc(id))
    )));
    return snapshots.flat().filter(snapshot => snapshot.exists).map(snapshot => ({
        ...(snapshot.data() as T), id: snapshot.id,
    } as FirestoreDocument<T>));
};

export const createDocument = async <T extends DocumentData>(
    collectionName: string,
    id: string,
    data: T
) => {
    await db.collection(collectionName).doc(id).set(data);
};

// Lexon një dokument sipas ID
export const getDocumentById = async <T>(
    collectionName: string,
    id: string
): Promise<FirestoreDocument<T> | null> => {
    const snapshot = await db.collection(collectionName).doc(id).get();

    if (!snapshot.exists) {
        return null;
    }

    return {
        ...(snapshot.data() as T),
        id: snapshot.id,
    } as FirestoreDocument<T>;
};
// Merr të gjitha dokumentet e një koleksioni
export const getAllDocuments = async <T>(
    collectionName: string
): Promise<FirestoreDocument<T>[]> => {
    const snapshot = await db.collection(collectionName).get();

    return snapshot.docs.map((document) => ({
        ...(document.data() as T),
        id: document.id,
    } as FirestoreDocument<T>));
};

// Përditëson një dokument
export const updateDocument = async <T>(
    collectionName: string,
    id: string,
    data: Partial<T>
) => {
    await db.collection(collectionName).doc(id).update(data);
};

// Fshin një dokument
export const deleteDocument = async (
    collectionName: string,
    id: string
) => {
    await db.collection(collectionName).doc(id).delete();
};

//merr dokumnetet sipas nje fushe te caktuar
export const getDocumentsByField = async <T>(
    collectionName: string,
    field: string,
    value: any
): Promise<FirestoreDocument<T>[]> => {
    const snapshot = await db.collection(collectionName)
        .where(field, "==", value)
        .get();

    return snapshot.docs.map((document) => ({
        ...(document.data() as T),
        id: document.id,
    } as FirestoreDocument<T>));
};
