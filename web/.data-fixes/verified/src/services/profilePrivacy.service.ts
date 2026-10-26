import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { Timestamp } from "firebase-admin/firestore";
import { User } from "../modules/users.model";
import { assertAccountCanMutate } from "./accountStatus.service";

export const setPhoneVisibility = async (uid: string, showPhonePublicly: boolean) =>
    db.runTransaction(async transaction => {
        const ref = db.collection(COLLECTIONS.USERS).doc(uid);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) return null;
        const user = snapshot.data() as User;
        assertAccountCanMutate(user);
        // Preserve all existing settings; default legacy profile visibility consistently.
        transaction.update(ref, {
            settings: { ...user.settings, privacy: {
                ...user.settings?.privacy, publicProfile: user.settings?.privacy?.publicProfile ?? true, showPhonePublicly,
            } }, updatedAt: Timestamp.now(),
        });
        return { showPhonePublicly };
    });
