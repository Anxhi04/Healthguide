import { Navigate } from "react-router-dom";

export default function BannedWordsPage() {
  return <Navigate to="/unauthorized" replace />;
}
