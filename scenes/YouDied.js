export default class YouDiedScene extends Phaser.Scene {
    constructor() {
      super({ key: 'YouDiedScene' });
    }
  
    // Level that player died on
    init(data) {
      this.diedLevel = data.level || 1;
    }
  
    create() {
      const { width, height } = this.cameras.main;
      const centerX = width / 2;
      const centerY = height / 2;
      this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.7)');
  
      this.add.text(centerX, centerY - 100, 'You Died', {
        fontFamily: 'PressStart2P',
        fontSize: '48px',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);
  
      const tryAgain = this.add.text(centerX, centerY, 'Try Again', {
        fontFamily: 'PressStart2P',
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 6 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
  
      tryAgain.on('pointerdown', () => {
        // Restart the current level
        this.scene.stop('GameUI');
        this.scene.start('GameScene', { level: this.diedLevel });
      });
  
      //Quit to Home
      const quitHome = this.add.text(centerX, centerY + 60, 'Quit to Home', {
        fontFamily: 'PressStart2P',
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 6 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
  
      quitHome.on('pointerdown', () => {
        this.scene.stop('GameUI');
        this.scene.start('StartMenu');
      });
    }
  }
  