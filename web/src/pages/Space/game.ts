// src/pages/Space/game.ts
import Phaser from "phaser";
import MainScene from "./mainscene";

const initializeGame = (container: HTMLElement): Phaser.Game => {
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: container,
        physics: {
            default: "arcade",
            arcade: {
                debug: true,
                width: 1920,
                height: 1920,
            },
        },
        scene: [MainScene],
    };

    return new Phaser.Game(config);
};

export default initializeGame;