export default class player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(10, 10, true);           // Set body size (width, height)

        this.displayWidth = 50;
        this.displayHeight = 50;
        this.depth = 1;

        this.direction = null;      // current direction
        this.moveQueue = null;          // next input direction
        this.targetPosition = null;     // tile to move toward

        this.baseSpeed = 2;
        this.boostedSpeed = 4;
        this.speedBoost = false;
        this.lastTile = this.scene.map.getTileAtWorldXY(x, y);
    }

    getSpeed() {
        return this.speedBoost ? this.boostedSpeed : this.baseSpeed;
    }

    handleInput(cursors, wasdKeys) {
        if (cursors.left.isDown || wasdKeys.left.isDown) {
            this.moveQueue = 'left';
        } else if (cursors.right.isDown || wasdKeys.right.isDown) {
            this.moveQueue = 'right';
        } else if (cursors.up.isDown || wasdKeys.up.isDown) {
            this.moveQueue = 'up';
        } else if (cursors.down.isDown || wasdKeys.down.isDown) {
            this.moveQueue = 'down';
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.updateMovement();
    }

    updateMovement() {
        if (!this.targetPosition) {
            if (this.moveQueue && this.canMove(this.moveQueue)) {
                this.direction = this.moveQueue;
                this.moveQueue = null;

                const offset = {
                    left: { x: -50, y: 0 },
                    right: { x: 50, y: 0 },
                    up: { x: 0, y: -50 },
                    down: { x: 0, y: 50 }
                }[this.direction];

                this.targetPosition = {
                    x: this.x + offset.x,
                    y: this.y + offset.y
                };

                this.anims.play('move', true);
                this.flipX = this.direction === 'right';
            }
        }

        const speed = this.getSpeed();

        if (this.targetPosition) {
            const dx = this.targetPosition.x - this.x;
            const dy = this.targetPosition.y - this.y;

            const stepX = Phaser.Math.Clamp(dx, -speed, speed);
            const stepY = Phaser.Math.Clamp(dy, -speed, speed);

            this.setPosition(this.x + stepX, this.y + stepY);

            if (Phaser.Math.Fuzzy.Equal(this.x, this.targetPosition.x, 1) &&
                Phaser.Math.Fuzzy.Equal(this.y, this.targetPosition.y, 1)) {
                this.setPosition(this.targetPosition.x, this.targetPosition.y);
                this.targetPosition = null;
            }
        }
    }

    canMove(direction) {
        const offset = {
            left: { x: -50, y: 0 },
            right: { x: 50, y: 0 },
            up: { x: 0, y: -50 },
            down: { x: 0, y: 50 }
        }[direction];

        const targetX = this.x + offset.x;
        const targetY = this.y + offset.y;

        return !this.hasRock(this.scene.map, targetX, targetY);
    }

    hasRock(map, x, y) {
        return this.scene.rockGroup.getChildren().some(rock => {
            return map.getTileAtWorldXY(rock.x, rock.y) === map.getTileAtWorldXY(x, y) && !rock.isMoving;
        });
    }
}
