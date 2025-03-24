import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { Toaster } from "react-hot-toast";
import Loading from "../global/loader";
import useWebSocket from "../../hooks/useWebSocket";
import ExcalidrawBoard from "../../pages/WhiteBoard";
import { useAuth } from "../../auth/authContext";
import KanbanBoard from "./KanbanBoard/KanbanBoard";

const PhaserSpace = ({ spaceId }: { spaceId: string }) => {
  const spaceRef = useRef<Phaser.Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { playersRef, ws, localUserId } = useWebSocket(spaceId);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);

  const { user } = useAuth();

  const toggleWhiteboard = () => {
    if (!isKanbanOpen) {
      setIsWhiteboardOpen((prev) => !prev);
    }
  };

  const toggleKanban = () => {
    if (!isWhiteboardOpen) {
      setIsKanbanOpen((prev) => !prev);
    }
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
      onToggleWhiteboardModal: toggleWhiteboard,
      onToggleKanbanModal: toggleKanban,
    });

    setLoading(false);
    return () => {
      ws?.close();
      spaceRef.current?.destroy(true);
      spaceRef.current = null;
    };
  }, [ws]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Toaster />

      {isWhiteboardOpen && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-20">
          <div className="relative w-[95%] h-[95%] bg-white rounded-lg shadow-lg">
            {user && (
              <ExcalidrawBoard
                spaceId={spaceId}
                key={spaceId}
                onClose={() => setIsWhiteboardOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      {isKanbanOpen && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-20">
          <div className="relative w-[95%] h-[95%] rounded-lg bg-white text-neutral-800 shadow-lg">
            {user && <KanbanBoard onClose={() => setIsKanbanOpen(false)} />}
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
