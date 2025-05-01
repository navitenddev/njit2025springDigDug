export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: "GameUI" });
    }

    init(data) {
        this.currentLevel = data.level || 1;
    }
    
    create() {
        
        // These two variables are used throughout all the texts to keep all of them aligned
        // Other texts may have variable specific scaling such as livesX, livesY
        const scaleX = 630; 
        const scaleY = 35;

        // other optional choice of slightly darker blue -> #242957
        const outlineColor = "#343d94" // Controls the outline color that surrounds the text"
        const outlineThickness = 5; // higher value means thicker outline

        // Display "Player Lives:" text -> Partially completed
        const livesText = this.add.text(scaleX, scaleY, "Lives:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });

        const maxLives = 3;
        const lifeSpacing = 40;
        const livesX = 650; 
        const livesY = 85;

        /*
        * Lives are stored in an array that is changed when a game event is emitted (player is hit by enemy)
        */
        this.livesIcons = []; // Store references for later updates

        for (let i = 0; i < maxLives; i++) {
            const icon = this.add.image(livesX + (i * lifeSpacing), livesY, 'player')
                .setScale(0.5)
                .setOrigin(0.5)
                .setFrame(0);
        
            this.livesIcons.push(icon); // Save each icon
        }
        this.game.events.on("updateLives", (newLives) => {
            this.livesIcons.forEach((icon, index) => {
                icon.setVisible(index < newLives);
            });
        });

        /*
        * HighScore that changes when a player surpasses his highscore
        * Will change in realtime if player surpasses his highscore and is still alive
        */
        const highScoreText = this.add.text(scaleX, scaleY + 100, "High\nScore:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });
        const highScoreValue = parseInt(localStorage.getItem("highScore")) || 0;
        
        this.highScoreValueText = this.add.text(scaleX, scaleY + 175, highScoreValue.toString(), {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });

        this.game.events.on("updateHighScore", (newHighScore) => {
            if (this.highScoreValueText?.setText) {
                this.highScoreValueText.setText(newHighScore.toString());
            }
        });

        const currentScoreText = this.add.text(scaleX, scaleY + 250, "Current\nScore:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });

        /*
        * Score that dynamically changes when a player talks over the tile
        */
        this.score = this.add.text(scaleX, scaleY + 315, "0", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });

        this.game.events.on("updateScore", (newScore) => {
            if (this.score?.setText) {
                this.score.setText(newScore.toString());
            }
        });

        /*
        * Functionality for showPowerUps and showing the Level your on is incomplete
        */
        const showPowerUps = this.add.text(scaleX, scaleY + 400, "Active\nPowers:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });

        
        this.activePowerupText = this.add.text(scaleX, scaleY + 500, "", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: "PressStart2P",
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });

        this.game.events.on("powerupActivated", (label) => {
            this.activePowerupText.setText(label);
            this.activePowerupText.setAlpha(1);
            this.tweens.killTweensOf(this.activePowerupText);
        });
        
        this.game.events.on("clearPowerupLabel", () => {
            this.tweens.add({
                targets: this.activePowerupText,
                alpha: 0,
                duration: 1000,
                ease: 'Power1'
            });
        });
        
        

        const levelText = this.add.text(scaleX, scaleY + 700, `Level:${this.currentLevel}`, {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor, 
            strokeThickness: outlineThickness
        });
    }
}
