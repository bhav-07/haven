/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Modal from "../global/modal";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { useApi } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/authContext";

interface Space {
  ID: string;
  Name: string;
  CreatedBy: string;
  Members: any[];
  CreatedAt: string;
  onDeletion: () => void;
}

const SpaceModal = (currSpace: Space) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const date = new Date(currSpace.CreatedAt);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-GB", options);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        key={currSpace.ID}
        className="rounded-xl hover:scale-[1.02] transition-all ease-in-out duration-500 text-start space-y-2 bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6] text-neutral-800 p-3 w-full sm:max-w-[320px]"
      >
        <img
          src="/space_placeholder.png"
          alt="Space Image"
          className="h-40 sm:h-60 w-full object-cover rounded-lg"
        />
        <div className="flex items-baseline gap-1">
          <h1 className="text-neutral-500 text-sm sm:text-base">
            #{currSpace.ID}
          </h1>
          <h1 className="text-lg sm:text-2xl text-neutral-700">
            {currSpace.Name}
          </h1>
        </div>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="text-neutral-800 space-y-4 w-full max-w-2xl px-4 sm:px-6 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-neutral-200 rounded-full sm:px-4 px-2 sm:py-2 py-1 sm:gap-2">
            <h1 className="text-neutral-500 text-lg sm:text-2xl">
              #{currSpace.ID}
            </h1>
            <h1 className="text-lg sm:text-2xl text-neutral-700">
              {currSpace.Name}
            </h1>
          </div>
          <a
            href={`/space/${currSpace.ID}`}
            className="px-3 py-2 rounded-full bg-gradient-to-br from-[#414345] to-[#232526] text-white flex items-center text-sm sm:text-lg group"
          >
            Open
            <ArrowUpRight className="ml-1 group-hover:rotate-45 transition-all duration-300" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-h-[300px]">
          <div className="sm:flex-1 flex flex-col max-h-[300px]">
            <span className="text-neutral-500 font-semibold text-xs sm:text-sm">
              Created: {formattedDate}
            </span>
            <span className="font-bold text-lg">Members</span>
            <div className="max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {currSpace.Members.map((member, index) => (
                <p
                  className="text-sm sm:text-base text-neutral-600 flex items-center gap-1"
                  key={index}
                >
                  {member.nickname.split(" ")[0]}
                  {member.ID === currSpace.CreatedBy && (
                    <span className="text-xs bg-blue-800 text-white rounded-full px-2 py-[2px]">
                      Admin
                    </span>
                  )}
                </p>
              ))}
            </div>
          </div>

          <div className="sm:flex-1">
            <img
              src="/preview_officecozy.png"
              alt="Cozy office map preview"
              className="rounded-lg object-cover h-40 sm:h-full w-full"
            />
          </div>
        </div>

        {Number(currSpace.CreatedBy) === Number(user?.id) && (
          <DeleteSpaceModal
            spaceID={currSpace.ID}
            onDeletion={currSpace.onDeletion}
          />
        )}
      </Modal>
    </>
  );
};

export default SpaceModal;

const DeleteSpaceModal = ({
  spaceID,
  onDeletion,
}: {
  spaceID: string;
  onDeletion: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deleteSpace, isLoading, error } = useApi();

  const handleDelete = async () => {
    try {
      const resp = await deleteSpace(spaceID);
      toast.success(resp.message);
      setIsModalOpen(false);
      onDeletion();
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="flex items-center gap-2 text-red-800 bg-red-100 px-3 py-2 rounded-md hover:bg-red-200 disabled:opacity-50"
      >
        {isLoading ? "Deleting..." : "Delete Space"} <Trash2 size={16} />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="p-2 m-0 bg-white"
      >
        <div className="text-neutral-800 space-y-4 p-2">
          <h2 className="text-xl font-semibold">Confirm Deletion</h2>
          <p>
            Are you sure you want to delete this space?
            <br /> This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-md hover:bg-neutral-300 transition-colors ease-in-out"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </Modal>
    </>
  );
};
