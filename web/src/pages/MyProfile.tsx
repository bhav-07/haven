import Navbar from "../components/global/navbar";
import { useAuth } from "../auth/authContext";

const MyProfile = () => {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Navbar />
      <main className="max-w-7xl w-full flex flex-col items-center gap-2 justify-between md:pt-24 pt-20 px-3">
        <section className="w-full flex">
          <div className="flex-1 w-full items-center justify-center flex">
            <img src="/character.png" className="w-28" />
          </div>
          <div className="flex-1 flex flex-col">
            <h1>Email: {user?.email}</h1>
            <h1>Username: {user?.name}</h1>
            <h1>Nickname: {user?.nickname}</h1>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyProfile;
