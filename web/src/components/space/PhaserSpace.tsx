/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { Toaster } from "react-hot-toast";
import Loading from "../global/loader";
import useWebSocket from "../../hooks/useWebSocket";
import ExcalidrawBoard from "../../pages/WhiteBoard";
import { useAuth } from "../../auth/authContext";

const PhaserSpace = ({ spaceId }: { spaceId: string }) => {
  const spaceRef = useRef<Phaser.Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { playersRef, ws, localUserId } = useWebSocket(spaceId);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  const { user } = useAuth();

  const handleShowWhiteboardModal = () => {
    setIsWhiteboardOpen(true);
  };

  const handleCloseWhiteboardModal = () => {
    setIsWhiteboardOpen(false);
  };

  useEffect(() => {
    if (spaceRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: { debug: false, width: 1920, height: 1920 },
      },
      scene: [MainScene],
    };

    spaceRef.current = new Phaser.Game(config);
    spaceRef.current.scene.start("MainScene", {
      ws,
      playersRef,
      localUserId,
      onShowWhiteboardModal: handleShowWhiteboardModal,
    });

    setLoading(false);
    return () => {
      ws?.close();
      spaceRef.current?.destroy(true);
      spaceRef.current = null;
    };
  }, [ws]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Toaster />

      {isWhiteboardOpen && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative w-[95%] h-[90%] bg-white rounded-lg shadow-lg">
            <button
              onClick={handleCloseWhiteboardModal}
              className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-2 rounded"
            >
              Close
            </button>
            {user && <ExcalidrawBoard spaceId={spaceId} key={spaceId} />}
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center text-white text-2xl font-bold">
          <Loading mode="dark" size="large" />
          <p className="mt-4 font-poppins">Connecting to Space...</p>
        </div>
      )}

      {!loading && <div id="game-container" className="w-full h-full" />}
    </div>
  );
};

export default PhaserSpace;
