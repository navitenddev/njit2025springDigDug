export default class player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(10, 10, true);

        this.displayWidth = 50;
        this.displayHeight = 50;
        this.direction = null;
        this.depth = 1;
        this.isActive = true;
        this.controlsDisabled = false;

        this.lastTile = this.scene.map.getTileAtWorldXY(x, y);
    }

    handleInput(cursors, wasdKeys) {
        // Prevent movement when the player shoots
        if (!this.isActive) {
            this.scene.shermieMusic.pause();
            return;
        }

        //  Prevent movement for the initial shermie movement path
        if (this.controlsDisabled) {
            this.scene.shermieMusic.pause();
            return;
        }

        const moving =
            cursors.left.isDown || cursors.right.isDown ||
            cursors.up.isDown || cursors.down.isDown ||
            wasdKeys.left.isDown || wasdKeys.right.isDown ||
            wasdKeys.up.isDown || wasdKeys.down.isDown;

        if (moving) {
            if (!this.scene.shermieMusic.isPlaying) {
                if (this.scene.shermieMusic.isPaused) {
                    this.scene.shermieMusic.resume(); // resume from pause
                } else {
                    this.scene.shermieMusic.play();   // first time playing
                }
            }
        } else {
            if (this.scene.shermieMusic.isPlaying) {
                this.scene.shermieMusic.pause();
            }
        }

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

        if (!this.canMove(dir)) { return; }

        switch (dir) {
            case 'left':
                this.flipX = false;
                this.setPosition(this.x - 2, this.y);
                this.anims.play('move', true);
                break;
            case 'right':
                this.flipX = true;
                this.setPosition(this.x + 2, this.y);
                this.anims.play('move', true);
                break;
            case 'up':
                this.setPosition(this.x, this.y - 2);
                this.anims.play('move', true);
                break;
            case 'down':
                this.setPosition(this.x, this.y + 2);
                this.anims.play('move', true);
                break;
            default:
                break;
        }
    }

    canMove(dir) {
        switch (dir) {
            case 'left':
                if (this.x - 2 < 0 || this.hasRock(this.scene.map, this.x - 2, this.y)) { return false; }
                break;
            case 'right':
                if (this.x + 2 > 550 || this.hasRock(this.scene.map, this.x + 50, this.y)) { return false; }
                break;
            case 'up':
                if (this.y - 2 < 100 || this.hasRock(this.scene.map, this.x, this.y - 2)) { return false; }
                break;
            case 'down':
                if (this.y + 2 > 750 || this.hasRock(this.scene.map, this.x, this.y + 50)) { return false; }
                break;
            default:
                break;
        }
        return true;
    }

    hasRock(map, x, y) {
        let rockFound = false;
        this.scene.rockGroup.getChildren().forEach(rock => {
            if (map.getTileAtWorldXY(rock.x, rock.y) == map.getTileAtWorldXY(x, y) && !rock.isMoving) { rockFound = true; }
        });
        return rockFound;
    }
}