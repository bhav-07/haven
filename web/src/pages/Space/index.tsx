/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../auth/authContext";
import { useApi } from "../../services/api";
import Loading from "../../components/global/loader";
import initializeGame from "./game";
import Phaser from "phaser";

const Space = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const spaceRef = useRef<Phaser.Game | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [space, setSpace] = useState<any | undefined>();
  const { getSpace, isLoading } = useApi();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const fetchSpaces = async () => {
      try {
        setError(null);
        const response = await getSpace(spaceId as string);
        console.log(response.data);

        if (!response.data) {
          throw new Error("No space data found");
        }

        setSpace(response.data);
      } catch (error: any) {
        console.error("Error fetching spaces:", error);

        if (error.response) {
          if (error.response.status === 404) {
            setError("Space not found.");
            navigate("/not-found");
          } else if (error.response.status === 401) {
            setError("Unauthorized. Please sign in again.");
            navigate("/unauthorized");
          } else {
            setError("An error occurred. Please try again.");
          }
        } else if (error.request) {
          setError("Network error. Please check your internet connection.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    };

    fetchSpaces();
  }, [isLoading, getSpace, spaceId, navigate]);

  useEffect(() => {
    if (spaceRef.current || isLoading || error) return;

    if (gameContainerRef.current && space) {
      spaceRef.current = initializeGame(gameContainerRef.current);

      return () => {
        spaceRef.current?.destroy(true);
        spaceRef.current = null;
      };
    }
  }, [space, isLoading, error]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {isLoading && <Loading mode="dark" size="large" className="h-full" />}
      {error && (
        <h1 className="text-red-200 text-2xl font-semibold h-full">{error}</h1>
      )}
      {!isLoading && !error && (
        <div
          id="game-container"
          ref={gameContainerRef}
          className="w-full h-full"
        />
      )}
    </div>
  );
};

export default Space;
