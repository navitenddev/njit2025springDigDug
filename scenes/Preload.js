export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image("player", "assets/shermie.png");
        this.load.image("tiles", "assets/tilemap/ground_tileset.png");
        this.load.tilemapTiledJSON("map", "assets/tilemap/map_1.json");
    }

    create() {
        this.scene.start("GameScene"); // Start the main game scene
    }
}
