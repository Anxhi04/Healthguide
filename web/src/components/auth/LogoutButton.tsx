import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function LogoutButton() {
  const logout = useAuthStore(state => state.logout);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    if (busy) return;
    setBusy(true); setError(false);
    try { await logout(); navigate("/login", { replace: true }); }
    catch { setError(true); }
    finally { setBusy(false); }
  };
  return <div><button type="button" disabled={busy} onClick={() => void handleLogout()}
    className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
    <LogOut className="h-4 w-4" />{busy ? "Logging out…" : "Log out"}
  </button>{error && <p role="alert" className="px-2 text-xs text-red-700">Could not log out. Please try again.</p>}</div>;
}
