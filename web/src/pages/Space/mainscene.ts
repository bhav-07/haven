import Phaser from "phaser";

type Direction = "left" | "right" | "up" | "down";

interface IdleFrames {
    [key: string]: number;
}

export default class MainScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
    private positionText!: Phaser.GameObjects.Text;

    private lastDirection: Direction = "down";
    private tileSize: number = 16;
    private mapWidth: number = 1920;
    private mapHeight: number = 1920;

    constructor() {
        super("MainScene");
    }

    preload(): void {
        this.load.image("map", "/gatherofficecozy.png");
        this.load.json("collisions", "/collisions.json");
        this.load.spritesheet("player", "/fullsprite.png", {
            frameWidth: 18.75,
            frameHeight: 32,
        });
    }

    create(): void {
        this.cameras.main.setZoom(1.5);
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        this.add.image(0, 0, "map").setOrigin(0, 0);
        this.setupCollisions();
        this.setupPlayer();
        this.setupAnimations();
        this.setupCamera();
        this.setupUI();
    }

    private setupCollisions(): void {
        const collisionData = this.cache.json.get("collisions") as number[][];
        this.collisionLayer = this.physics.add.staticGroup();

        if (Array.isArray(collisionData) && Array.isArray(collisionData[0])) {
            for (let y = 0; y < collisionData.length; y++) {
                for (let x = 0; x < collisionData[y].length; x++) {
                    if (collisionData[y][x] === 107127) {
                        const collider = this.add.rectangle(
                            x * this.tileSize + this.tileSize / 2,
                            y * this.tileSize + this.tileSize / 2,
                            this.tileSize,
                            this.tileSize,
                            0xff0000,
                            0
                        );
                        this.physics.add.existing(collider, true);
                        this.collisionLayer.add(collider as unknown as Phaser.GameObjects.GameObject);
                    }
                }
            }
        }
    }

    private setupPlayer(): void {
        this.player = this.physics.add.sprite(850, 1040, "player");
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.collisionLayer);
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    private setupAnimations(): void {
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("player", { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers("player", { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    private setupCamera(): void {
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.player, true);
    }

    private setupUI(): void {
        this.positionText = this.add
            .text(20, 20, "X: 0, Y: 0", {
                fontSize: "20px",
                color: "#ffffff",
            })
            .setScrollFactor(0);
    }

    update(): void {
        if (!this.cursors) return;

        this.handlePlayerMovement();
        this.updateUI();
    }

    private handlePlayerMovement(): void {
        this.player.setVelocity(0);
        const speed = 200;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("left", true);
            this.lastDirection = "left";
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("right", true);
            this.lastDirection = "right";
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play("up", true);
            this.lastDirection = "up";
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play("down", true);
            this.lastDirection = "down";
        } else {
            this.player.anims.stop();

            const idleFrames: IdleFrames = {
                left: 8,
                right: 0,
                up: 4,
                down: 12,
            };

            this.player.setFrame(idleFrames[this.lastDirection]);
        }
    }

    private updateUI(): void {
        this.positionText.setText(
            `X: ${Math.floor(this.player.x)}, Y: ${Math.floor(this.player.y)}`
        );
    }
}