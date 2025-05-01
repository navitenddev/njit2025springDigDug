import Enemy from "./Enemy.js";

export default class TechnoWorm extends Enemy {
    constructor(scene, x, y, enemyGroup, bulletsGroup) {
        super(scene, x, y, "worm_enemy", enemyGroup)

        this.bullets = bulletsGroup;
        this.bulletCooldown = 1000;
        this.bulletTimer = null
        this.canFire = true;
    }

    update(goal) {
        super.update(goal);

        //  Begin timer for bullet firing if enemy and player are on the same Y level and they are relatively close
        try {
            if (this.scene.player.y == this.y && !this.bulletTimer
                && this.currentPath && this.currentPath.length <= 5) {
                this.bulletTimer = this.scene.time.delayedCall(this.bulletCooldown, this.fireBullet, [], this)
            }
        } catch (error) {
            console.warn("Technoworm generic error (ignore)");
        }
    }

    fireBullet() {
        try {
            if (this.isActive && this.scene.player.y == this.y) {
                let direction = this.x >= this.scene.player.x ? 'left' : 'right';
                this.bullets.fireBullet(this.x, this.y, direction, this);
            }
            this.bulletTimer = null;

        } catch (error) {
            console.warn("Technoworm generic error (ignore)");
        }
    }
}