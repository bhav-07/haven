import React, { useEffect, useRef } from "react";
import { Sprite } from "./entities/Sprite";
import { Boundary } from "./entities/Boundary";
import { Keys } from "./types/space.types";
import { FPS, MAP_TILES, OFFSET } from "./constants/game.constants";
import { collisions } from "./constants/collisionsObject";
import { handleMovement } from "./utils/movement";

/**
 * Game Component
 *
 * This component manages the main game loop, rendering, and user input handling.
 * It uses a canvas element to render the game world and maintains game state
 * through various refs to avoid unnecessary re-renders.
 */
const Game: React.FC = () => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only create the connection if it doesn't exist
    if (!wsRef.current) {
      wsRef.current = new WebSocket("ws://localhost:8080/space/ws/1");

      wsRef.current.onopen = () => {
        console.log("Connected to game server");
      };

      wsRef.current.onclose = (e) => {
        console.log("Connection closed:", e.reason);
        // Implement reconnection logic if needed
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);
      };
    }

    // Cleanup WebSocket connection on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);
  // Canvas and animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  // Game entity refs
  const playerRef = useRef<Sprite | null>(null);
  const mapRef = useRef<Sprite | null>(null);
  const boundariesRef = useRef<Boundary[]>([]);
  const movablesRef = useRef<(Sprite | Boundary)[]>([]);

  // Input state tracking
  const keys: Keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
  };

  /**
   * Sets up the game canvas with proper dimensions based on screen size
   * and maintaining aspect ratio.
   */
  const setupCanvas = (canvas: HTMLCanvasElement) => {
    // const aspectRatio = 16 / 9;
    // const canvasWidth = SCREEN.width;
    // const canvasHeight = SCREEN.height;
    // Adjust dimensions if height exceeds screen height
    // if (canvasHeight > SCREEN.height) {
    // canvasHeight = SCREEN.height;
    // canvasWidth = SCREEN.width * aspectRatio;
    // }
    canvas.width = 1920;
    canvas.height = 1920;
  };

  /**
   * Creates and initializes all game assets including the player sprite,
   * map, and collision boundaries.
   */
  const initializeGameAssets = (canvas: HTMLCanvasElement) => {
    // Load and create sprite images
    const images = {
      map: createImage("/officecozy.png"),
      playerDown: createImage("/playerDown.png"),
      playerUp: createImage("/playerUp.png"),
      playerLeft: createImage("/playerLeft.png"),
      playerRight: createImage("/playerRight.png"),
    };

    // Initialize player sprite at center of screen
    playerRef.current = new Sprite({
      position: {
        x: canvas.width / 2 - 240 / 8,
        y: canvas.height / 2 - 102 / 2,
      },
      velocity: { x: 0, y: 0 },
      image: images.playerDown,
      frames: { max: 4 },
      sprites: {
        up: images.playerUp,
        down: images.playerDown,
        left: images.playerLeft,
        right: images.playerRight,
      },
    });

    // Initialize map sprite
    mapRef.current = new Sprite({
      position: { x: OFFSET.x, y: OFFSET.y },
      velocity: { x: 0, y: 0 },
      image: images.map,
    });

    // Create collision boundaries from collision map data
    initializeCollisionBoundaries();
  };

  /**
   * Helper function to create and return a new Image object
   */
  const createImage = (src: string): HTMLImageElement => {
    const img = new Image();
    img.src = src;
    return img;
  };

  /**
   * Processes the collision map data and creates boundary objects
   * for collision detection
   */
  const initializeCollisionBoundaries = () => {
    const boundaries: Boundary[] = [];
    const collisionsMap: number[][] = [];

    // Split collision data into rows
    for (let i = 0; i < collisions.length; i += MAP_TILES) {
      collisionsMap.push(collisions.slice(i, MAP_TILES + i));
    }

    // Create boundary objects for collision tiles
    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 107127 || symbol === 107128) {
          boundaries.push(
            new Boundary({
              x: j * Boundary.SIZE + OFFSET.x,
              y: i * Boundary.SIZE + OFFSET.y,
            })
          );
        }
      });
    });

    boundariesRef.current = boundaries;
    movablesRef.current = [mapRef.current!, ...boundaries];
  };

  /**
   * Main game animation loop
   */
  const animate = (ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const map = mapRef.current;
    const boundaries = boundariesRef.current;
    const movables = movablesRef.current;

    if (!ctx || !player || !map) return;

    // Request next frame first to ensure smooth animation
    setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(() => animate(ctx));
    }, 1000 / FPS);

    if (player.moving) {
      const position = {
        x: map.position.x - OFFSET.x,
        y: map.position.y - OFFSET.y,
      };

      wsRef.current?.send(
        JSON.stringify({
          type: "position_update",
          position: position,
        })
      );
    }

    // Clear canvas and draw game elements
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    map.draw(ctx);
    boundaries.forEach((boundary) => boundary.draw(ctx));
    player.draw(ctx);

    // Reset player movement state
    player.moving = false;

    // Handle movement based on pressed keys
    if (keys.w.pressed) {
      handleMovement("up", player, boundaries, movables);
    } else if (keys.s.pressed) {
      handleMovement("down", player, boundaries, movables);
    } else if (keys.a.pressed) {
      handleMovement("left", player, boundaries, movables);
    } else if (keys.d.pressed) {
      handleMovement("right", player, boundaries, movables);
    }
  };

  // Initialize game on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas and initialize game
    setupCanvas(canvas);
    initializeGameAssets(canvas);

    // Start animation loop
    animate(ctx);

    // Cleanup animation on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "a":
        case "s":
        case "d":
          keys[e.key].pressed = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "a":
        case "s":
        case "d":
          keys[e.key].pressed = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    // <div className=" bg-gray-900">
    <canvas ref={canvasRef} className="m-0" />
    // </div>
  );
};

export default Game;
