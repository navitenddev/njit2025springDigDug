import PreloadScene from "./scenes/Preload.js";
import LevelSelect from "./scenes/LevelSelect.js";
import GameScene from "./scenes/Game.js";
import GameUI from "./scenes/GameUI.js";
import StartMenu from "./scenes/StartMenu.js";
import LevelCompleteScene from "./scenes/LevelCompleteScene.js";
import EndCredits from "./scenes/EndCredits.js";
import GameOver from "./scenes/GameOver.js";
import BeatGame from "./scenes/BeatGame.js";
import PauseMenuScene from "./scenes/PauseMenu.js";
import HelpScene from "./scenes/HelpScene.js";

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
    scene: [PreloadScene, StartMenu, HelpScene, LevelSelect, GameScene, GameOver, PauseMenuScene, LevelCompleteScene, GameUI, BeatGame, EndCredits] // Load Scenes
};

new Phaser.Game(config);
