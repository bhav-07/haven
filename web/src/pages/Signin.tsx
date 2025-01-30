import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../auth/authContext";
import { useEffect } from "react";

// TODO: add redirect url feature using useSearchParams
const Signin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setIsAuthenticated, isAuthenticated } = useAuth();
  const redirectUrl = searchParams.get("redirect") || "/home";
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  if (isAuthenticated) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleLogin = useGoogleLogin({
    onSuccess: async (codeResp) => {
      console.log("CodeRespo: ", codeResp);
      try {
        const tokenResp = await fetch(
          `http://localhost:8080/auth/google/callback?code=${codeResp.code}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (tokenResp.ok) {
          setIsAuthenticated(true);
          navigate("/home");
        } else {
          console.error("Authentication failed:", await tokenResp.text());
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        setIsAuthenticated(false);
      }
    },
    flow: "auth-code",
  });

  return (
    <main className="h-svh flex flex-row">
      <section className="flex-1 flex flex-col items-center justify-center md:space-y-4 space-y-2">
        <h1 className="md:text-4xl text-2xl">
          Welcome to <span className="font-serif font-extrabold">Haven</span>
        </h1>
        <h3 className="md:text-base text-sm">Signin to get Started</h3>
        <button
          onClick={() => handleLogin()}
          className="bg-white md:p-4 p-3 rounded-full font-semibold drop-shadow-xl text-neutral-800 flex gap-2 items-center justify-center hover:scale-105 transition-all ease-in-out"
        >
          <img
            src="https://www.svgrepo.com/show/380993/google-logo-search-new.svg"
            className="h-8"
          ></img>
          Continue With Google
        </button>
      </section>
    </main>
  );
};

export default Signin;
