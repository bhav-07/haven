import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { Toaster } from "react-hot-toast";
import Loading from "../global/loader";
import useWebSocket from "../../hooks/useWebSocket";

const PhaserSpace = ({ spaceId }: { spaceId: string }) => {
  const spaceRef = useRef<Phaser.Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { playersRef, ws, localUserId } = useWebSocket(spaceId);

  useEffect(() => {
    if (spaceRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: { debug: true, width: 1920, height: 1920 },
      },
      scene: [MainScene],
    };

    spaceRef.current = new Phaser.Game(config);
    spaceRef.current.scene.start("MainScene", { ws, playersRef, localUserId });

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
