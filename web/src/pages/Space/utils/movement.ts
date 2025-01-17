import { Sprite } from '../entities/Sprite';
import { Boundary } from '../entities/Boundary';
import { rectangularCollision } from './collision';
import { MOVEMENT_SPEED } from '../constants/game.constants';
import { Direction } from '../types/space.types';

export const handleMovement = (
    direction: Direction,
    player: Sprite,
    boundaries: Boundary[],
    movables: (Sprite | Boundary)[]
): void => {
    if (!player.sprites) return;

    player.moving = true;
    player.image = player.sprites[direction];

    let moving = true;

    // Check collisions
    for (const boundary of boundaries) {
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

        if (rectangularCollision(player, { ...boundary, position: nextPosition })) {
            moving = false;
            break;
        }
    }

    // Update positions if no collision
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