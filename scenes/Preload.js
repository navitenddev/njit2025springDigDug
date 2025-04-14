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

        //  Rock sprite
        this.load.image("rock", "assets/rock.png");

        //  Bullet
        this.load.image("bullet", "assets/bullet.png");
      
        // Level Select Screen Images
        this.load.image("lvl1_locked","assets/levelselectassets/level1_locked_v2.png");
        this.load.image("lvl1_unlocked", "assets/levelselectassets/level1_unlocked_v2.png");
        this.load.image("lvl2_locked", "assets/levelselectassets/level2_locked.png");
        this.load.image("lvl2_unlocked", "assets/levelselectassets/level2_unlocked.png");
        this.load.image("lvl3_locked", "assets/levelselectassets/level3_locked.png");
        this.load.image("lvl3_unlocked", "assets/levelselectassets/level3_unlocked.png");
        this.load.image("lvl4_locked", "assets/levelselectassets/level4_locked.png");
        this.load.image("lvl4_unlocked", "assets/levelselectassets/level4_unlocked.png");
        this.load.image("lvl5_locked", "assets/levelselectassets/level5_locked.png");
        this.load.image("lvl5_unlocked", "assets/levelselectassets/level5_unlocked.png");
    }

    create() {
        this.scene.start("StartMenu"); // Start the main game scene
    }
}
