import { Player } from "../../hooks/useWebSocket";

class MainScene extends Phaser.Scene {
    player!: Phaser.Physics.Arcade.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
    positionText!: Phaser.GameObjects.Text;
    ws: WebSocket | null = null;
    lastSentTime: number = 0;
    playersRef!: React.MutableRefObject<Record<string, Player>>;
    otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
    localUserId!: string;

    lastDirection: "left" | "right" | "up" | "down" = "down";

    tileSize = 16;
    mapWidth = 1920;
    mapHeight = 1920;

    constructor() {
        super("MainScene");
    }

    init(data: {
        ws: WebSocket;
        playersRef: React.MutableRefObject<Record<string, Player>>;
        localUserId: string;
    }) {
        this.ws = data.ws;
        this.playersRef = data.playersRef;
        this.localUserId = data.localUserId;
    }

    preload() {
        this.load.image("map", "/officecozy.png");
        this.load.json("collisions", "/collisions.json");
        this.load.spritesheet("player", "/fullsprite.png", {
            frameWidth: 18.75,
            frameHeight: 32,
        });
    }

    create() {
        this.cameras.main.setZoom(1);

        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        this.add.image(0, 0, "map").setOrigin(0, 0);

        const collisionData = this.cache.json.get("collisions");

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
                            // 0xff0000,
                            // 0
                        );
                        this.physics.add.existing(collider, true);
                        this.collisionLayer.add(collider);
                    }
                }
            }
        }

        this.player = this.physics.add.sprite(850, 1040, "player");

        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.collisionLayer);

        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.player, true);

        this.cursors = this.input.keyboard!.createCursorKeys();
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

        this.positionText = this.add
            .text(20, 20, "X: 0, Y: 0", {
                fontSize: "20px",
                color: "#ffffff",
            })
            .setScrollFactor(0);

        this.updateOtherPlayers();
    }

    getIdleFrame(direction: "left" | "right" | "up" | "down"): number {
        const idleFrames = {
            left: 8,
            right: 0,
            up: 4,
            down: 12,
        };
        return idleFrames[direction];
    }

    updateOtherPlayers() {
        const currentPlayers = this.playersRef.current;
        const currentPlayerIds = Object.keys(currentPlayers);

        for (const playerId of currentPlayerIds) {

            if (playerId === this.localUserId) continue;
            const playerData = currentPlayers[playerId];

            if (!this.otherPlayers.has(playerId)) {
                const otherPlayer = this.physics.add.sprite(
                    playerData.position.x,
                    playerData.position.y,
                    "player"
                );

                const nameText = this.add.text(
                    playerData.position.x,
                    playerData.position.y - 40,
                    playerData.name,
                    {
                        fontSize: "14px",
                        color: "#ffffff",
                        backgroundColor: "#00000080",
                        padding: { x: 4, y: 2 }
                    }
                );

                otherPlayer.setData('nameText', nameText);
                this.otherPlayers.set(playerId, otherPlayer);
            } else {
                const otherPlayer = this.otherPlayers.get(playerId)!;
                const nameText = otherPlayer.getData('nameText') as Phaser.GameObjects.Text;
                const lastPosition = { x: otherPlayer.x, y: otherPlayer.y };

                if (lastPosition.x !== playerData.position.x || lastPosition.y !== playerData.position.y) {
                    otherPlayer.setPosition(playerData.position.x, playerData.position.y);
                    nameText.setPosition(playerData.position.x - nameText.width / 2, playerData.position.y - 40);
                }
            }
        };
        this.otherPlayers.forEach((sprite, playerId) => {
            if (!currentPlayerIds.includes(playerId)) {
                const nameText = sprite.getData('nameText') as Phaser.GameObjects.Text;
                if (nameText) {
                    nameText.destroy();
                }

                sprite.destroy();
                this.otherPlayers.delete(playerId);
            }
        });
    }

    update(time: number) {
        if (!this.cursors) return;

        this.player.setVelocity(0);
        const speed = 200;
        let moved = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("left", true);
            this.lastDirection = "left";
            moved = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("right", true);
            this.lastDirection = "right";
            moved = true;
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play("up", true);
            this.lastDirection = "up";
            moved = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play("down", true);
            this.lastDirection = "down";
            moved = true;
        } else {
            this.player.anims.stop();

            const idleFrames = {
                left: 8,
                right: 0,
                up: 4,
                down: 12,
            };

            this.player.setFrame(idleFrames[this.lastDirection]);
        }

        if (
            moved &&
            this.ws &&
            this.ws.readyState === WebSocket.OPEN &&
            time - this.lastSentTime > import.meta.env.VITE_WS_RATE_LIMIT
        ) {
            this.ws.send(
                JSON.stringify({
                    type: "position_update",
                    position: {
                        x: Math.floor(this.player.x),
                        y: Math.floor(this.player.y),
                    },
                })
            );
            this.lastSentTime = time;
        }

        this.positionText.setText(
            `X: ${Math.floor(this.player.x)}, Y: ${Math.floor(this.player.y)} Players: ${Object.keys(this.playersRef.current).length}`
        );

        // console.log(`Players: ${Object.keys(this.playersRef.current).length}`)
        this.updateOtherPlayers();

    }



}

export default MainScene;