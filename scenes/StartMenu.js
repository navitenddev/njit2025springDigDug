export default class StartMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'StartMenu' });
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "StartBG");
        let scaleX = this.cameras.main.width / bg.width;
        let scaleY = this.cameras.main.height / bg.height;
        let scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        const outlineColor = "#d3d3d3" // Controls the outline color that surrounds the text"
        const outlineThickness = 6; // higher value means thicker outline

        // Initial title text box
        const titleText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'Shermie Digs',
            { fontSize: '64px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness }
        );
        titleText.setOrigin(0.5);

        /*
        // Initial instruction text
        const startText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Press SPACE to Start',
            { fontSize: '32px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness }
        );
        startText.setOrigin(0.5);
        */
        titleText.setDepth(1);
        //startText.setDepth(1);

        /*
        this.input.keyboard.on('keydown-SPACE', () => {
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.start('LevelSelect');
        });

        this.input.on('pointerdown', () => {
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.start('LevelSelect');
            console.log('LevelSelect started')
        });
        */

        //  Play Button
        const playBtn = this.add.text(centerX, centerY, 'Play', {
            fontFamily: 'PressStart2P',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            width: 100,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        playBtn.on('pointerdown', () => {
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.start('LevelSelect');
        });

        playBtn.on('pointerover', () => {
            this.tweens.add({
                targets: playBtn,
                scale: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        playBtn.on('pointerout', () => {
            this.tweens.add({
                targets: playBtn,
                scale: 1,
                duration: 150,
                ease: 'Power2'
            });
        });

        //  Help Button
        const helpBtn = this.add.text(centerX, centerY + 60, 'Help', {
            fontFamily: 'PressStart2P',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            width: 100,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        helpBtn.on('pointerdown', () => {
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.start('HelpScene');
        });

        helpBtn.on('pointerover', () => {
            this.tweens.add({
                targets: helpBtn,
                scale: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        helpBtn.on('pointerout', () => {
            this.tweens.add({
                targets: helpBtn,
                scale: 1,
                duration: 150,
                ease: 'Power2'
            });
        });
    }
}
