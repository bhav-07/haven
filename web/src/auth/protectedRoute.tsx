import { Navigate, Outlet } from "react-router";
import { useAuth } from "./authContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "isLoading:",
    isLoading
  );

  if (isLoading) {
    console.log("ProtectedRoute - Loading");
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute - Redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  console.log("ProtectedRoute - Rendering protected content");
  return <Outlet />;
};
