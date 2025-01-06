import React, { useEffect, useRef } from "react";
import { collisions } from "./collisions";

// Types
type Direction = "up" | "down" | "left" | "right";
type Sprites = Record<Direction, HTMLImageElement>;

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Frames {
  max: number;
  val: number;
  elapsed: number;
}

interface Key {
  pressed: boolean;
}

interface Keys {
  w: Key;
  a: Key;
  s: Key;
  d: Key;
}

// interface GameState {
//   lastKey: string;
//   keys: Keys;
// }

interface SpriteProps {
  position: Position;
  velocity: Velocity;
  image: HTMLImageElement;
  frames?: { max: number };
  sprites?: Sprites;
}

// Constants
const MAP_TILES = 120;
// const CANVAS_WIDTH = 1024;
// const CANVAS_HEIGHT = 576;
const BOUNDARY_SIZE = 48;
const MOVEMENT_SPEED = 3;
const OFFSET = {
  x: -1900,
  y: -2700,
};
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

class Boundary {
  position: Position;
  width: number;
  height: number;
  static readonly SIZE = BOUNDARY_SIZE;

  constructor({ x, y }: { x: number; y: number }) {
    this.position = { x, y };
    this.width = BOUNDARY_SIZE;
    this.height = BOUNDARY_SIZE;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgba(255,0,0,0)";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Sprite {
  position: Position;
  velocity: Velocity;
  image: HTMLImageElement;
  frames: Frames;
  width: number;
  height: number;
  moving: boolean;
  sprites?: Sprites;

  constructor({
    position,
    velocity,
    image,
    frames = { max: 1 },
    sprites,
  }: SpriteProps) {
    this.position = position;
    this.velocity = velocity;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = 0;
    this.height = 0;
    this.moving = false;
    this.sprites = sprites;

    if (image) {
      image.onload = () => {
        this.width = image.width / frames.max;
        this.height = image.height;
      };
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.image) return;

    ctx.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    );

    if (!this.moving) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.frames.elapsed % 15 === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const playerRef = useRef<Sprite | null>(null);
  const mapRef = useRef<Sprite | null>(null);
  const boundariesRef = useRef<Boundary[]>([]);
  const movablesRef = useRef<(Sprite | Boundary)[]>([]);

  // Track key states directly
  const keys: Keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
  };

  //   const [lastKey, setLastKey] = useState<string>("");

  const rectangularCollision = (
    rectangle1: { position: Position; width: number; height: number },
    rectangle2: { position: Position; width: number; height: number }
  ): boolean => {
    return (
      rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
      rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const aspectRatio = 16 / 9;
    let canvasWidth = screenWidth;
    let canvasHeight = screenWidth / aspectRatio;

    // If height exceeds screen height, adjust width
    if (canvasHeight > screenHeight) {
      canvasHeight = screenHeight;
      canvasWidth = screenHeight * aspectRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Initialize map and player sprites
    const mapImg = new Image();
    mapImg.src = "/officecozy.png";

    const playerDownImg = new Image();
    playerDownImg.src = "/playerDown.png";

    const playerUpImg = new Image();
    playerUpImg.src = "/playerUp.png";

    const playerLeftImg = new Image();
    playerLeftImg.src = "/playerLeft.png";

    const playerRightImg = new Image();
    playerRightImg.src = "/playerRight.png";

    const player = new Sprite({
      position: {
        x: canvas.width / 2 - 240 / 8,
        y: canvas.height / 2 - 102 / 2,
      },
      velocity: { x: 0, y: 0 },
      image: playerDownImg,
      frames: { max: 4 },
      sprites: {
        up: playerUpImg,
        down: playerDownImg,
        left: playerLeftImg,
        right: playerRightImg,
      },
    });
    playerRef.current = player;

    const map = new Sprite({
      position: { x: OFFSET.x, y: OFFSET.y },
      velocity: { x: 0, y: 0 },
      image: mapImg,
    });
    mapRef.current = map;

    const boundaries: Boundary[] = [];
    const collisionsMap: number[][] = [];
    for (let i = 0; i < collisions.length; i += MAP_TILES) {
      collisionsMap.push(collisions.slice(i, MAP_TILES + i));
    }

    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 107127) {
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
    movablesRef.current = [map, ...boundaries];

    function animate() {
      if (!ctx || !playerRef.current || !mapRef.current) return;

      const player = playerRef.current;
      const movables = movablesRef.current;

      animationFrameId.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      map.draw(ctx);
      boundariesRef.current.forEach((boundary) => boundary.draw(ctx));
      player.draw(ctx);

      let moving = true;
      player.moving = false;

      const handleMovement = (direction: Direction) => {
        if (!player.sprites) return;
        player.moving = true;
        player.image = player.sprites[direction];

        for (const boundary of boundariesRef.current) {
          const nextPosition = { ...boundary.position };
          switch (direction) {
            case "up":
              nextPosition.y += MOVEMENT_SPEED;
              break;
            case "down":
              nextPosition.y -= MOVEMENT_SPEED;
              break;
            case "left":
              nextPosition.x += MOVEMENT_SPEED;
              break;
            case "right":
              nextPosition.x -= MOVEMENT_SPEED;
              break;
          }

          if (
            rectangularCollision(player, {
              ...boundary,
              position: nextPosition,
            })
          ) {
            moving = false;
            break;
          }
        }

        if (moving) {
          movables.forEach((movable) => {
            switch (direction) {
              case "up":
                movable.position.y += MOVEMENT_SPEED;
                break;
              case "down":
                movable.position.y -= MOVEMENT_SPEED;
                break;
              case "left":
                movable.position.x += MOVEMENT_SPEED;
                break;
              case "right":
                movable.position.x -= MOVEMENT_SPEED;
                break;
            }
          });
        }
      };

      if (keys.w.pressed) handleMovement("up");
      else if (keys.s.pressed) handleMovement("down");
      else if (keys.a.pressed) handleMovement("left");
      else if (keys.d.pressed) handleMovement("right");
    }

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "a":
        case "s":
        case "d":
          keys[e.key].pressed = true;
          //   setLastKey(e.key);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <canvas ref={canvasRef} className="border border-gray-700" />
    </div>
  );
};

export default Game;
