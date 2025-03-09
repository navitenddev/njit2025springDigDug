import Player from "../entities/Player.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        // Create tilemap
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("ground_tiles", "tiles");
        const groundLayer = map.createLayer("Ground", tileset, 0, 0);

        // Create player object

        this.player = new Player(this, 100, 450).setOrigin(0, 0);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.body.setAllowGravity(false);

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Collision with ground layer
        this.physics.add.overlap(this.player, groundLayer, () => {
            this.updateTile(map, groundLayer);
        });

        //  Player movement animations
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10
        });
    }

    update() {
        this.player.handleInput(this.cursors, this.wasdKeys);
    }

    updateTile(map, groundLayer) {
        // if (platform.texture.key !== 'r_tunnel_8') {
        //     //  Full dug out tunnel
        //     if ((parseInt(player.getCenter().x) == parseInt(platform.getCenter().x)) &&
        //         (parseInt(player.getCenter().y) == parseInt(platform.getCenter().y))) {
        //         platform.setTexture('r_tunnel_8');
        //     }
        // }

        //  Update the tile ONLY if the player is properly positioned inside it
        let currentTile = this.getPlayerTile(map, this.player.direction);
        if (currentTile) {
            this.changeTileTexture(map, currentTile, this.player.direction);
        }
    }

    //  Returns the tile the player is currently moving INTO.
    getPlayerTile(map, direction) {
        let tile = null;
        let tileCoords = null;
        let tileWorldCoords = null;

        switch (direction) {
            case 'left':
                tileCoords = map.worldToTileXY(this.player.getCenter().x - 25, this.player.getCenter().y);
                tileWorldCoords = map.tileToWorldXY(tileCoords.x, tileCoords.y)
                break;
            case 'right':
                tileCoords = map.worldToTileXY(this.player.getCenter().x + 25, this.player.getCenter().y);
                tileWorldCoords = map.tileToWorldXY(tileCoords.x, tileCoords.y)
                break;
            case 'up':
                tileCoords = map.worldToTileXY(this.player.getCenter().x, this.player.getCenter().y - 25);
                tileWorldCoords = map.tileToWorldXY(tileCoords.x, tileCoords.y)
                break;
            case 'down':
                tileCoords = map.worldToTileXY(this.player.getCenter().x, this.player.getCenter().y + 25);
                tileWorldCoords = map.tileToWorldXY(tileCoords.x, tileCoords.y)
                break;
            default:
                break;
        }
        return tileWorldCoords;
    }

    changeTileTexture(map, tile, direction) {
        let newTexture = null;
        let thresholds = [5, 12, 19, 25, 31, 38, 45]
        let offsetX = null;
        let offsetY = null;

        switch (direction) {
            case 'left': offsetX = -25; break;
            case 'right': offsetX = 25; break;
            case 'up': offsetY = -25; break;
            case 'down': offsetY = 25; break;
            default: return;
        }

        let playerCoord = offsetX ? this.player.getCenter().x + offsetX : this.player.getCenter().y + offsetY;
        let tileCoord = offsetX ? tile.x : tile.y;
        let isPositive = (offsetX || offsetY) > 0;

        for (let i = 0; i < thresholds.length; i++) {
            if ((isPositive && playerCoord >= tileCoord + thresholds[i]) || (!isPositive && playerCoord <= tileCoord + thresholds[thresholds.length - i - 1])) {
                newTexture = i + 2;
            }
        }

        //  Check if newTexture exists (pretty sure it should always exist, but who knows ¯\_(ツ)_/¯)
        if (newTexture) {
            let currentTexture = map.getTileAt(map.worldToTileX(tile.x), map.worldToTileY(tile.y))?.index;
            if (newTexture > currentTexture) {
                const newTile = map.putTileAt(newTexture, map.worldToTileX(tile.x), map.worldToTileY(tile.y), false, map.getLayer('Ground').tilemapLayer);
                if (direction == 'right') {
                    newTile.flipX = true;
                }
                else if (direction == 'up') {
                    newTile.rotation = Phaser.Math.DegToRad(90);
                }
                else if (direction == 'down') {
                    newTile.rotation = Phaser.Math.DegToRad(-90);
                }
            }
        }
    }
}
