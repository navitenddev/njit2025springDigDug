export default class BeatGame extends Phaser.Scene {
  constructor() {
    super({ key: 'BeatGame' });
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

    const congratsText =
      "Congrats! Shermie has found the best pasture ever. You beat the game!";

    this.add.text(centerX, centerY - 50, congratsText, {
      fontFamily: 'PressStart2P',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    // "Next" button
    const nextButton = this.add.text(centerX, centerY + 80, 'Next', {
      fontFamily: 'PressStart2P',
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: 'rgb(179, 218, 255)',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    nextButton.on('pointerdown', () => {
      this.sound.play("ui_button_press", { volume: 0.5 });
      this.scene.start('EndCreditsScene');
    });
  }
}
