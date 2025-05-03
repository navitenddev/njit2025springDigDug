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
        this.load.tilemapTiledJSON("map1", "assets/tilemap/map_1.json");
        this.load.tilemapTiledJSON("map2", "assets/tilemap/map_2.json");
        this.load.tilemapTiledJSON("map3", "assets/tilemap/map_3.json");
        this.load.tilemapTiledJSON("map4", "assets/tilemap/map_4.json");
        this.load.tilemapTiledJSON("map5", "assets/tilemap/map_5.json");
        this.load.image("beatgame", "assets/beatgame.png");


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

        //  Techno Worm enemy sprite
        this.load.image("worm_enemy", "assets/TechnoWorm2.png")

        //  Escape Goal sprite
        this.load.image("goal", "assets/escape_goal.png");

        this.load.image("StartBG", "assets/StartBackground.jpeg");
        this.load.image("LevelBG", "assets/bg2.jpeg");

        //  Rock sprite
        this.load.image("rock", "assets/rock.png");

        //  Bullet
        this.load.image("bullet", "assets/bullet.png");

        // Level Select Screen Images
        this.load.image("lvl1_locked", "assets/levelselectassets/level1_locked_v2.png");
        this.load.image("lvl1_unlocked", "assets/levelselectassets/level1_unlocked_v2.png");
        this.load.image("lvl2_locked", "assets/levelselectassets/level2_locked.png");
        this.load.image("lvl2_unlocked", "assets/levelselectassets/level2_unlocked.png");
        this.load.image("lvl3_locked", "assets/levelselectassets/level3_locked.png");
        this.load.image("lvl3_unlocked", "assets/levelselectassets/level3_unlocked.png");
        this.load.image("lvl4_locked", "assets/levelselectassets/level4_locked.png");
        this.load.image("lvl4_unlocked", "assets/levelselectassets/level4_unlocked.png");
        this.load.image("lvl5_locked", "assets/levelselectassets/level5_locked.png");
        this.load.image("lvl5_unlocked", "assets/levelselectassets/level5_unlocked.png");


        this.load.image("powerup_slowdown", "assets/powerUps/slowdown.png");
        this.load.image("powerup_teleport", "assets/powerUps/teleport.png");
        this.load.image("powerup_rapidfire", "assets/powerUps/rapidfire.png");

        //  Audio Files
        this.load.audio("background_music", "assets/audio/retro-arcade1.mp3");
        this.load.audio("retro_music_1", "assets/audio/retro-music-1.mp3");
        this.load.audio("retro_music_2", "assets/audio/retro-music-2.mp3");
        this.load.audio("monster_hit", "assets/audio/monster-hit.mp3");
        this.load.audio("bullet_shot", "assets/audio/shot-laser-sound.wav");
        this.load.audio("rock_shake", "assets/audio/rock-activation-shaking.mp3");
        this.load.audio("rock_fall", "assets/audio/rock-falling.mp3");
        this.load.audio("rock_hit_ground", "assets/audio/rock-hitting-dirt.mp3");
        this.load.audio("pickup", "assets/audio/pickup-sound.wav");
        this.load.audio("shermie_take_dmg", "assets/audio/shermie-take-damage.mp3");
        this.load.audio("game_over", "assets/audio/game-over-sound.mp3");
        this.load.audio("level_complete", "assets/audio/level-complete-sound.mp3");
        this.load.audio("ui_button_press", "assets/audio/ui-button-press.mp3");
        this.load.audio("locked_level", "assets/audio/locked-level-sound.wav");
    }

    create() {
        if (!localStorage.getItem('maxUnlockedLevel')) {
            localStorage.setItem('maxUnlockedLevel', '1');
            console.log('Initialized maxUnlockedLevel to 1');
        } else {
            console.log('maxUnlockedLevel already in storage:', localStorage.getItem('maxUnlockedLevel'));
        }
        this.scene.start("StartMenu"); // Start the main game scene
    }
}
