import { useEffect, useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { AuthContext } from "./authContext";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("VITE_GOOGLE_CLIENT_ID is not defined");
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8080/auth/check", {
          credentials: "include",
        });
        setIsAuthenticated(response.ok);
        console.log("is authenticated");
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        console.log("not authenticated");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      isLoading,
      setIsLoading,
    }),
    [isAuthenticated, isLoading]
  );

  if (isLoading) {
    console.log("AuthProvider - Still loading");
    return null; // Or a loading spinner
  }

  console.log(
    "AuthProvider - Rendering with isAuthenticated:",
    isAuthenticated
  );

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export default AuthProvider;
