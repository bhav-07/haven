import React, { useEffect, useRef, useState } from "react";
import { Sprite } from "./entities/Sprite";
import { Boundary } from "./entities/Boundary";
import { Keys } from "./types/space.types";
import { FPS, OFFSET } from "./constants/game.constants";
import { handleMovement } from "./utils/movement";
import toast, { Toaster } from "react-hot-toast";
import { handleSpaceWebSocket } from "./utils/websocket";
import { initializeGameAssets } from "./utils/assets";
import { useParams } from "react-router";
import { useApi } from "../../services/api";
import Loading from "../../components/global/loader";

const Game: React.FC = () => {
  const { spaceId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [space, setSpace] = useState<any>();
  const [isGameReady, setIsGameReady] = useState(false); // New state variable
  const { getSpace, isLoading } = useApi();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await getSpace(spaceId as string);
        setSpace(response.data);
        toast.success("Fetched"); // ✅ Runs only after a successful fetch
      } catch (error) {
        console.error("Error fetching spaces:", error);
      }
    };

    fetchSpaces();
  }, [getSpace, spaceId]); // ✅ No infinite loop now

  // Canvas and animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  // Game entity refs
  const playerRef = useRef<Sprite | null>(null);
  const mapRef = useRef<Sprite | null>(null);
  const boundariesRef = useRef<Boundary[]>([]);
  const movablesRef = useRef<(Sprite | Boundary)[]>([]);

  // Input state tracking
  const keysRef = useRef<Keys>({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
  });

  const setupCanvas = (canvas: HTMLCanvasElement) => {
    canvas.width = 1920;
    canvas.height = 1920;
  };

  const animate = (ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const map = mapRef.current;
    const boundaries = boundariesRef.current;
    const movables = movablesRef.current;

    if (!ctx || !player || !map) return;

    // Track time between frames
    let lastFrameTime = 0;
    const frameTime = 1000 / FPS; // 30 FPS (33.33 ms per frame)

    function animationLoop(currentTime: number) {
      animationFrameId.current = requestAnimationFrame(animationLoop);

      if (currentTime - lastFrameTime < frameTime) return;

      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      map?.draw(ctx);
      boundaries.forEach((boundary) => boundary.draw(ctx));
      player?.draw(ctx);

      if (player?.moving && map) {
        const position = {
          x: map.position.x - OFFSET.x,
          y: map.position.y - OFFSET.y,
        };

        if (player.moving && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "position_update",
              position: position,
            })
          );
        }
      }

      if (player) {
        let isMoving = false;

        if (keysRef.current.w.pressed) {
          handleMovement("up", player, boundaries, movables);
          isMoving = true;
        } else if (keysRef.current.s.pressed) {
          handleMovement("down", player, boundaries, movables);
          isMoving = true;
        } else if (keysRef.current.a.pressed) {
          handleMovement("left", player, boundaries, movables);
          isMoving = true;
        } else if (keysRef.current.d.pressed) {
          handleMovement("right", player, boundaries, movables);
          isMoving = true;
        }

        player.moving = isMoving;
      }
    }

    animationFrameId.current = requestAnimationFrame(animationLoop);
  };

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (space) {
      handleSpaceWebSocket(wsRef, space.ID as string);
    }
  }, [space]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setupCanvas(canvas);
    (async () => {
      await initializeGameAssets(
        canvas,
        boundariesRef,
        movablesRef,
        mapRef,
        playerRef
      );
      setIsGameReady(true); // Set the game as ready to animate
    })();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [space]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isGameReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (playerRef.current && mapRef.current) {
      animate(ctx);
    }
  }, [isGameReady]); // Start animation only when the game is ready

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "a":
        case "s":
        case "d":
          keysRef.current[e.key].pressed = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "a":
        case "s":
        case "d":
          keysRef.current[e.key].pressed = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [space]);

  return (
    <>
      <Toaster />
      {isLoading ? (
        <div className="h-svh w-screen items-center justify-center flex">
          <Loading mode="dark" size="large" />
        </div>
      ) : (
        <canvas ref={canvasRef} className="m-0 overflow-hidden" />
      )}
    </>
  );
};

export default Game;
