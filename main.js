import PreloadScene from "./scenes/Preload.js";
import GameScene from "./scenes/Game.js";
import StartMenu from "./scenes/StartMenu.js";

const config = {
    type: Phaser.AUTO,
    width: 600,
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
    scene: [StartMenu, PreloadScene, GameScene] // Load Scenes
};

new Phaser.Game(config);
