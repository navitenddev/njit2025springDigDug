export default class rock extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x + 25, y + 25, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.belowTile = this.scene.map.getTileAtWorldXY(x, y + 50);    //  Track the tile below the rock
        this.isActive = false;      //  Used to initiate rock falling movement
        this.alreadyActivated = false;  //  Used to prevent more than 1 rock activation
        this.isMoving = false;      //  Used to fix issue with player collision
        this.entityCollision = true;    //  Used for the rock's self-destroying process
        this.depth = 1;
    }

    update(player) {
        this.checkBelowTile(player);
    }

    checkBelowTile(player) {
        //  Rock is idle
        if (!this.isMoving) {
            //  Check player IN tile
            if (player.getBounds().x == this.belowTile.x * 50 && player.getBounds().y == this.belowTile.y * 50 && !this.alreadyActivated) {
                this.isActive = true;
            }
            //  Activate rock when player leaves below tile
            else if (this.isActive) {
                this.isActive = false;
                this.alreadyActivated = true;
                this.activateRock()
            }
        }
        //  Rock is falling
        else {
            let tile = this.scene.map.getTileAtWorldXY(this.x, this.y + 30);
            let stopRock = false;
            //  Stop rock if...
            //      - Has reached end of map
            //      - The tile below is not traversable
            //      - The tile below is partially dug out
            if (!tile || tile !== this.belowTile) {
                if (!tile || tile.properties['down'] == 0) {
                    stopRock = true;
                } else if (tile.properties['down'] !== 6) {
                    let thresholds = [8, 16, 24, 32, 40, 46];
                    let offsetY = thresholds[tile.properties['down'] - 1] || 0;

                    if (this.y + 25 >= this.scene.map.tileToWorldY(tile.y) + offsetY) {
                        stopRock = true;
                    }
                }
            }

            if (stopRock && this.entityCollision) {
                this.setVelocityY(0);
                this.scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: 500,
                    ease: 'Linear',
                    onStart: () => {
                        this.scene.physics.world.remove(this.body);
                        this.entityCollision = false;
                    },
                    onComplete: () => {
                        this.destroy();
                    }
                })
            }
        }
    }

    activateRock() {
        this.scene.tweens.add({
            targets: this,
            duration: 100,
            angle: 20,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.angle = 0;
                this.setVelocityY(200);
                this.isMoving = true;
            }
        });
    }
}