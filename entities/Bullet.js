export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.direction = null;
        this.firedBy = null;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        //  Stop the bullet if the GameScene is shutting down
        try {
            if (this.scene.isShuttingDown) {
                this.setVelocity(0, 0);
            }
        } catch (error) {
            console.warn("Bullet error occurred on GameScene shutdown");
        }

        this.checkTunnelCollision(this.direction);

        //  Reset bullet after 3 blocks traveled horizontally
        if ((this.direction == 'left' || this.direction == 'right') && Math.abs(this.startingPoint - this.x) >= 150) {
            this.setActive(false);
            this.setVisible(false);
            this.delayFire()
        }
        //  Reset bullet after 3 blocks traveled vertically
        else if ((this.direction == 'up' || this.direction == 'down') && Math.abs(this.startingPoint - this.y) >= 150) {
            this.setActive(false);
            this.setVisible(false);
            this.delayFire()
        }
        //  Reset bullet if out of boundary
        if (this.x <= 0 || this.x >= 600 || this.y <= 0 || this.y >= 800) {
            this.setActive(false);
            this.setVisible(false);
            this.delayFire()
        }
    }

    /**
     * fire - set the bullet's direction and velocity
     * @param {int} x 
     * @param {int} y 
     * @param {string} direction 
     */
    fire(x, y, direction) {
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
                this.delayFire();
            }
        });
    }

    delayFire() {
        try {
            if (this.firedBy && this.firedBy.rapidFire) {
                this.firedBy.canFire = true;
            }
            else {
                this.scene.time.delayedCall(300, () => {
                    if (this.firedBy) {
                        this.firedBy.canFire = true;
                    }
                }, [], this);
            }
        } catch (error) {
            console.log("Error handled: resetting canFire of entity who fired bullet");
        }
    }
}