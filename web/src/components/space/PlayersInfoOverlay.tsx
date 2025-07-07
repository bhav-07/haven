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
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: "#22c55e",
      away: "#facc15",
      meeting: "#3b82f6",
      dnd: "#ef4444",
    };
    return colors[status] || "#9ca3af";
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: size * 1.2, color: getStatusColor(status) };

    switch (status) {
      case "online":
        return <CheckCircle2 {...iconProps} />;
      case "away":
        return <Clock {...iconProps} />;
      case "meeting":
        return <Video {...iconProps} />;
      case "dnd":
        return <MinusCircle {...iconProps} />;
      default:
        return <CheckCircle2 {...iconProps} />;
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
    <div className="fixed inset-0 pointer-events-none z-40">
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
