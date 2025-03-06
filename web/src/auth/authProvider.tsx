import { useEffect, useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { AuthContext } from "./authContext";

type UserResponse = {
  status: "success" | "error";
  user: {
    email: string;
    exp: number;
    id: number;
    iss: string;
    name: string;
    nickname: string;
  };
};

export type User = UserResponse["user"];

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("VITE_GOOGLE_CLIENT_ID is not defined");
  }

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthLoading(true);
        const response = await axios.get(`${API_BASE_URL}/auth/me`);
        const data: UserResponse = await response.data;
        if (data.status === "success") {
          setIsAuthenticated(true);
          setUser(data.user);
          if (data.user.exp < Date.now() / 1000) {
            throw new Error("Token expired");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      isAuthLoading: isAuthLoading,
      setIsAuthLoading: setIsAuthLoading,
      user,
    }),
    [isAuthenticated, isAuthLoading, user]
  );

  if (isAuthLoading) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export default AuthProvider;
