export default class LevelSelect extends Phaser.Scene {
    constructor() {
      super({ key:'LevelSelect'});
    }
  
  
    create() {
      // Background image.
      let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "LevelBG");
      let scaleX = this.cameras.main.width / bg.width;
      let scaleY = this.cameras.main.height / bg.height;
      let scale = Math.max(scaleX, scaleY);
      bg.setScale(scale);
      bg.setDepth(-1);

      const outlineColor = "#d3d3d3" // Controls the outline color that surrounds the text"
      const outlineThickness = 6; // higher value means thicker outline
  
      const titleText = this.add.text(
        this.cameras.main.centerX,
        50,
        'Select Level',
        { fontSize: '48px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness}
      );
      titleText.setOrigin(0.5);
  
      // Interactive Level Options
      const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];
      const startY = this.cameras.main.centerY - 85;
      const spacingY = 80;
  
      levels.forEach((levelName, index) => {
        let levelText = this.add.text(
          this.cameras.main.centerX,
          startY + spacingY * index,
          levelName,
          { fontSize: '32px', fill: '#000000', fontFamily: 'PressStart2P' , stroke: outlineColor, stroke: outlineColor, strokeThickness: outlineThickness}
        );
        levelText.setOrigin(0.5);
        levelText.setInteractive({ useHandCursor: true });
        levelText.on('pointerdown', () => {
          // TODO: use level number passed into gamescene for the level loading
          console.log(`Starting level ${index + 1}`);
          this.scene.start('GameScene', { level: index + 1 });
        });
      });
  
      // Optionally add an instruction text at the bottom.
      const instructionText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 50,
        'Click a level to start',
        { fontSize: '24px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness}
      );
      instructionText.setOrigin(0.5);
    }
  }
  