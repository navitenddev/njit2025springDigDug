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
        this.load.font('PressStart2P', "assets/fonts/PressStart2P-Regular.ttf", 'truetype'); // Current Default game font
        this.load.spritesheet("mask_tileset", "assets/tilemap/mask_tileset.png", { frameWidth: 50, frameHeight: 50 });
        this.load.tilemapTiledJSON("map", "assets/tilemap/map_1.json");

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            framerate: 10,
            repeat: -1
        });

        this.load.spritesheet("shermie_mask", "assets/tilemap/shermie_mask_tileset.png", { frameWidth: 50, frameHeight: 50 });

        //  Corrupted CD enemy sprite
        this.load.spritesheet("cd_enemy", "assets/CorruptedCD_v1.png", {
            frameWidth: 64,
            frameHeight: 64,
        })
        this.load.image("StartBG", "assets/StartBackground.jpeg");
        this.load.image("LevelBG", "assets/bg2.jpeg");

    }

    create() {
        this.scene.start("StartMenu"); // Start the main game scene
    }
}
