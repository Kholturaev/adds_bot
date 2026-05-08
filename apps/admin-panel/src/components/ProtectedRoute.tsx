import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { credentials } = useAuth();
  if (!credentials) return <Navigate to="/login" replace />;
  return <Outlet />;
}
