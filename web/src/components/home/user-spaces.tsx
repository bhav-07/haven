import { useEffect, useState } from "react";
import { useApi } from "../../services/api";
import Loading from "../global/loader";

const UserSpaces = ({ refresh }: { refresh: boolean }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [spaces, setSpaces] = useState<any[]>([]); // adjust the type based on the response shape
  const { getUserSpaces, isLoading, error: apiError } = useApi();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await getUserSpaces();
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
      ) : (
        spaces.map((space) => {
          return (
            <SpaceCard
              ID={space.ID as string}
              Name={space.name as string}
              CreatedBy={space.created_by as string}
            />
          );
        })
      )}
    </section>
  );
};

interface Space {
  ID: string;
  Name: string;
  CreatedBy: string;
  Members?: string[];
}

const SpaceCard = (Space: Space) => {
  return (
    <div
      key={Space.ID}
      className="rounded-xl hover:scale-[1.02] md:transition-all ease-in-out duration-500 text-start md:space-y-2 space-y-1 bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6] text-neutral-800 p-3"
    >
      <img
        src="/space_placeholder.png"
        alt="Space Image"
        className="md:h-60 h-40  w-full object-cover rounded-[10px]"
      ></img>
      <div className="flex items-baseline gap-1">
        <h1 className="text-neutral-500">#{Space.ID}</h1>
        <h1 className="text-2xl text-neutral-700">{Space.Name}</h1>
      </div>
      <h1 className="text-xl">{Space.Members}</h1>
    </div>
  );
};

export default UserSpaces;
