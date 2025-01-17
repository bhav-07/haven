import { SPRITE_ANIMATION_FRAME_RATE } from '../constants/game.constants';
import { Frames, Position, SpriteProps, Sprites, Velocity } from '../types/space.types';

export class Sprite {
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
        if (this.frames.elapsed % SPRITE_ANIMATION_FRAME_RATE === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;
        }
    }
}