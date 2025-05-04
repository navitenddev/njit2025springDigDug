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
        const lifeSpacing = 60;
        const livesX = 650;
        const livesY = 85;

        /*
        * Lives are stored in an array that is changed when a game event is emitted (player is hit by enemy)
        */
        this.livesIcons = []; // Store references for later updates

        for (let i = 0; i < maxLives; i++) {
            const icon = this.add.image(livesX + (i * lifeSpacing), livesY, 'player_lives')
                .setScale(1.2)
                .setOrigin(0.5)
            icon.flipX = true;

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

        this.activePowerupTextOne = this.add.text(scaleX, scaleY + 475, "", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: "PressStart2P",
            stroke: outlineColor,
            strokeThickness: outlineThickness
        });

        this.activePowerupTextTwo = this.add.text(scaleX, scaleY + 510, "", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: "PressStart2P",
            stroke: outlineColor,
            strokeThickness: outlineThickness
        });

        this.activePowerupTextThree = this.add.text(scaleX, scaleY + 545, "", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: "PressStart2P",
            stroke: outlineColor,
            strokeThickness: outlineThickness
        });

        this.activePowerups = []; // This stores { label, slot, id }
        this.activePowerupTimers = {};
        this.powerupSlots = [
            this.activePowerupTextOne,
            this.activePowerupTextTwo,
            this.activePowerupTextThree
        ];

        this.game.events.on("powerupActivated", (label) => {
            // If already active, reset its fade-out timer
            if (this.activePowerups.includes(label)) {
                if (this.activePowerupTimers[label]) {
                    this.activePowerupTimers[label].remove();
                }

                this.activePowerupTimers[label] = this.time.delayedCall(3000, () => {
                    this.game.events.emit("clearPowerupLabel", label);
                });

                return; // Don't add again
            }

            // Add new label
            this.activePowerups.push(label);

            const emptySlotIndex = this.powerupSlots.findIndex(slot => slot && slot.text === "");
            if (emptySlotIndex !== -1) {
                const slot = this.powerupSlots[emptySlotIndex];
                slot.setText(label);
                slot.setAlpha(1);
            }

            // Start fade-out timer
            this.activePowerupTimers[label] = this.time.delayedCall(3000, () => {
                this.game.events.emit("clearPowerupLabel", label);
            });
        });

        this.game.events.on("clearPowerupLabel", (label) => {
            const index = this.activePowerups.indexOf(label);
            if (index !== -1) {
                const slot = this.powerupSlots.find(s => s && s.text === label);
                if (slot) {
                    this.tweens.add({
                        targets: slot,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            slot.setText("");
                        }
                    });
                }

                this.activePowerups.splice(index, 1);
                delete this.activePowerupTimers[label];
            }
        });


        const levelText = this.add.text(scaleX, scaleY + 600, `Level:${this.currentLevel}`, {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P',
            stroke: outlineColor,
            strokeThickness: outlineThickness
        });

        //  Implement volume button
        const volumeLevels = [0.0, 0.25, 0.5, 1.0];

        // Get stored value safely
        let stored = parseInt(localStorage.getItem("volumePref"));
        let volume = Number.isInteger(stored) && stored >= 0 && stored < volumeLevels.length ? stored : 3;

        this.scene.get('GameScene').sound.volume = volumeLevels[volume];
        const volumeIcon = this.add.sprite(scaleX, scaleY + 700, 'volume', volume)
            .setOrigin(0, 1)
            .setInteractive({ useHandCursor: true });

        // Handle click to cycle through frames
        volumeIcon.on('pointerdown', () => {
            if (!this.scene.get('GameScene').isShuttingDown) {
                const nextFrame = (volumeIcon.frame.name + 1) % 4;
                volumeIcon.setFrame(nextFrame);
                this.scene.get('GameScene').sound.volume = volumeLevels[nextFrame];
                localStorage.setItem("volumePref", nextFrame);
            }
            else {
                volumeIcon.disableInteractive();
            }
        });
    }
}