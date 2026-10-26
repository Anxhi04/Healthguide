import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { User } from '../modules/users.model';
import { getUserById } from './user.services';

export const isProfilePublic = (user: User) => user.settings?.privacy?.publicProfile !== false;

// displayId is the existing public account alias; never serialize the Auth UID.
export const toPublicUser = (user: User) => ({
    firstName: typeof user.firstName === 'string' ? user.firstName : '',
    lastname: typeof user.lastname === 'string' ? user.lastname : '',
    ...(isProfilePublic(user) && typeof user.displayId === 'string' && user.displayId && user.displayId !== user.id ? { id: user.displayId } : {}),
    ...(isProfilePublic(user) && typeof user.photoUrl === 'string' && user.photoUrl ? { photoUrl: user.photoUrl } : {}),
});

export const getProfileUserById = async (id: string): Promise<User | null> => {
    // Accept old bookmarked UID routes while new public links use displayId.
    const direct = await getUserById(id);
    if ((direct as unknown as { deletedAt?: unknown })?.deletedAt) return null;
    if (direct) return { ...direct, id };
    const matches = await db.collection(COLLECTIONS.USERS).where('displayId', '==', id).limit(2).get();
    if (matches.size !== 1 || matches.docs[0].data().deletedAt) return null;
    return { ...matches.docs[0].data(), id: matches.docs[0].id } as User;
};

export const getPublicUserById = async (id: string, viewerUid?: string) => {
    const user = await getProfileUserById(id);
    if (!user) return null;
    const isOwnProfile = viewerUid === user.id;
    const publicProfile = isProfilePublic(user);
    if (isOwnProfile) return { ...user, publicProfile, isOwnProfile: true };
    const identity = toPublicUser(user);
    if (!publicProfile) return { ...identity, publicProfile: false, isOwnProfile: false, message: 'This profile is private.' };
    const phone = typeof user.phoneNumber === 'string' ? user.phoneNumber.trim() : '';
    return { ...identity, publicProfile: true, isOwnProfile: false,
        ...(typeof user.city === 'string' && user.city.trim() ? { city: user.city.trim() } : {}),
        ...(user.settings?.privacy?.showPhonePublicly === true && phone ? { phoneNumber: phone } : {}),
    };
};
