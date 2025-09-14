import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, MinusCircle, Video } from "lucide-react";
import { Player } from "../../hooks/useWebSocket";

interface PlayerOverlayProps {
  players: Record<string, Player>;
  localUserId: string;
  gameCamera?: {
    x: number;
    y: number;
    zoom: number;
  };
  gameContainer?: HTMLElement;
}

interface StatusIndicatorProps {
  status: string;
  size?: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 12,
}) => {
  const getStatusIcon = (status: string) => {
    const iconProps = { size: size * 1.2 };

    switch (status) {
      case "online":
        return <CheckCircle2 {...iconProps} className="text-green-300" />;
      case "away":
        return <Clock {...iconProps} className="text-yellow-300" />;
      case "meeting":
        return <Video {...iconProps} className="text-blue-300" />;
      case "dnd":
        return <MinusCircle {...iconProps} className="text-red-300" />;
      default:
        return <CheckCircle2 {...iconProps} className="text-green-300" />;
    }
  };

  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
      }}
    >
      {getStatusIcon(status)}
    </div>
  );
};

const PlayerOverlay: React.FC<PlayerOverlayProps> = ({
  players,
  localUserId,
  gameCamera = { x: 0, y: 0, zoom: 1.5 },
  gameContainer,
}) => {
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateContainerRect = () => {
      if (gameContainer) {
        setContainerRect(gameContainer.getBoundingClientRect());
      } else {
        const container = document.getElementById("game-container");
        if (container) {
          setContainerRect(container.getBoundingClientRect());
        }
      }
    };

    updateContainerRect();
    window.addEventListener("resize", updateContainerRect);

    return () => window.removeEventListener("resize", updateContainerRect);
  }, [gameContainer]);

  if (!containerRect) return null;

  const worldToScreen = (worldX: number, worldY: number) => {
    const screenX =
      (worldX - gameCamera.x) * gameCamera.zoom + containerRect.width / 2;
    const screenY =
      (worldY - gameCamera.y) * gameCamera.zoom + containerRect.height / 2;

    return {
      x: screenX + containerRect.left,
      y: screenY + containerRect.top,
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {Object.entries(players).map(([playerId, player]) => {
        if (playerId === localUserId) return null;

        const screenPos = worldToScreen(player.position.x, player.position.y);

        const isVisible =
          screenPos.x >= containerRect.left - 100 &&
          screenPos.x <= containerRect.right + 100 &&
          screenPos.y >= containerRect.top - 100 &&
          screenPos.y <= containerRect.bottom + 100;

        if (!isVisible) return null;

        return (
          <div
            key={playerId}
            className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{
              left: screenPos.x,
              top: screenPos.y - 30,
            }}
          >
            <div className="flex items-center gap-2 px-2 py-1 bg-black bg-opacity-60 rounded-md text-white text-sm whitespace-nowrap">
              <StatusIndicator status={player.status} size={18} />
              <span className="font-medium text-base">{player.nickname}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerOverlay;
