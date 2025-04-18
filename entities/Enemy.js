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

    /**
     * Used to find a path between enemy and player.
     * 
     * If a path is found, gets a new direction for enemy to move in.
     * @param {Player} player 
     * @returns {String} Direction for enemy to move in.
     */
    getNextDirectionInPath(player) {
        let currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y);
        let playerTile = this.scene.map.getTileAtWorldXY(player.x, player.y);

        if (!currentTile || !playerTile) return null;

        // 1. Check available directions from current tile
        const directions = [];
        const dirMap = {
            up: { dx: 0, dy: -1, prop: 'up' },
            down: { dx: 0, dy: 1, prop: 'down' },
            left: { dx: -1, dy: 0, prop: 'left' },
            right: { dx: 1, dy: 0, prop: 'right' }
        };

        for (const [key, { dx, dy, prop }] of Object.entries(dirMap)) {
            const neighbor = this.scene.map.getTileAt(currentTile.x + dx, currentTile.y + dy);
            if (neighbor && neighbor.properties[prop] > 0) {
                directions.push(key);
            }
        }

        // 2. If there are 1 or 2 tunnel directions, keep going the same way (if possible)
        if (directions.length <= 2 && this.direction && directions.includes(this.direction)) {
            return this.direction;
        }

        // Only update path if player moved to a new tile
        if (!this.lastPlayerTile || this.lastPlayerTile.x !== playerTile.x || this.lastPlayerTile.y !== playerTile.y) {
            this.currentPath = this.searchPath(currentTile, playerTile);
            this.currentPathIndex = 1;
            this.lastPlayerTile = { x: playerTile.x, y: playerTile.y };
            this.hasFoundPlayer = this.currentPath ? true : false;
        }

        if (!this.currentPath) {
            this.hasFoundPlayer = false;
            return this.getNextDirection(player);
        }
        else if (this.currentPath.length < 2 || this.currentPathIndex >= this.currentPath.length) {
            return null;
        }

        const nextTile = this.currentPath[this.currentPathIndex];

        // Only increment when we *reach* the target tile
        if (currentTile.x === nextTile.x && currentTile.y === nextTile.y) {
            this.currentPathIndex++;
            if (this.currentPathIndex >= this.currentPath.length) return null;
        }

        const targetTile = this.currentPath[this.currentPathIndex];

        if (targetTile.x < currentTile.x) return 'left';
        if (targetTile.x > currentTile.x) return 'right';
        if (targetTile.y < currentTile.y) return 'up';
        if (targetTile.y > currentTile.y) return 'down';

        return null;
    }

    takeDamage() {
        if (this.health > 1) {
            this.health -= 1;
        }
        else {
            this.destroy();
        }
    }

    /**
     * Searches for a path from this to player using A* algorithm.
     * @param {*} startTile The enemy's starting position
     * @param {*} endTile The enemy's goal
     * @returns {Array} Path from enemy to player.
     */
    searchPath(startTile, endTile) {
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const tileToKey = (tile) => `${tile.x},${tile.y}`;

        const gScore = new Map();
        const fScore = new Map();

        const getNeighbors = (tile) => {
            const neighbors = [];

            const directions = [
                { dx: 0, dy: -1, prop: 'up' },
                { dx: 0, dy: 1, prop: 'down' },
                { dx: -1, dy: 0, prop: 'left' },
                { dx: 1, dy: 0, prop: 'right' }
            ];

            for (const { dx, dy, prop } of directions) {
                const neighbor = this.scene.map.getTileAt(tile.x + dx, tile.y + dy);
                if (neighbor && neighbor.properties[prop] > 0) {
                    neighbors.push(neighbor);
                }
            }

            return neighbors;
        };

        const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan

        const startKey = tileToKey(startTile);
        gScore.set(startKey, 0);
        fScore.set(startKey, heuristic(startTile, endTile));

        openSet.push(startTile);

        while (openSet.length > 0) {
            // Find node with lowest fScore
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                const a = tileToKey(openSet[i]);
                const b = tileToKey(openSet[currentIndex]);
                if ((fScore.get(a) || Infinity) < (fScore.get(b) || Infinity)) {
                    currentIndex = i;
                }
            }

            const current = openSet[currentIndex];
            const currentKey = tileToKey(current);

            if (current.x === endTile.x && current.y === endTile.y) {
                // Reconstruct path
                const path = [];
                let temp = current;
                while (temp) {
                    path.unshift(temp);
                    const prevKey = cameFrom.get(tileToKey(temp));
                    temp = prevKey ? this.scene.map.getTileAt(...prevKey.split(',').map(Number)) : null;
                }
                return path;
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(currentKey);

            for (const neighbor of getNeighbors(current)) {
                const neighborKey = tileToKey(neighbor);
                if (closedSet.has(neighborKey)) continue;

                const tentativeG = (gScore.get(currentKey) || Infinity) + 1;

                if (!openSet.find(t => tileToKey(t) === neighborKey)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                // This path is the best so far
                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + heuristic(neighbor, endTile));
            }
        }

        // No path found
        return null;
    }

