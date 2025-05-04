export default class PauseMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseMenuScene' });
    }
    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.7)');

        this.add.text(centerX, centerY - 100, "Paused", {
            fontFamily: 'PressStart2P',
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const resumeBtn = this.add.text(centerX, centerY, 'Resume Game', {
            fontFamily: 'PressStart2P',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        resumeBtn.on('pointerdown', () => {
            // Resume the game
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.stop();
            this.scene.resume('GameUI');
            this.scene.resume('GameScene');
            this.scene.get('GameScene').sound.resumeAll();
        });

        resumeBtn.on('pointerover', () => {
            this.tweens.add({
                targets: resumeBtn,
                scale: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        resumeBtn.on('pointerout', () => {
            this.tweens.add({
                targets: resumeBtn,
                scale: 1,
                duration: 150,
                ease: 'Power2'
            });
        });

        const quitBtn = this.add.text(centerX, centerY + 60, 'Quit to Level Select', {
            fontFamily: 'PressStart2P',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        quitBtn.on('pointerdown', () => {
            // Quit to home
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.stop();
            this.scene.stop('GameUI');
            this.scene.get('GameScene').shutdown();
            this.scene.stop('GameScene');
            this.scene.start('LevelSelect');
        });

        quitBtn.on('pointerover', () => {
            this.tweens.add({
                targets: quitBtn,
                scale: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        quitBtn.on('pointerout', () => {
            this.tweens.add({
                targets: quitBtn,
                scale: 1,
                duration: 150,
                ease: 'Power2'
            });
        });
    }
}