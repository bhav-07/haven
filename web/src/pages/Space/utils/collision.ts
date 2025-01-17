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