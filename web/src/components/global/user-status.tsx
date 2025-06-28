import { useEffect, useState } from "react";
import { useApi } from "../../services/api";
import Loading from "./loader";
import toast, { Toaster } from "react-hot-toast";
import { StatusOptionType, UserStatusType } from "../../types";
import UpdateUserStatusModal from "./update-user-status-modal";

const UserStatus = () => {
  const { getUserStatus, getUserStatusOptions, isLoading, error } = useApi();
  const [userStatus, setUserStatus] = useState<UserStatusType>("online");
  const [userStatusOptions, setUserStatusOptions] = useState<
    StatusOptionType[]
  >([]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await getUserStatus();
        const optionsResponse = await getUserStatusOptions();

        console.log(optionsResponse.data);

        setUserStatusOptions(optionsResponse.data);
        setUserStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    fetchSpaces();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <Toaster />
      {isLoading ? (
        <Loading mode="dark" size="small" className="mt-4" />
      ) : (
        <UpdateUserStatusModal
          currentStatus={userStatus}
          userStatusOptions={userStatusOptions}
          onStatusUpdate={(newStatus) => {
            setUserStatus(newStatus);
          }}
        />
      )}
      {error && toast.error(`Unable to fetch User status: ${error}`)}
    </div>
  );
};

export default UserStatus;
