import { Navigate, Outlet } from "react-router";
import { useAuth } from "./authContext";
import Loading from "../components/global/loader";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex w-screen h-svh justify-center items-center">
        <Loading mode="dark" size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};
