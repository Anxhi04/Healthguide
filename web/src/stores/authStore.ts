import { create } from "zustand";

import {
  login as loginApi,
  register as registerApi,
  createUserByAdmin as createUserByAdminApi,
  loadAuthenticatedSession,
  loginErrorMessage,
} from "@/services/auth/function";

import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import type {
  LoginRequest,
  RegisterRequest,
  AuthState,
} from "@/services/auth/types";

export const useAuthStore = create<AuthState>((set, get) => {
  let sessionVersion = 0;
  const storeSession = (response: Awaited<ReturnType<typeof loginApi>>) => {
    set({ accessToken: response.token, user: response.user, isLoggedIn: !!response.user,
      initialized: true, profileRequired: response.profileRequired === true, error: null });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };
  const clearSession = () => {
    localStorage.removeItem("accessToken"); localStorage.removeItem("user");
    set({ user: null, accessToken: null, isLoggedIn: false, profileRequired: false });
  };
  return ({
  profileRequired: false,
  initialized: false,
  user: null,
  accessToken: null,
  isLoggedIn: false,
  loading: false,
  error: null,

  login: async (data: LoginRequest) => {
    const version = ++sessionVersion;
    set({ loading: true, error: null });
    try {
      const response = await loginApi(data);
      if (version !== sessionVersion || !auth.currentUser || (response.user && response.user.id !== auth.currentUser.uid))
        throw new Error("Your session changed. Please sign in again.");
      storeSession(response);

      return response;
    } catch (err) {
      if (version === sessionVersion) {
        clearSession();
        set({ initialized: true, error: loginErrorMessage(err) });
      }
      throw err;
    } finally {
      if (version === sessionVersion) set({ loading: false });
    }
  },

  register: async (data: RegisterRequest) => {
    const version = ++sessionVersion;
    set({ loading: true, error: null });
    try {
      const completing = get().profileRequired;
      await registerApi(data, completing);
      if (version === sessionVersion && auth.currentUser) {
        const firebaseUser = auth.currentUser;
        const response = await loadAuthenticatedSession(auth.currentUser);
        if (version !== sessionVersion || auth.currentUser !== firebaseUser) throw new Error("Your session changed. Please sign in again.");
        if (!response.user) throw new Error("Your profile could not be loaded after saving. Please try again.");
        storeSession(response);
      } else throw new Error("Your session changed. Please sign in again.");
    } catch (error) {
      if (version === sessionVersion) set({ error: loginErrorMessage(error) });
      throw error;
    } finally {
      if (version === sessionVersion) set({ loading: false });
    }
  },

  addUser: async (data: RegisterRequest) => {
    set({ loading: true, error: null });

    try {
      const response = await registerApi(data);
      return response;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Register failed",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  createUserByAdmin: async (data: RegisterRequest) => {
    set({ loading: true, error: null });
    try{
      const resp = await  createUserByAdminApi(data);
      return resp;
    }catch(error){
      set({
        error: error instanceof Error ? error.message : "Register failed",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    ++sessionVersion;
    clearSession();
    set({ initialized: true, loading: false, error: null });
    await signOut(auth);
  },

  initialize: () => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;
      const version = sessionVersion;
      if (firebaseUser) {
        try {
          const response = await loadAuthenticatedSession(firebaseUser);
          if (!active || version !== sessionVersion || auth.currentUser !== firebaseUser) return;
          storeSession(response);
        } catch (error) {
          if (!active || version !== sessionVersion || auth.currentUser !== firebaseUser) return;
          localStorage.removeItem("accessToken"); localStorage.removeItem("user");
          set({ user: null, accessToken: null, isLoggedIn: false, initialized: true,
            profileRequired: false, error: loginErrorMessage(error) });
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        set({
          user: null,
          accessToken: null,
          isLoggedIn: false,
          initialized: true,
          profileRequired: false,
        });
      }
    });
    return () => { active = false; unsubscribe(); };
  },

  clearError: () => {
    set({ error: null });
  },
  });
});

