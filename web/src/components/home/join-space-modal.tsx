/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Modal from "../global/modal";
import Button from "../global/button";
import Loader from "../global/loader";
import { useApi } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const JoinSpaceModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceId, setSpaceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate();

  const { joinSpace, isLoading, error: apiError } = useApi();

  const handleJoinSpace = async () => {
    const trimmedSpaceId = spaceId.trim();

    if (!trimmedSpaceId) {
      setError("Space ID is required");
      return;
    }

    try {
      await joinSpace(trimmedSpaceId);

      setSpaceId("");
      setError(null);
      setIsModalOpen(false);
      onSuccess();
      toast.success(`Joined space #${spaceId}.`);
      // navigate(0);
    } catch (error) {
      setError(apiError || "Failed to join space");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);

    setSpaceId(e.target.value);
  };
  return (
    <>
      <Toaster />
      <Button
        variant="light"
        className="bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6] rounded-lg text-black md:px-4 md:py-2 px-2 py-1"
        onClick={() => setIsModalOpen(true)}
      >
        Join space
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
          setSpaceId("");
        }}
        title="Join a space"
        className="text-neutral-800 space-y-4"
      >
        <p className="text-sm text-neutral-600">
          Enter the space ID in the below textarea and click join.
        </p>
        <div>
          <input
            type="number"
            value={spaceId}
            onChange={handleInputChange}
            placeholder="ID of the space"
            className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full p-2 focus:border-neutral-400 outline-none bg-transparent border-2 rounded-lg
              ${error ? "border-red-500 text-red-500" : "border-neutral-200"}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            variant="light"
            className="border-neutral-200 border-2"
            onClick={() => {
              setIsModalOpen(false);
              setSpaceId("");
              setError(null);
            }}
            disabled={isLoading}
          >
            Close
          </Button>
          <Button
            variant="dark"
            onClick={handleJoinSpace}
            disabled={!spaceId.trim() || isLoading}
          >
            {isLoading ? <Loader size="small" mode="dark" /> : "Join"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default JoinSpaceModal;
