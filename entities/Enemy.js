export default class enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.displayWidth = 50;
        this.displayHeight = 50;
        this.direction = null;
        this.depth = 1;
    }

    move(dir) {
        if (!isSliding) {
            this.direction = dir;
        }
        switch (dir) {
            case 'left':
                if (this.x != 0) {
                    this.flipX = false;
                    this.setPosition(this.x - 2, this.y);
                    //this.anims.play('move', true);
                }
                break;
            case 'right':
                if (this.x != 550) {
                    this.flipX = true;
                    this.setPosition(this.x + 2, this.y);
                    //this.anims.play('move', true);
                }
                break;
            case 'up':
                if (this.y != 150) {
                    this.setPosition(this.x, this.y - 2);
                    //this.anims.play('move', true);
                }
                break;
            case 'down':
                if (this.y != 750) {
                    this.setPosition(this.x, this.y + 2);
                    //this.anims.play('move', true);
                }
                break;
            default:
                break;
        }
    }
}
