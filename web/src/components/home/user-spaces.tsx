/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useApi } from "../../services/api";
import Loading from "../global/loader";
import SpaceModal from "./space-modal";

const UserSpaces = ({
  refresh,
  onDeletion,
}: {
  refresh: boolean;
  onDeletion: () => void;
}) => {
  const [spaces, setSpaces] = useState<any[]>([]);
  const { getUserSpaces, isLoading, error: apiError } = useApi();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await getUserSpaces();
        console.log(response.data);
        setSpaces(response.data); // Assuming response.data contains the spaces
      } catch (error) {
        console.error(apiError || "Error fetching spaces:", error);
      }
    };

    fetchSpaces();
  }, [refresh]);

  return (
    <section className="max-w-7xl w-screen grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 md:my-8 my-4 px-3 md:gap-6 gap-4">
      {isLoading ? (
        <Loading mode="dark" className="mt-12" />
      ) : spaces.length > 0 ? (
        spaces.map((space) => (
          <SpaceModal
            Members={space.Members as any[]}
            ID={space.ID as string}
            Name={space.name as string}
            CreatedBy={space.created_by as string}
            key={space.ID as string}
            CreatedAt={space.CreatedAt as string}
            onDeletion={onDeletion}
          />
        ))
      ) : (
        <p className="text-center text-neutral-300 col-span-full mt-16">
          You are not part of any spaces yet.
          <br />
          Start by creating a space using the buttons on top right.
        </p>
      )}
    </section>
  );
};

export default UserSpaces;
