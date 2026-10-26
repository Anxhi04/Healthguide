import { resolve } from "node:path";

// Stable across ts-node, compiled dist and different working directories.
export const PROFILE_PHOTO_DIRECTORY = resolve(__dirname, "../../uploads/profile-photos");
export const PROFILE_PHOTO_URL_PREFIX = "/uploads/profile-photos/";
export const COMMUNITY_IMAGE_DIRECTORY = resolve(__dirname, "../../uploads/community-images");
export const COMMUNITY_IMAGE_URL_PREFIX = "/uploads/community-images/";
