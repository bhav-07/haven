import Navbar from "../components/global/navbar";
import JoinSpaceModal from "../components/home/join-space-modal";
import CreateSpaceModal from "../components/home/create-space-modal";
import UserSpaces from "../components/home/user-spaces";

const Home = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Navbar />
      <section className="max-w-7xl w-full flex items-center justify-between md:pt-24 pt-20 px-3">
        <h1 className="md:text-4xl text-2xl">Your spaces</h1>
        <div className="gap-2 flex">
          <JoinSpaceModal />
          <CreateSpaceModal />
        </div>
      </section>
      <UserSpaces />
    </div>
  );
};

export default Home;
