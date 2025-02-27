/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Modal from "../global/modal";
import { ArrowUpRight } from "lucide-react";

interface Space {
  ID: string;
  Name: string;
  CreatedBy: string;
  Members: any[];
}

const SpaceModal = (currSpace: Space) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => {
          setIsModalOpen(true);
        }}
        key={currSpace.ID}
        className="rounded-xl hover:scale-[1.02] md:transition-all ease-in-out duration-500 text-start md:space-y-2 space-y-1 bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6] text-neutral-800 p-3"
      >
        <img
          src="/space_placeholder.png"
          alt="Space Image"
          className="md:h-60 h-40  w-full object-cover rounded-[10px]"
        />
        <div className="flex items-baseline gap-1">
          <h1 className="text-neutral-500">#{currSpace.ID}</h1>
          <h1 className="text-2xl text-neutral-700">{currSpace.Name}</h1>
        </div>
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        className="text-neutral-800 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <h1 className="text-neutral-500 md:text-xl text-sm">
              #{currSpace.ID}
            </h1>
            <h1 className="md:text-3xl text-xl text-neutral-700">
              {currSpace.Name}
            </h1>
          </div>
          <a
            href={`/space/${currSpace.ID}`}
            className="px-[10px] py-[6px] rounded-full bg-gradient-to-br from-[#414345] to-[#232526] text-white items-center justify-center flex text-lg group"
          >
            Open{" "}
            <ArrowUpRight className="group-hover:rotate-45 transition-all ease-in-out duration-300" />
          </a>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-lg">Members</span>
          {currSpace.Members.map((member, index) => {
            return (
              <p
                className="text-base text-neutral-600 flex items-center justify-start gap-1"
                key={index}
              >
                {member.name}
                {member.ID === currSpace.CreatedBy && (
                  <span className="text-sm bg-blue-800 text-white rounded-full px-2 py-[2px]">
                    Admin
                  </span>
                )}
              </p>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default SpaceModal;
