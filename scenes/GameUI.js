export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: "GameUI" });
    }
    
    create() {
        
        // These two variables are used throughout all the texts to keep all of them aligned
        // Other texts may have variable specific scaling such as livesX, livesY
        const scaleX = 630; 
        const scaleY = 35;

        // Display "Player Lives:" text -> Partially completed
        const livesText = this.add.text(scaleX, scaleY, "Lives:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });

        const maxLives = 3;
        const lifeSpacing = 40;
        const livesX = 650; 
        const livesY = 85;

        for (let i = 0; i < maxLives; i++) {
            this.add.image(livesX + (i * lifeSpacing), livesY, 'player')
                .setScale(0.5)
                .setOrigin(0.5)
                .setFrame(0);
        }
        
        // highScore, currentscore, & powerUps Text -> functionality incomplete
        const highScoreText = this.add.text(scaleX, scaleY + 100, "High\nScore:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });

        const currentScoreText = this.add.text(scaleX, scaleY + 250, "Current\nScore:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });

        /*
        * Score that dynamically changes when a player talks over the tile
        *
        */
        const score = this.add.text(scaleX, scaleY + 315, "0", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });

        this.game.events.on("updateScore", (newScore) => {
            score.setText(newScore.toString());
        });

        const showPowerUps = this.add.text(scaleX, scaleY + 400, "Active\nPowers:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });

    }
}
