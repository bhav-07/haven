/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useApi } from "../../services/api";
import { Toaster } from "react-hot-toast";
import PhaserSpace from "../../components/space/PhaserSpace";

type Space = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  name: string;
  created_by: number;
  Members: {
    ID: number;
    name: string;
    nickname: string;
  }[];
  map: string;
};

const Space = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  // const [space, setSpace] = useState<Space | null>(null);
  const { getSpace } = useApi();
  const [error, setError] = useState<string | null>(null);
  // const { ws, playersRef, subscribe } = useWebSocket(spaceId!);
  useEffect(() => {
    getSpace(spaceId!)
      .then((response) => {
        // setSpace(response.data);
        console.log("fetch", response);
      })
      .catch((error: any) => {
        console.error("Error fetching spaces:", error);
        if (error.response?.status === 404) {
          navigate("/not-found");
        } else if (error.response?.status === 401) {
          navigate("/unauthorized");
        } else {
          setError("An error occurred. Please try again.");
        }
      });
  }, [spaceId]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Toaster />
      {error ? (
        <h1 className="text-red-200 text-2xl">{error}</h1>
      ) : (
        <PhaserSpace spaceId={spaceId!} />
      )}
    </div>
  );
};

export default Space;
