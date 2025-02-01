import { useState } from "react";
import Modal from "../global/modal";
import Button from "../global/button";
import Loader from "../global/loader"; // Import the loader component
import { useApi } from "../../services/api";
import { useNavigate } from "react-router";

const CreateSpaceModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceName, setSpaceName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      navigate(0);
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
      <Button
        variant="light"
        className="bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6] rounded-lg text-black px-4 py-2"
        onClick={() => setIsModalOpen(true)}
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
          Enter the name for your space in the below textarea and click create.
        </p>
        <div>
          <input
            value={spaceName}
            onChange={handleInputChange}
            placeholder="Name for your space"
            className={`w-full p-2 focus:border-neutral-400 outline-none bg-transparent border-2 rounded-lg
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
