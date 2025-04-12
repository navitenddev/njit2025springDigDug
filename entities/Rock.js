export default class rock extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x + 25, y + 25, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.belowTile = this.scene.map.getTileAtWorldXY(x, y + 50);    //  Track the tile below the rock
        this.isActive = false;      //  Used to initiate rock falling movement
        this.isMoving = false;      //  Used to fix issue with player collision
        this.playerCollision = true;    //  Used for the rock's self-destroying process
        this.depth = 1;
    }

    update(player) {
        this.checkBelowTile(player);
    }

    checkBelowTile(player) {
        //  Rock is idle
        if (!this.isMoving) {
            //  Check player IN tile
            if (player.x == this.belowTile.x * 50 && player.y == this.belowTile.y * 50) {
                this.isActive = true;
            }
            //  Activate rock when player leaves below tile
            else if (this.isActive) {
                this.activateRock()
                this.isActive = false;
            }
        }
        //  Rock is falling
        else {
            let tile = this.scene.map.getTileAtWorldXY(this.x, this.y + 30);

            //  Check if rock is colliding with dirt OR if it has reached the end of the map
            if ((this.playerCollision && tile && tile !== this.belowTile && tile.properties['down'] == 0) || this.y + 25 >= 800) {
                this.setVelocityY(0);
                this.scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: 500,
                    ease: 'Linear',
                    onStart: () => {
                        this.scene.physics.world.remove(this.body);
                        this.playerCollision = false;
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