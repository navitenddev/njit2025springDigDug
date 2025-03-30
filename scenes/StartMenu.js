export default class StartMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'StartMenu' });
    }
  
    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "StartBG");
        let scaleX = this.cameras.main.width / bg.width;
        let scaleY = this.cameras.main.height / bg.height;
        let scale = Math.max(scaleX, scaleY); 
        bg.setScale(scale);
  
        // Initial title text box
        const titleText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'Shermie Digs',
            { fontSize: '64px', fill: '#000000' , fontFamily: 'PressStart2P'}
        );
        titleText.setOrigin(0.5);
    
        // Initial instruction text
        const startText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Press SPACE to Start',
            { fontSize: '32px', fill: '#000000' , fontFamily: 'PressStart2P'}
        );
        startText.setOrigin(0.5);
        titleText.setDepth(1);
        startText.setDepth(1);
  
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('LevelSelect');
        });
  
        this.input.on('pointerdown', () => {
            this.scene.start('LevelSelect');
            console.log('LevelSelect started')
        });
    }
  }
  