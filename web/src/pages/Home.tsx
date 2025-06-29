import Navbar from "../components/global/navbar";
import JoinSpaceModal from "../components/home/join-space-modal";
import CreateSpaceModal from "../components/home/create-space-modal";
import UserSpaces from "../components/home/user-spaces";
import { useState } from "react";
import { useAuth } from "../auth/authContext";
import UserStatus from "../components/global/user-status";

const Home = () => {
  const [refresh, setRefresh] = useState(false);

  const refetchSpaces = () => setRefresh((prev: boolean) => !prev);

  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Navbar />
      <section className="max-w-7xl w-full flex md:flex-row flex-col md:items-center items-start gap-2 justify-between md:pt-24 pt-20 px-3">
        <h1 className="md:text-4xl text-xl">
          Hello {user?.nickname.split(" ")[0]} 👋
        </h1>
        <div className="gap-2 flex md:w-auto">
          <UserStatus />
          <JoinSpaceModal onSuccess={refetchSpaces} />
          <CreateSpaceModal onSuccess={refetchSpaces} />
        </div>
      </section>
      <UserSpaces refresh={refresh} onDeletion={refetchSpaces} />
    </div>
  );
};

export default Home;
