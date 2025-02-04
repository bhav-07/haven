import { OFFSET } from "../constants/game.constants";
import { Boundary } from "../entities/Boundary";
import { Sprite } from "../entities/Sprite";
import { initializeCollisionBoundaries } from "./collision";

/**
 * Creates and initializes all game assets including the player sprite,
 * map, and collision boundaries.
 */
export const initializeGameAssets = async (canvas: HTMLCanvasElement, boundariesRef: React.MutableRefObject<Boundary[]>,
    movablesRef: React.MutableRefObject<(Boundary | Sprite)[]>,
    mapRef: React.MutableRefObject<Sprite | null>,
    playerRef: React.MutableRefObject<Sprite | null>,
) => {
    const images = {
        map: createImage("/officecozy.png"),
        playerDown: createImage("/playerDown.png"),
        playerUp: createImage("/playerUp.png"),
        playerLeft: createImage("/playerLeft.png"),
        playerRight: createImage("/playerRight.png"),
    };

    await Promise.all(
        Object.values(images).map(
            (img) =>
                new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                })
        )
    );

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

    mapRef.current = new Sprite({
        position: { x: OFFSET.x, y: OFFSET.y },
        velocity: { x: 0, y: 0 },
        image: images.map,
    });

    initializeCollisionBoundaries(boundariesRef, movablesRef, mapRef);
};

const createImage = (src: string): HTMLImageElement => {
    const img = new Image();
    img.src = src;
    return img;
};