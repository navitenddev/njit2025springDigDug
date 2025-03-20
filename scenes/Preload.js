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
        this.load.font(
            'PressStart2P',
            'https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/pressstart2p/PressStart2P-Regular.ttf',
            'truetype'
          );
        this.load.spritesheet("mask_tileset", "assets/tilemap/mask_tileset.png", { frameWidth: 50, frameHeight: 50 });
        this.load.tilemapTiledJSON("map", "assets/tilemap/map_1.json");

        this.anims.create({
            key:'walk',
            frames:this.anims.generateFrameNumbers('player', {start:0, end:1}),
            framerate: 10,
            repeat: -1
        });

        this.load.spritesheet("shermie_mask", "assets/tilemap/shermie_mask_tileset.png", { frameWidth: 50, frameHeight: 50 });

    }

    create() {
        this.scene.start("StartMenu"); // Start the main game scene
    }
}
