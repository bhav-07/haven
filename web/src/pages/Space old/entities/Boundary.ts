import { BOUNDARY_SIZE } from "../constants/game.constants";
import { Position } from "../types/space.types";

export class Boundary {
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