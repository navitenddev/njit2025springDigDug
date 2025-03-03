export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        //this.load.image("player", "assets/shermie.png");
        this.load.spritesheet("player", "assets/ShermieAnimation_v1.png", {
            frameWidth: 64,
            frameHeight: 64,
            
        });
        this.load.image("tiles", "assets/tilemap/ground_tileset.png");
        this.load.tilemapTiledJSON("map", "assets/tilemap/map_1.json");
        this.anims.create({
            key:'walk',
            frames:this.anims.generateFrameNumbers('player', {start:0, end:1}),
            framerate: 10,
            repeat: -1
        });
    }

    create() {
        this.scene.start("GameScene"); // Start the main game scene
    }
}
