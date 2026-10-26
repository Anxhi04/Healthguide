import { Gender, Role } from "@/enums/enums";

export type LoginResponse = {
  user: User | null;
  token: string;
  profileRequired?: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastname: string;
  dateOfBirth: string;
  email: string;
  password: string;
  gender: Gender;
  phoneNumber: string;
  city: string;
};

export type RegisterResponse = {
  message: string;
  user: User;
};

export type AddUserResponse = {
  message: string;
};

export type User = {
  id: string;
  firstName: string;
  lastname: string;
  dateOfBirth?: string;
  email: string;
  gender?: Gender;
  phoneNumber?: string;
  city?: string;
  role: Role | string;
  status?: string;
};

export type AuthState = {
  profileRequired: boolean;
  initialized: boolean;
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  addUser: (data: RegisterRequest & { role?: string }) => Promise<unknown>;
  createUserByAdmin: (data: RegisterRequest & { role?: string }) => Promise<unknown>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => () => void;
};

export type UsersTable = Omit<User, "role"> & { role: "USER" | "ADMIN" | "HOSPITAL_ADMIN" };

export type BannedWordTable={
  id: string;
  word: string;
}
