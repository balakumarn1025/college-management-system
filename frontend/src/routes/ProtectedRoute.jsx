import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <Outlet />;
}