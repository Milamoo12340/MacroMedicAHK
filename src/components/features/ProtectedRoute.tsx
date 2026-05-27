import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/lib/auth";

export default function ProtectedRoute() {
  const user = useCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
