export default class LevelCompleteScene extends Phaser.Scene {
    constructor() {
      super({ key: 'LevelCompleteScene' });
    }
  
    // Capture the level that was just completed
    init(data) {
      this.completedLevel = data.level || 1;
    }
  
    create() {
      // Semi-transparent dark overlay
      this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.7)');
  
      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;
  
      // "Level Complete" title
      const title = this.add.text(centerX, centerY - 100, 'Level Complete!', {
        fontFamily: 'PressStart2P',
        fontSize: '48px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      });
      title.setOrigin(0.5);
  
      // Display which level was completed
      const subtitle = this.add.text(centerX, centerY, `You cleared Level ${this.completedLevel}`, {
        fontFamily: 'PressStart2P',
        fontSize: '24px',
        fill: '#ffffff'
      });
      subtitle.setOrigin(0.5);
  
      // Instruction text
      const instruction = this.add.text(centerX, centerY + 100, 'Press SPACE or Click to Continue', {
        fontFamily: 'PressStart2P',
        fontSize: '18px',
        fill: '#ffffff'
      });
      instruction.setOrigin(0.5);
  
      // Advance on SPACE key or pointer click
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('LevelSelect');
      });
      this.input.once('pointerdown', () => {
        this.scene.start('LevelSelect');
      });
    }
  }
  