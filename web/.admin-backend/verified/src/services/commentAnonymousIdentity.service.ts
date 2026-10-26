import { db } from "../config/firebase";

// Backend-only metadata. Never return these documents or their paths to clients.
const IDENTITIES_COLLECTION = "commentAnonymousIdentities";
export const getAnonymousNumber = async (postId: string, userId: string): Promise<number> => {
    const counterRef = db.collection(IDENTITIES_COLLECTION).doc(postId);
    const authorRef = counterRef.collection("authors").doc(userId);
    return db.runTransaction(async transaction => {
        const author = await transaction.get(authorRef);
        if (author.exists) return author.data()!.number as number;
        const counter = await transaction.get(counterRef);
        const number = (counter.data()?.lastNumber ?? 0) + 1;
        transaction.set(counterRef, { lastNumber: number });
        transaction.set(authorRef, { number });
        return number;
    });
};
