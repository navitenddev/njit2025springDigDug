export default class enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, enemyGroup) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.displayWidth = 50;
        this.displayHeight = 50;
        this.direction = null;
        this.depth = 1;
        this.health = 3;
        this.isActive = true;

        this.enemyGroup = enemyGroup;
    }

    update(player) {
        this.move(player);
    }

    move(player) {
        if (this.enemyGroup.isActive && this.isActive) {
            switch (this.direction) {
                case 'left':
                    if (this.x != 0) {
                        this.flipX = false;
                        this.setPosition(this.x - 2, this.y);
                        //this.anims.play('move', true);
                    }
                    break;
                case 'right':
                    if (this.x != 550) {
                        this.flipX = true;
                        this.setPosition(this.x + 2, this.y);
                        //this.anims.play('move', true);
                    }
                    break;
                case 'up':
                    if (this.y != 150) {
                        this.setPosition(this.x, this.y - 2);
                        //this.anims.play('move', true);
                    }
                    break;
                case 'down':
                    if (this.y != 750) {
                        this.setPosition(this.x, this.y + 2);
                        //this.anims.play('move', true);
                    }
                    break;
                default:
                    break;
            }
            if (this.x % 50 == 0 && this.y % 50 == 0) {
                this.direction = this.getNextDirection(player);
            }
        }
    }

    //  TEMP NAME (use the next tile to move to and update the Enemy's direction)
    getNextDirection(player) {
        //  Keeps track of the directions the enemy COULD move towards
        let availableDirections = [];

        let currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y);

        //  Get the distance between this enemy and the player (X and Y)
        let length_dist = player.x - this.x;
        let width_dist = player.y - this.y;
        let temp_dir = null;

        //  Get the tunnels surrounding the enemy
        let upTile = this.scene.map.getTileAt(currentTile.x, currentTile.y - 1);    // Tile above
        let downTile = this.scene.map.getTileAt(currentTile.x, currentTile.y + 1);  // Tile below
        let leftTile = this.scene.map.getTileAt(currentTile.x - 1, currentTile.y);  // Tile to the left
        let rightTile = this.scene.map.getTileAt(currentTile.x + 1, currentTile.y); // Tile to the right

        if (upTile && upTile.properties['up'] > 0) {
            availableDirections.push('up');
        }
        if (downTile && downTile.properties['down'] > 0) {
            availableDirections.push('down');
        }
        if (leftTile && leftTile.properties['left'] > 0) {
            availableDirections.push('left');
        }
        if (rightTile && rightTile.properties['right'] > 0) {
            availableDirections.push('right');
        }

        //  Given the enemy a random direction to start moving in
        if (this.direction == null) {
            return availableDirections[Phaser.Math.Between(0, availableDirections.length - 1)];
        }

        //  Keeps enemy moving straight in a tunnel if it's able to
        if (availableDirections.includes(this.direction) && availableDirections.length < 3) {
            return this.direction;
        }
        //  If more tunnels are available, or a tunnel ends, change the enemy's movement relative to the player's
        else {
            //  Reduce X-axis distance between enemy and player (if X distance is greater than Y)
            if (Math.abs(length_dist) > Math.abs(width_dist)) {
                temp_dir = length_dist < 0 ? 'left' : 'right';
                if (availableDirections.includes(temp_dir)) {
                    return temp_dir;
                }
            }
            //  Reduce Y-axis distance between enemy and player (if Y distance is greater than X)
            else {
                temp_dir = width_dist < 0 ? 'up' : 'down';
                if (availableDirections.includes(temp_dir)) {
                    return temp_dir;
                }
            }
        }
        //  Just in case, move enemy in a random direction
        return availableDirections[Phaser.Math.Between(0, availableDirections.length - 1)];
    }

    takeDamage() {
        if (this.health > 1) {
            this.health -= 1;
        }
        else {
            this.destroy();
        }
    }
}
