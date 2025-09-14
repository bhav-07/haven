import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { Toaster } from "react-hot-toast";
import Loading from "../global/loader";
import useWebSocket from "../../hooks/useWebSocket";
import ExcalidrawBoard from "../../pages/WhiteBoard";
import { useAuth } from "../../auth/authContext";
import KanbanBoard from "./KanbanBoard/KanbanBoard";
import UserStatus from "../global/user-status";
import { ChatBox } from "./ChatBox";
import PlayerOverlay from "./PlayersInfoOverlay";
import { Home, KanbanSquare, Presentation } from "lucide-react";

const PhaserSpace = ({ spaceId }: { spaceId: string }) => {
  const spaceRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const {
    playersRef,
    ws,
    localUserId,
    isConnected,
    chatHistory,
    sendChatMessage,
  } = useWebSocket(spaceId);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);

  const [cameraData, setCameraData] = useState({ x: 0, y: 0, zoom: 1.5 });

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

  const handleCameraUpdate = (newCameraData: {
    x: number;
    y: number;
    zoom: number;
  }) => {
    setCameraData(newCameraData);
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
      // onToggleWhiteboardModal: toggleWhiteboard,
      // onToggleKanbanModal: toggleKanban,
      onCameraUpdate: handleCameraUpdate,
    });

    setLoading(false);
    return () => {
      // ws?.close();
      spaceRef.current?.destroy(true);
      spaceRef.current = null;
      setLoading(true);
    };
  }, [ws, isConnected]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Toaster />

      {!loading && user && (
        <div className="flex flex-row justify-between absolute top-4 z-10 w-screen px-4">
          <div className="flex flex-row items-center justify-center gap-3">
            <a
              href="/home"
              className="rounded-full cursor-pointer bg-neutral-800 p-3"
            >
              <Home className="size-7" />
            </a>
          </div>
          <div className="flex flex-row items-center justify-center gap-3">
            <UserStatus />
            <ChatBox
              chatHistory={chatHistory}
              onSendMessage={sendChatMessage}
              isConnected={isConnected}
            />
            <button
              className="rounded-full bg-neutral-800 p-3"
              onClick={() => toggleWhiteboard()}
            >
              <Presentation className="size-7" />
            </button>
            <button
              className="rounded-full bg-neutral-800 p-3"
              onClick={() => toggleKanban()}
            >
              <KanbanSquare className="size-7" />
            </button>
          </div>
        </div>
      )}

      {!loading && localUserId && (
        <PlayerOverlay
          players={playersRef.current}
          localUserId={localUserId}
          gameCamera={cameraData}
          gameContainer={gameContainerRef.current || undefined}
        />
      )}

      {isWhiteboardOpen && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
          <div className="relative w-[96%] h-[96%] bg-white rounded-lg shadow-lg">
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
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
          <div className="relative w-[96%] h-[96%] rounded-lg bg-white text-neutral-800 shadow-lg">
            {user && (
              <KanbanBoard
                onClose={() => setIsKanbanOpen(false)}
                spaceId={spaceId}
              />
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center text-white text-2xl font-bold">
          <Loading mode="dark" size="large" />
          <p className="mt-4 font-poppins">Connecting to Space...</p>
        </div>
      )}

      {!loading && (
        <div
          ref={gameContainerRef}
          id="game-container"
          className="w-full h-full"
        />
      )}
    </div>
  );
};

export default PhaserSpace;
