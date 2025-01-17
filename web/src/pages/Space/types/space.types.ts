export type Direction = "up" | "down" | "left" | "right";
export type Sprites = Record<Direction, HTMLImageElement>;

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    x: number;
    y: number;
}

export interface Frames {
    max: number;
    val: number;
    elapsed: number;
}

export interface Key {
    pressed: boolean;
}

export interface Keys {
    w: Key;
    a: Key;
    s: Key;
    d: Key;
}

export interface SpriteProps {
    position: Position;
    velocity: Velocity;
    image: HTMLImageElement;
    frames?: { max: number };
    sprites?: Sprites;
}

export interface Rectangle {
    position: Position;
    width: number;
    height: number;
}