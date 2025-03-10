// StartMenu.js
export default class StartMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'StartMenu' });
    }
  
    preload() {
        // add bg image and assets for start
    }
  
    create() {
      // temp background
      this.cameras.main.setBackgroundColor('#2d2d2d');
  
      // Initial title text box
      const titleText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 100,
        'My Game',
        { fontSize: '64px', fill: '#fff' }
      );
      titleText.setOrigin(0.5);
  
      // Initial instruction text
      const startText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Press SPACE to Start',
        { fontSize: '32px', fill: '#fff' }
      );
      startText.setOrigin(0.5);
  
    this.input.keyboard.on('keydown-SPACE', () => {
        this.scene.start('PreloadScene');
      });
  
      this.input.on('pointerdown', () => {
        this.scene.start('PreloadScene');
      });
    }
  }
  