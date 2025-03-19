import PreloadScene from "./scenes/Preload.js";
import GameScene from "./scenes/Game.js";
import GameUI from "./scenes/GameUI.js";

const config = {
    type: Phaser.AUTO,
    width: 850,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
            fps: 60
        }
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scene: [PreloadScene, GameScene, GameUI] // Load Scenes
};

new Phaser.Game(config);
