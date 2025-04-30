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

      // Increment level user is on
      const maxUnlocked = parseInt(localStorage.getItem('maxUnlockedLevel') || '1', 10);


      const spacingX = 150;
      for (let i = 1; i <= 5; i++) {
        // Choose image key based on whether the level is unlocked
        let imageKey = (i <= maxUnlocked) ? `lvl${i}_unlocked` : `lvl${i}_locked`;
  
        let posX = 100 + (i - 1) * spacingX;
        let posY = this.cameras.main.centerY;
  
      
        let levelImage = this.add.image(posX, posY, imageKey).setInteractive({ useHandCursor: true });
        levelImage.setOrigin(0.5);

        let border = this.add.graphics();
        border.lineStyle(4, 0xffffff, 1);
        border.strokeRect(
          levelImage.x - levelImage.displayWidth * levelImage.originX,
          levelImage.y - levelImage.displayHeight * levelImage.originY,
          levelImage.displayWidth,
          levelImage.displayHeight
        );

  
        // Pointer event for level selection.
        levelImage.on('pointerdown', () => {
          if (i <= maxUnlocked) {
            console.log(`Starting level ${i}`);
            this.scene.start('GameScene', { level: i });
          } else {
            console.log(`Level ${i} is locked.`);
          }
        });
      }
  
      const instructionText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 50,
        'Click a level to start!',
        { fontSize: '24px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness}
      );
      instructionText.setOrigin(0.5);
    }
  }
  