export default class EndCreditsScene extends Phaser.Scene {
    constructor() {
      super({ key: 'EndCreditsScene' });
    }
  
    create() {
      const { width, height } = this.cameras.main;
      const centerX = width / 2;
      const centerY = height / 2;
      
      let bg = this.add.image(centerX, centerY, 'beatgame');
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setDepth(-1);

      this.add.text(centerX, 100, 'Credits', {
        fontFamily: 'PressStart2P',
        fontSize: '48px',
        fill: '#000000',
        stroke: '#d3d3d3',
        strokeThickness: 6
      }).setOrigin(0.5);
  

      const creditsText = `
  Team Shermie Digs
  
  Project Manager and Developer: Haley Patel
  Developer: Fausto Martinez
  Developer: Joshua Guevara
  Developer and Lead Asset Designer: Joel Abreu
  
  Thank you navitend for providing us this opportunity! 
  Thank you for playing!
  `;
  
      this.add.text(centerX, centerY, creditsText, {
        fontFamily: 'PressStart2P',
        fontSize: '20px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
        wordWrap: { width: width * 0.8 }
      }).setOrigin(0.5);
  
      // Instruction to return to Start Menu
      const instruction = this.add.text(centerX, height - 60, 'Press SPACE or Click to Return', {
        fontFamily: 'PressStart2P',
        fontSize: '18px',
        fill: '#000000',
        stroke: '#d3d3d3',
        strokeThickness: 4
      }).setOrigin(0.5);
  
      // Return on SPACE or click
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('StartMenu');
      });
      this.input.once('pointerdown', () => {
        this.scene.start('StartMenu');
      });
    }
  }