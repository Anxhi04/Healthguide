import { User } from "../modules/users.model";
import { getUserById } from "./user.services";

// Explicit whitelist; no email, phone, settings, status, or displayId.
export const toPublicUser = (user: User) => ({
    firstName: typeof user.firstName === "string" ? user.firstName : "",
    lastname: typeof user.lastname === "string" ? user.lastname : "",
    ...(user.settings?.privacy?.publicProfile !== false
        ? { id: user.id, ...(typeof user.photoUrl === "string" && user.photoUrl ? { photoUrl: user.photoUrl } : {}) } : {}),
});
export const getPublicUserById = async (id: string) => {
    const user = await getUserById(id);
    if (!user || user.settings?.privacy?.publicProfile === false) return null;
    // Profile-only fields never enter compact post/comment/review author DTOs.
    const phone = typeof user.phoneNumber === "string" ? user.phoneNumber.trim() : "";
    return { ...toPublicUser(user),
        firstName: typeof user.firstName === "string" ? user.firstName : "",
        lastname: typeof user.lastname === "string" ? user.lastname : "",
        ...(user.settings?.privacy?.showPhonePublicly === true && phone ? { phoneNumber: phone } : {}),
    };
};
