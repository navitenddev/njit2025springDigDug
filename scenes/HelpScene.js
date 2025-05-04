export default class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        const outlineColor = "#d3d3d3" // Controls the outline color that surrounds the text"
        const outlineThickness = 6; // higher value means thicker outline

        // Background image.
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "LevelBG");
        let scaleX = this.cameras.main.width / bg.width;
        let scaleY = this.cameras.main.height / bg.height;
        let scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
        bg.setDepth(-1);

        const titleText = this.add.text(
            this.cameras.main.centerX,
            50,
            'How to Play',
            { fontSize: '48px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness }
        );
        titleText.setOrigin(0.5);

        const controlsSubtitle = this.add.text(
            this.cameras.main.centerX,
            150,
            'Controls',
            { fontSize: '30px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness }
        );
        controlsSubtitle.setOrigin(0.5);

        const controlsText = this.add.text(
            this.cameras.main.centerX + 10,
            250,
            'Move Up: UP-ARROW or W\nMove Down: DOWN-ARROW or S\nMove Left: LEFT-ARROW or A\nMove Right: RIGHT-ARROW or D\nShoot: SPACE-BAR',
            { fontSize: '18px', fill: '#ffffff', fontFamily: 'PressStart2P', stroke: '#000000', strokeThickness: 5 }
        );
        controlsText.setOrigin(0.5);
        controlsText.setLineSpacing(5);

        const objectiveSubtitle = this.add.text(
            this.cameras.main.centerX,
            375,
            'Objective',
            { fontSize: '30px', fill: '#000000', fontFamily: 'PressStart2P', stroke: outlineColor, strokeThickness: outlineThickness }
        );
        objectiveSubtitle.setOrigin(0.5);

        const objective1Text = this.add.text(
            this.cameras.main.centerX,
            425,
            "1. Destroy all enemies to\nclear each level",
            { fontSize: '18px', fill: '#ffffff', fontFamily: 'PressStart2P', stroke: '#000000', strokeThickness: 5 }
        );
        objective1Text.setOrigin(0.5);
        objective1Text.setLineSpacing(5);
        objective1Text.setAlign('center');

        const objective2Text = this.add.text(
            this.cameras.main.centerX,
            490,
            "2. Use your environment to\nyour advantage",
            { fontSize: '18px', fill: '#ffffff', fontFamily: 'PressStart2P', stroke: '#000000', strokeThickness: 5 }
        );
        objective2Text.setOrigin(0.5);
        objective2Text.setLineSpacing(5);
        objective2Text.setAlign('center');

        const objective3Text = this.add.text(
            this.cameras.main.centerX,
            555,
            "3. Pick up powerups to\n enhance Shermie's power",
            { fontSize: '18px', fill: '#ffffff', fontFamily: 'PressStart2P', stroke: '#000000', strokeThickness: 5 }
        );
        objective3Text.setOrigin(0.5);
        objective3Text.setLineSpacing(5);
        objective3Text.setAlign('center');

        const objective4Text = this.add.text(
            this.cameras.main.centerX,
            620,
            "4. Don't let the last\nenemy alive escape",
            { fontSize: '18px', fill: '#ffffff', fontFamily: 'PressStart2P', stroke: '#000000', strokeThickness: 5 }
        );
        objective4Text.setOrigin(0.5);
        objective4Text.setLineSpacing(5);
        objective4Text.setAlign('center');

        //  Back to Start Menu button
        const backBtn = this.add.text(centerX, 700, 'Back', {
            fontFamily: 'PressStart2P',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            width: 100,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.sound.play("ui_button_press", { volume: 0.5 });
            this.scene.start('StartMenu');
        });

        backBtn.on('pointerover', () => {
            this.tweens.add({
                targets: backBtn,
                scale: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        backBtn.on('pointerout', () => {
            this.tweens.add({
                targets: backBtn,
                scale: 1,
                duration: 150,
                ease: 'Power2'
            });
        });
    }
}