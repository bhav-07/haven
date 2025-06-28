/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { StatusOptionType, statusStyles, UserStatusType } from "../../types";
import { ChevronDown } from "lucide-react";
import Modal from "./modal";
import Loader from "./loader";
import { useApi } from "../../services/api";

export default function UpdateUserStatusModal({
  currentStatus,
  userStatusOptions,
  onStatusUpdate,
}: {
  currentStatus: UserStatusType;
  userStatusOptions: StatusOptionType[];
  onStatusUpdate?: (newStatus: UserStatusType) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UserStatusType>(
    currentStatus as UserStatusType
  );

  const { updateUserStatus, isLoading, error: apiError } = useApi();
  const [error, setError] = useState<string | null>(null);

  const handleCreateSpace = async () => {
    try {
      await updateUserStatus(selectedStatus);
      setError(null);
      setIsModalOpen(false);
      onStatusUpdate?.(selectedStatus);
      toast.success(
        `Update your status to ${selectedStatus.toLocaleUpperCase()}.`
      );
    } catch (error: any) {
      setError(apiError || error.message || "Failed to update your status");
    }
  };

  const { color, label, Icon } = statusStyles[currentStatus];

  return (
    <>
      <Toaster />
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold border-2 bg-neutral-800 border-green-200 border-transparent ${color}`}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        <ChevronDown className="w-6 h-6" />
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="text-neutral-100 space-y-4 bg-neutral-800"
      >
        <div>
          {isLoading && (
            <div className="absolute inset-0 bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <Loader size="small" mode="light" />
            </div>
          )}
          <div className="flex flex-row items-center justify-start">
            Current Status:
            <span
              className={`flex items-center gap-2 ml-2 py-2 px-3 rounded-full border-none ${color} bg-neutral-700`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium"> {label}</span>
            </span>
          </div>

          <div className="space-y-2 mt-4">
            {userStatusOptions.map((item, index) => {
              const statusStyle = statusStyles[item.value as UserStatusType];
              const StatusIcon = statusStyle?.Icon;

              return (
                <label
                  key={index}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-full border-2 
                  transition-colors transition-border duration-300 ease-in-out
                  ${
                    selectedStatus === item.value
                      ? `${statusStyle?.color} ${statusStyle?.border} bg-neutral-700`
                      : "border-transparent text-neutral-500 hover:border-neutral-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={item.value}
                    checked={selectedStatus === item.value}
                    onChange={() => {
                      setSelectedStatus(item.value as UserStatusType);
                    }}
                    className="sr-only"
                  />
                  {StatusIcon && <StatusIcon className="w-5 h-5" />}
                  <span className="font-medium">{item.label}</span>
                </label>
              );
            })}
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-end space-x-4 w-full  text-lg">
          <button
            className="bg-neutral-700 rounded-full px-4 py-2"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedStatus(currentStatus);
              setError(null);
            }}
          >
            Close
          </button>
          <button
            onClick={() => handleCreateSpace()}
            className="disabled:bg-neutral-400 disabled:cursor-not-allowed text-neutral-800 bg-white hover:bg-neutral-200 rounded-full px-4 py-2 min-w-[180px] h-[40px] flex items-center justify-center"
            disabled={currentStatus == selectedStatus || isLoading}
          >
            Update your status
          </button>
        </div>
      </Modal>
    </>
  );
}
