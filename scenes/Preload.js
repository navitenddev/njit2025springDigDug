export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image("player", "assets/shermie.png");
        this.load.image("tiles", "assets/tilemap/ground_tileset.png");
        this.load.spritesheet("tileset", "assets/tilemap/ground_tileset.png", { frameWidth: 50, frameHeight: 50 });
        this.load.tilemapTiledJSON("map", "assets/tilemap/map_1.json");
        this.load.image("blue_tile", "assets/player.png");
        this.load.image("background", "assets/brown_background.png");
        this.load.image("test_mask", "assets/test_mask.png");
    }

    create() {
        this.scene.start("GameScene"); // Start the main game scene
    }
}
