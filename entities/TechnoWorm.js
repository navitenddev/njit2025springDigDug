import Enemy from "./Enemy.js";

export default class TechnoWorm extends Enemy {
    constructor(scene, x, y, enemyGroup, bulletsGroup) {
        super(scene, x, y, "worm_enemy", enemyGroup)

        this.bullets = bulletsGroup;
        this.bulletCooldown = 1000;
        this.bulletTimer = null
    }

    update(goal) {
        super.update(goal);

        //  Begin timer for bullet firing ONLY IF enemy and player are on the same Y level
        if (this.scene.player.y == this.y && !this.bulletTimer) {
            this.bulletTimer = this.scene.time.delayedCall(this.bulletCooldown, this.fireBullet, [], this)
        }
    }

    fireBullet() {
        //  Don't fire if the enemy is stunned (from the player's bullet)
        if (this.isActive && this.scene.player.y == this.y) {
            this.bullets.fireBullet(this.x, this.y, this.scene.player.direction);
        }
        this.bulletTimer = null;
    }
}