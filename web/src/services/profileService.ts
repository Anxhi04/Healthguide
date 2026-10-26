import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";
import type { User } from "@/services/auth/types";
import { Gender } from "@/enums/enums";
import { toDate, toDateInputValue } from "@/lib/date";

export interface CurrentProfile extends User {
  publicProfile: boolean;
  photoUrl?: string;
  createdAt?: string | { _seconds?: number; seconds?: number };
}
export interface PublicProfile { publicProfile: boolean; firstName: string; lastname: string; photoUrl?: string; }
export type ProfileUpdate = Pick<User, "firstName" | "lastname"> & Partial<Pick<User, "phoneNumber" | "dateOfBirth" | "gender" | "city">>;
export const mapCurrentProfile = (data: Record<string, unknown>): CurrentProfile => ({
  publicProfile: (data.settings as { privacy?: { publicProfile?: boolean } } | undefined)?.privacy?.publicProfile !== false,
  id: typeof data.id === "string" ? data.id : "",
  firstName: typeof data.firstName === "string" ? data.firstName : "User",
  lastname: typeof data.lastname === "string" ? data.lastname : "",
  email: typeof data.email === "string" ? data.email : "",
  role: typeof data.role === "string" ? data.role : "",
  ...(typeof data.status === "string" ? { status: data.status } : {}),
  ...(typeof data.phoneNumber === "string" ? { phoneNumber: data.phoneNumber } : {}),
  ...(typeof data.city === "string" ? { city: data.city } : {}),
  ...(Object.values(Gender).includes(data.gender as Gender) ? { gender: data.gender as Gender } : {}),
  ...(typeof data.photoUrl === "string" ? { photoUrl: data.photoUrl } : {}),
  ...(toDateInputValue(data.dateOfBirth) ? { dateOfBirth: toDateInputValue(data.dateOfBirth) } : {}),
  ...(toDate(data.createdAt) ? { createdAt: toDate(data.createdAt)!.toISOString() } : {}),
});
export const ProfileService = {
  async getPublic(id: string, signal?: AbortSignal): Promise<PublicProfile> {
    const { data } = await api.get(endpoints.USERS.PUBLIC(id), { signal });
    return { publicProfile: data.publicProfile !== false, firstName: data.firstName, lastname: data.lastname, ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}) };
  },
  async getMe(signal?: AbortSignal, token?: string): Promise<CurrentProfile> {
    return mapCurrentProfile((await api.get(endpoints.USERS.ME, { signal, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) })).data);
  },
  async setProfileVisibility(publicProfile: boolean): Promise<{ publicProfile: boolean }> {
    return (await api.put("/users/me/privacy", { publicProfile })).data;
  },
  async updateProfile(id: string, data: ProfileUpdate): Promise<void> { await api.put(endpoints.USERS.UPDATE(id), data); },
  async uploadPhoto(file: File): Promise<void> { await api.put(endpoints.USERS.PHOTO, file, { headers: { "Content-Type": file.type, "X-Photo-Filename": encodeURIComponent(file.name) }, transformRequest: [data => data] }); },
  async removePhoto(): Promise<void> { await api.delete(endpoints.USERS.PHOTO); },
};
