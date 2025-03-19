export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: "GameUI", active: true });
    }
    
    create() {
        
        // Adjusted position for "Player Lives:" text
        const livesX = 650; 
        const livesY = 35;

        // Display "Player Lives:" text
        this.add.text(livesX - 20, livesY, "Lives:", {
            fontSize: "25px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });
        
        // Display hearts BELOW the text by increasing Y value
        this.add.text(livesX + 30, livesY + 35, "❤️ ❤️ ❤️", {
            fontSize: "20px",
            fill: "#800080",
            fontFamily: "'PixelOperator-Bold'"
        });
    }
}
