import { SPRITE_ANIMATION_FRAME_RATE } from '../constants/game.constants';
import { Frames, Position, SpriteProps, Sprites, Velocity } from '../types/space.types';

export class Sprite {
    id?: string;
    name?: string;
    position: Position;
    velocity: Velocity;
    image: HTMLImageElement;
    frames: Frames;
    width: number;
    height: number;
    moving: boolean;
    sprites?: Sprites;

    constructor({
        id,
        name,
        position,
        velocity,
        image,
        frames = { max: 1 },
        sprites,
    }: SpriteProps) {
        this.id = id;
        this.name = name;
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

    draw(ctx: CanvasRenderingContext2D, positionOverride?: Position): void {
        if (!this.image) return;

        const drawX = positionOverride ? positionOverride.x : this.position.x;
        const drawY = positionOverride ? positionOverride.y : this.position.y;

        ctx.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            drawX,
            drawY,
            this.image.width / this.frames.max,
            this.image.height
        );

        if (this.moving && this.frames.max > 1) {
            this.frames.elapsed++;
            if (this.frames.elapsed % SPRITE_ANIMATION_FRAME_RATE === 0) {
                this.frames.val = (this.frames.val + 1) % this.frames.max;
                console.log("moving:", this.moving)
            }
        } else {
            this.frames.val = 0;
        }
    }
}