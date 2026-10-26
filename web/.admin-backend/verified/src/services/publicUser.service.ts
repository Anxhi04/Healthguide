import { User } from "../modules/users.model";
import { getUserById } from "./user.services";

// Explicit whitelist; no email, phone, settings, status, or displayId.
export const toPublicUser = (user: User) => ({
    firstName: user.firstName,
    lastname: user.lastname,
    ...(user.settings?.privacy?.publicProfile !== false
        ? { id: user.id, ...(user.photoUrl ? { photoUrl: user.photoUrl } : {}) } : {}),
});
export const getPublicUserById = async (id: string) => {
    const user = await getUserById(id);
    if (!user || user.settings?.privacy?.publicProfile === false) return null;
    return toPublicUser(user);
};
