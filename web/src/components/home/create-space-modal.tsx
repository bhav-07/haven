import { useState } from "react";
import Modal from "../global/modal";
import Button from "../global/button";
import Loader from "../global/loader"; // Import the loader component
import { useApi } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const CreateSpaceModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceName, setSpaceName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { createSpace, isLoading, error: apiError } = useApi();

  const handleCreateSpace = async () => {
    const trimmedSpaceName = spaceName.trim();

    if (!trimmedSpaceName) {
      setError("Space name is required");
      return;
    }

    if (trimmedSpaceName.length > 50) {
      setError("Space name cannot exceed 50 characters");
      return;
    }

    try {
      await createSpace(trimmedSpaceName);
      setSpaceName("");
      setError(null);
      setIsModalOpen(false);
      onSuccess();
      toast.success(`Created space ${trimmedSpaceName}.`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(apiError || "Failed to create space");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);

    setSpaceName(e.target.value);
  };

  return (
    <>
      <Toaster />
      <Button
        variant="light"
        className="bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6] rounded-lg text-black md:px-4 md:py-2 px-2 py-1"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        + Create space
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create a space"
        className="text-neutral-800 space-y-4"
      >
        <p className="text-sm text-neutral-600">
          Enter the name for your space in the below textarea.
        </p>
        <div>
          <input
            value={spaceName}
            onChange={handleInputChange}
            placeholder="Name for your space"
            className={`w-full p-2 focus border-neutral-300 focus:border-neutral-400 transition-colors ease-in-out outline-none bg-transparent border-2 rounded-lg
              ${error ? "border-red-500 text-red-500" : "border-neutral-200"}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-end space-x-4 w-full">
          <Button
            variant="light"
            className="border-neutral-200 border-2"
            onClick={() => {
              setIsModalOpen(false);
              setSpaceName("");
              setError(null);
            }}
            disabled={isLoading}
          >
            Close
          </Button>
          <Button
            variant="dark"
            onClick={handleCreateSpace}
            disabled={!spaceName.trim() || isLoading}
          >
            {isLoading ? <Loader size="small" mode="dark" /> : "Create"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CreateSpaceModal;
