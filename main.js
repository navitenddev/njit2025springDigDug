import PreloadScene from "./scenes/Preload.js";
import LevelSelect from "./scenes/LevelSelect.js";
import GameScene from "./scenes/Game.js";
import GameUI from "./scenes/GameUI.js";
import StartMenu from "./scenes/StartMenu.js";
import LevelCompleteScene from "./scenes/LevelCompleteScene.js";
import EndCredits from "./scenes/EndCredits.js";
import YouDied from "./scenes/YouDied.js";

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
    scene: [PreloadScene, StartMenu, LevelSelect, GameScene, YouDied, LevelCompleteScene, GameUI, EndCredits ] // Load Scenes
};

new Phaser.Game(config);
