import Bullet from "../entities/Bullet.js";

export default class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene, amount) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: amount,
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
    fireBullet(x, y, direction, entity) {
        try {
            if (entity && !entity.controlsDisabled && entity.canFire) {
                const bullet = this.getFirstDead(false);

                if (bullet) {
                    bullet.fire(x, y, direction);
                    bullet.firedBy = entity;

                    if (!entity.rapidFire) { entity.canFire = false; }
                }

                //  Stop the entity's movement for 1/2 second
                entity.isActive = false;
                this.scene.time.delayedCall(300, () => {
                    if (entity) {
                        entity.isActive = true;
                    }
                }, [], this);
            }
        } catch (error) {
            console.warn("Bullet firing generic error (ignore)");
        }
    }
}