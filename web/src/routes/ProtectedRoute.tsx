import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

type Props = {
  children: ReactNode;
  role?: string;
};

export default function ProtectedRoute({ children, role }: Props) {
  const { user, accessToken, initialized, profileRequired } = useAuthStore();

  if (!initialized) return <p role="status" className="p-6 text-slate-600">Loading session…</p>;

  if (profileRequired) return <Navigate to="/register?completeProfile=true" replace />;

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
