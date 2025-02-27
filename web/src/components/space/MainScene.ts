import { Player } from "../../hooks/useWebSocket";

class MainScene extends Phaser.Scene {
    player!: Phaser.Physics.Arcade.Sprite;
    players: Record<string, Phaser.Physics.Arcade.Sprite> = {};
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
    positionText!: Phaser.GameObjects.Text;
    ws: WebSocket | null = null;
    lastSentTime: number = 0;

    lastDirection: "left" | "right" | "up" | "down" = "down";

    tileSize = 16;
    mapWidth = 1920;
    mapHeight = 1920;

    constructor() {
        super("MainScene");
    }

    init(data: { ws: WebSocket, players: Record<string, Player> }) {
        // console.log("MainScene initialized with data:", data);
        this.ws = data.ws;
        if (data.players) {
            // console.log("Initial players:", data.players);
            Object.keys(data.players).forEach((id) => {
                this.addOtherPlayer(data.players[id]);
            });
        }
    }

    preload() {
        this.load.image("map", "/gatherofficecozy.png");
        this.load.json("collisions", "/collisions.json");
        this.load.spritesheet("player", "/fullsprite.png", {
            frameWidth: 18.75,
            frameHeight: 32,
        });
    }

    create() {
        this.cameras.main.setZoom(1.5);

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
                            0xff0000,
                            0.3
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
    }

    addOtherPlayer(playerData: Player) {
        // console.log("Adding player:", playerData);
        if (!this.players[playerData.id]) {
            const otherPlayer = this.physics.add.sprite(
                playerData.position.x,
                playerData.position.y,
                "player"
            ).setTint(0x00ff00);

            // Add collision
            this.physics.add.collider(otherPlayer, this.collisionLayer);

            // Add name display if available
            if (playerData.name) {
                const nameText = this.add.text(
                    playerData.position.x,
                    playerData.position.y - 20,
                    playerData.name,
                    { fontSize: '12px', color: '#ffffff' }
                );
                nameText.setOrigin(0.5, 0.5);
                otherPlayer.setData('nameText', nameText);
            }

            this.players[playerData.id] = otherPlayer;
            // console.log(`Player ${playerData.id} added at (${playerData.position.x}, ${playerData.position.y})`);
        }
    }


    updateOtherPlayers(players: Record<string, Player>) {
        // console.log("Updating players in scene:", players);

        // Handle player removal first
        const currentPlayerIds = Object.keys(this.players);
        const updatedPlayerIds = Object.keys(players);

        currentPlayerIds.forEach((id) => {
            if (!updatedPlayerIds.includes(id)) {
                // Player has left, remove them
                if (this.players[id]) {
                    const nameText = this.players[id].getData('nameText');
                    if (nameText) nameText.destroy();
                    this.players[id].destroy();
                    delete this.players[id];
                    console.log(`Player ${id} removed`);
                }
            }
        });

        // Then add/update remaining players
        updatedPlayerIds.forEach((id) => {
            if (!this.players[id]) {
                this.addOtherPlayer(players[id]);
            } else {
                // Update position
                this.players[id].setPosition(players[id].position.x, players[id].position.y);

                // Update name text position if it exists
                const nameText = this.players[id].getData('nameText');
                if (nameText) {
                    nameText.setPosition(players[id].position.x, players[id].position.y - 20);
                }
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
            time - this.lastSentTime > 10 //Rate limiting
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
            `X: ${Math.floor(this.player.x)}, Y: ${Math.floor(this.player.y)}`
        );

        Object.keys(this.players).forEach((id) => {
            const player = this.players[id];
            const nameText = player.getData('nameText');
            if (nameText) {
                nameText.setPosition(player.x, player.y - 20);
            }
        });

    }



}

export default MainScene;