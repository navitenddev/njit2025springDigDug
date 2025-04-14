import Bullet from "../entities/Bullet.js";

export default class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 1,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    /**
     * fireBullet - fire the first available bullet in the Bullets group
     * @param {int} x 
     * @param {int} y 
     * @param {string} direction 
     */
    fireBullet(x, y, direction) {
        const bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y, direction);
        }
    }
}