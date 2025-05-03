export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.direction = null;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        this.checkTunnelCollision(this.direction);

        //  Reset bullet after 3 blocks traveled horizontally
        if ((this.direction == 'left' || this.direction == 'right') && Math.abs(this.startingPoint - this.x) >= 150) {
            this.setActive(false);
            this.setVisible(false);
        }
        //  Reset bullet after 3 blocks traveled vertically
        else if ((this.direction == 'up' || this.direction == 'down') && Math.abs(this.startingPoint - this.y) >= 150) {
            this.setActive(false);
            this.setVisible(false);
        }
        //  Reset bullet if out of boundary
        if (this.x <= 0 || this.x >= 600 || this.y <= 0 || this.y >= 800) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    /**
     * fire - set the bullet's direction and velocity
     * @param {int} x 
     * @param {int} y 
     * @param {string} direction 
     */
    fire(x, y, direction) {
        const bulletSound = this.scene.sound.add("bullet_shot", { volume: 0.1 });
        bulletSound.detune = (Math.random() * -600) + 400;  //  Range: -200 to 400
        bulletSound.play();

        this.body.reset(x + 25, y + 25);

        this.setActive(true);
        this.setVisible(true);

        this.body.allowGravity = false;
        this.direction = direction;
        if (direction == 'left') {
            this.angle = -180;
            this.startingPoint = this.x;
            this.setVelocityX(-200);
        }
        else if (direction == 'right') {
            this.angle = 0;
            this.startingPoint = this.x;
            this.setVelocityX(200);
        }
        else if (direction == 'up') {
            this.angle = -90;
            this.startingPoint = this.y;
            this.setVelocityY(-200);
        }
        else {
            this.angle = 90;
            this.startingPoint = this.y;
            this.setVelocityY(200);
        }
    }

    /**
     * checkTunnelCollision - reset the bullet if it collides with any tunnel wall
     * @param {string} direction 
     */
    checkTunnelCollision(direction) {
        let bulletX = this.x;
        let bulletY = this.y;
        switch (direction) {
            case 'left':
                bulletX = this.x - 9;
                break;
            case 'right':
                bulletX = this.x + 9;
                break;
            case 'up':
                bulletY = this.y - 9;
                break;
            case 'down':
                bulletY = this.y + 9;
                break;
            default:
                break;
        }
        this.scene.rt.snapshotPixel(bulletX, bulletY, (color) => {
            if (color.a == 0) {
                this.setActive(false);
                this.setVisible(false);
            }
        });
    }
}