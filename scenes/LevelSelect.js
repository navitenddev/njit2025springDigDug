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
      
      //TIDO: After a player completes a level, this number needs to be incremented
      let maxUnlocked = 3; //Tracks levels user unlocked


      const spacingX = 150;
      for (let i = 1; i <= 5; i++) {
        // Choose image key based on whether the level is unlocked
        let imageKey = (i <= maxUnlocked) ? `lvl${i}_unlocked` : `lvl${i}_locked`;
  
        let posX = 100 + (i - 1) * spacingX;
        let posY = this.cameras.main.centerY;
  
      
        let levelImage = this.add.image(posX, posY, imageKey).setInteractive({ useHandCursor: true });
        levelImage.setOrigin(0.5);
  
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


      /*levels.forEach((levelName, index) => {
        //todo: use the images instead and add logic for locked and unlocked levels
        // need to save a state of the max level a user is at in order to display the unlocked levels correctly
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
      });*/
  
      // Optionally add an instruction text at the bottom.
      const instructionText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 50,
        'Click a level to start!',
        { fontSize: '24px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness}
      );
      instructionText.setOrigin(0.5);
    }
  }
  