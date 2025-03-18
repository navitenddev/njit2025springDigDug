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

        this.rt = this.make.renderTexture({
            x: 300, y: 400,
            width: map.widthInPixels,
            height: map.heightInPixels,
            add: false
        });
        this.mask = new Phaser.Display.Masks.BitmapMask(this, this.rt);
        this.mask.invertAlpha = true;
        groundLayer.setMask(this.mask);
    }

    update() {
        this.player.handleInput(this.cursors, this.wasdKeys);
    }

    updateTile(map) {
        let currentTile = this.getPlayerTile(map, this.player.direction);
        if (currentTile) {
            this.changeTileTexture(map, currentTile, this.player.direction);
        }
    }

    //  Returns the tile the player is currently moving INTO.
    getPlayerTile(map, direction) {
        let tileCoords = null;

        //  Base Case: player isn't moving into a tile, therefore return null.
        if (this.player.x % 50 == 0 && this.player.y % 50 == 0) {
            return null;
        }

        switch (direction) {
            case 'left':
                tileCoords = map.worldToTileXY(this.player.getCenter().x - 25, this.player.getCenter().y);
                break;
            case 'right':
                tileCoords = map.worldToTileXY(this.player.getCenter().x + 25, this.player.getCenter().y);
                break;
            case 'up':
                tileCoords = map.worldToTileXY(this.player.getCenter().x, this.player.getCenter().y - 25);
                break;
            case 'down':
                tileCoords = map.worldToTileXY(this.player.getCenter().x, this.player.getCenter().y + 25);
                break;
            default:
                return null;
        }
        const tile = map.getTileAt(tileCoords.x, tileCoords.y, false, map.groundLayer);
        return tile;
    }

    //  Draws the appropriate mask over the tile the player is moving in.
    changeTileTexture(map, tile, direction) {
        let newTexture = null;
        let thresholds = [8, 16, 24, 32, 40, 46]

        let offsetX = null;
        let offsetY = null;

        let offsetTexture = null;
        let shermieMaskFrame = null;

        //  Depending on which direction the player is moving, we need to extract a different 
        //  frame from their respective tile and shermie mask tilesets.
        switch (direction) {
            case 'right':
                offsetX = 25;
                offsetTexture = 0;
                shermieMaskFrame = 0;
                break;
            case 'left':
                offsetX = -25;
                offsetTexture = 6;
                shermieMaskFrame = 1;
                break;
            case 'up':
                offsetY = -25;
                offsetTexture = 12;
                shermieMaskFrame = 2;
                break;
            case 'down':
                offsetY = 25;
                offsetTexture = 18;
                shermieMaskFrame = 3;
                break;
            default: return;
        }

        let tileWorldXY = map.tileToWorldXY(tile.x, tile.y);
        let playerCoord = offsetX ? this.player.getCenter().x + offsetX : this.player.getCenter().y + offsetY;
        let tileCoord = offsetX ? tileWorldXY.x : tileWorldXY.y;

        //  If TRUE:  player is moving RIGHT or DOWN
        //  If FALSE: player is moving LEFT or UP
        let isPositive = (offsetX || offsetY) > 0;

        //  Checks if the player is within a specific threshold in the tile.
        for (let i = 0; i < thresholds.length; i++) {
            if ((isPositive && playerCoord <= tileCoord + thresholds[i]) || (!isPositive && playerCoord >= tileCoord + thresholds[thresholds.length - i - 1])) {
                newTexture = i + 1;
                break;
            }
        }

        //  If-Statement prevents multiple drawFrame calls
        if (newTexture && newTexture > tile.properties[direction]) {
            this.rt.drawFrame("shermie_mask", shermieMaskFrame, this.player.x, this.player.y)
            this.rt.drawFrame("mask_tileset", newTexture + offsetTexture - 1, tileWorldXY.x, tileWorldXY.y);
            tile.properties[direction] += 1;
        }
    }
}
