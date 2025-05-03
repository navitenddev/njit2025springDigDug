export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
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
      { fontSize: '48px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness }
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
  
      
        let levelImage = this.add.image(0, 0, imageKey);
        levelImage.setOrigin(0.5);
        
        let border = this.add.graphics();
        border.lineStyle(4, 0xffffff, 1);
        border.strokeRect(
          levelImage.x - levelImage.displayWidth * levelImage.originX,
          levelImage.y - levelImage.displayHeight * levelImage.originY,
          levelImage.displayWidth,
          levelImage.displayHeight
        );

        // Put both image and border in a container
        const levelContainer = this.add.container(posX, posY, [border, levelImage]);
        levelContainer.setSize(levelImage.width, levelImage.height);
        levelContainer.setInteractive({ useHandCursor: true });

  
        // Pointer event for level selection.
        levelContainer.on('pointerdown', () => {
          if (i <= maxUnlocked) {
            console.log(`Starting level ${i}`);
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.start('GameScene', { level: i });
          } else {
            console.log(`Level ${i} is locked.`);
            this.sound.play("locked_level", { volume: 0.1 });
          }
        });

                // Scale up on hover
        levelContainer.on('pointerover', () => {
          if (imageKey !== `lvl${i}_locked`) {
            this.tweens.add({
              targets: levelContainer,
              scale: 1.2,
              duration: 150,
              ease: 'Power2'
            });
          }
        });

        // Reset scale when pointer leaves
        levelContainer.on('pointerout', () => {
          this.tweens.add({
            targets: levelContainer,
            scale: 1,
            duration: 150,
            ease: 'Power2'
          });
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
