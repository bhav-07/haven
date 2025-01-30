import { useNavigate } from "react-router";
import Logo from "../components/logo/logo-shape";
import Navbar from "../components/logo/global/navbar";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="items-center justify-center text-center flex flex-col max-w-screen">
      <Navbar />
      <section className="flex flex-col items-center justify-center h-svh gap-6 animate-fade-in">
        <h1 className="md:text-[140px] text-5xl md:gap-4 gap-2 font-serif flex flex-row items-center">
          <Logo variant="gradient2" className="md:size-[98px] size-9" />{" "}
          <span className="bg-gradient-to-br from-[#fdfcfb] to-[#eec09b] text-transparent bg-clip-text">
            Haven
          </span>
        </h1>
        <h3 className="md:text-lg text-sm md: -mt-5">
          Haven brings the best of in-person collaboration to distributed teams.
        </h3>
        <button
          className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          onClick={() => navigate("/home")}
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#232526] md:px-6 px-3 py-1 md:text-xl text-sm font-medium text-white backdrop-blur-3xl">
            Get started
          </span>
        </button>
      </section>
    </div>
  );
};

export default Landing;
