export default class player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player");
        // scene.add.existing(this);
        // scene.physics.add.existing(this);
        

        this.displayWidth = 50;
        this.scaleY = this.scaleX;
        this.direction = null;
    }

    handleInput(cursors, wasdKeys) {
        //  LEFT-ARROW key or A key
        if (cursors.left.isDown || wasdKeys.left.isDown) {
            if (this.getTopLeft().y % 50 == 0) {
                this.move('left', false)
            }
            else {
                this.move(this.direction, true);
            }
        }
        //  RIGHT-ARROW key or D key
        else if (cursors.right.isDown || wasdKeys.right.isDown) {
            if (this.getTopLeft().y % 50 == 0) {
                this.move('right', false)
            }
            else {
                this.move(this.direction, true);
            }
        }
        //  UP-ARROW key or W key
        else if (cursors.up.isDown || wasdKeys.up.isDown) {
            if (this.getTopLeft().x % 50 == 0) {
                this.move('up', false)
            }
            else {
                this.move(this.direction, true);
            }
        }
        //  DOWN-ARROW key or S KEY
        else if (cursors.down.isDown || wasdKeys.down.isDown) {
            if (this.getTopLeft().x % 50 == 0) {
                this.move('down', false)
            }
            else {
                this.move(this.direction, true);
            }
        }
    }

    move(dir, isSliding) {
        if (!isSliding) {
            this.direction = dir;
        }
        switch (dir) {
            case 'left':
                if (this.x != 0) {
                    this.flipX = false;
                    this.setPosition(this.x - 2, this.y);
                }
                break;
            case 'right':
                if (this.x != 550) {
                    this.flipX = true;
                    this.setPosition(this.x + 2, this.y);
                }
                break;
            case 'up':
                if (this.y != 150) {
                    this.setPosition(this.x, this.y - 2);
                }
                break;
            case 'down':
                if (this.y != 750) {
                    this.setPosition(this.x, this.y + 2);
                }
                break;
            default:
                break;
        }
    }
}
