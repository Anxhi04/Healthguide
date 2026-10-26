import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
} from "firebase/auth";

import { endpoints } from "@/endpoints/endpoints";
import { auth } from "@/firebase/firebase";
import api from "@/lib/axios";
import { ProfileService } from "@/services/profileService";
import axios from "axios";
import type { User as FirebaseUser } from "firebase/auth";
import type { LoginRequest,LoginResponse,RegisterRequest } from "./types";

const profileRequests = new WeakMap<Pick<FirebaseUser, "uid" | "getIdToken">, Promise<LoginResponse>>();
let profileCreation: Promise<void> | null = null;
export const loadAuthenticatedSession = (firebaseUser: Pick<FirebaseUser, "uid" | "getIdToken">): Promise<LoginResponse> => {
  const existing = profileRequests.get(firebaseUser);
  if (existing) return existing;
  const request = (async () => {
    if (profileCreation) await profileCreation;
    const token = await firebaseUser.getIdToken();
    try {
      const user = await ProfileService.getMe(undefined, token);
      if (user.id !== firebaseUser.uid) throw new Error("The server returned a profile for a different account.");
      return { user, token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404 && error.response.data?.code === "PROFILE_NOT_FOUND")
        return { user: null, token, profileRequired: true };
      throw error;
    }
  })().finally(() => profileRequests.delete(firebaseUser));
  profileRequests.set(firebaseUser, request);
  return request;
};

export const loginErrorMessage = (error: unknown): string => {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(String(code))) return "Email or password is incorrect.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/too-many-requests") return "Too many sign-in attempts. Please try again later.";
  if (code === "auth/network-request-failed") return "Could not connect to Firebase. Please try again.";
  if (axios.isAxiosError(error)) {
    if (!error.response || error.response.status === 503) return "Could not connect to the profile server. Please try again.";
    if (error.response.status >= 500) return "You signed in, but the server could not load your profile. Please try again.";
    if (error.response.status === 401) return "Your session expired. Please sign in again.";
    if (typeof error.response.data?.message === "string") return error.response.data.message;
  }
  return error instanceof Error ? error.message : "Could not sign in. Please try again.";
};

export const register = async (data: RegisterRequest, completeProfile = false) => {
  if (profileCreation) throw new Error("Registration is already in progress.");
  let finishCreation!: () => void;
  profileCreation = new Promise<void>(resolve => { finishCreation = resolve; });
  try {
    const firebaseUser = completeProfile
      ? auth.currentUser
      : (await createUserWithEmailAndPassword(auth, data.email, data.password)).user;
    if (!firebaseUser) throw new Error("Sign in before completing your profile.");
    const token = await firebaseUser.getIdToken();
    const response = await api.post(endpoints.USERS.CREATE, {
      firstName: data.firstName,
      lastname: data.lastname,
      email: firebaseUser.email ?? data.email,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      city: data.city,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } finally {
    profileCreation = null;
    finishCreation();
  }
};

export const createUserByAdmin = async (data: RegisterRequest & { role?: string }) => {
  const response = await api.post(
    endpoints.USERS.CREATE_USER_BY_ADMIN,
    {
      firstName: data.firstName,
      lastname: data.lastname,
      password:data.password,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      city: data.city,
      role:data.role,
    }
  );
  return response.data;
}


export const updateUser = async (id: string, data: Partial<RegisterRequest & { role?: string }>) => {
  const response = await api.put(endpoints.USERS.ADMIN_UPDATE(String(id)), {
    firstName: data.firstName,
    lastname: data.lastname,
    email: data.email,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    phoneNumber: data.phoneNumber,
    city: data.city,
    role: data.role,
  });

  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(endpoints.USERS.ADMIN_DELETE(String(id)));
  return response.data;
};

export const login = async (data: LoginRequest) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    return await loadAuthenticatedSession(userCredential.user);
};
