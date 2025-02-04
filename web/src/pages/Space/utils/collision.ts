import { collisions } from "../constants/collisionsObject";
import { MAP_TILES, OFFSET } from "../constants/game.constants";
import { Boundary } from "../entities/Boundary";
import { Sprite } from "../entities/Sprite";
import { Rectangle } from "../types/space.types";

export const rectangularCollision = (
    rectangle1: Rectangle,
    rectangle2: Rectangle
): boolean => {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    );
};

export const initializeCollisionBoundaries = (
    boundariesRef: React.MutableRefObject<Boundary[]>,
    movablesRef: React.MutableRefObject<(Boundary | Sprite)[]>,
    mapRef: React.MutableRefObject<Sprite | null>
) => {
    const boundaries: Boundary[] = [];
    const collisionsMap: number[][] = [];

    for (let i = 0; i < collisions.length; i += MAP_TILES) {
        collisionsMap.push(collisions.slice(i, MAP_TILES + i));
    }

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