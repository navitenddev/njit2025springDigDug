export default class enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, enemyGroup) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(25, 25, true);

        this.displayWidth = 50;
        this.displayHeight = 50;
        this.direction = null;
        this.depth = 1;
        this.health = 3;
        this.isActive = true;

        this.enemyGroup = enemyGroup;

        this.targetPosition = null;
        this.hasFoundPlayer = false;
        this.ghostAlignMode = false;
        this.ghostMode = false;
        this.elapsedTime = 0;

        this.baseSpeed = 2;
        this.isSlowed = false;

        this.animationKey = sprite;
    }

    update(goal) {
        //  Prevent crash by killing enemy
        if (this.isDestroyed) {
            this.destroy();
            return;
        }

        //  Check if enemy is able to move
        if (this.enemyGroup.isActive && this.isActive) {
            if (this.ghostMode) {
                this.ghostMove(goal);
            }
            else if (this.ghostAlignMode) {
                this.ghostAlignMove(goal);
            }
            else if (this.alignMode) {
                this.alignMove(this.direction);
            }
            else if (this.escapeMode) {
                this.escapeMove();
            }
            else if (this.redirectMode) {
                this.redirectMove();
            }
            else {
                this.move(goal);
            }
        }
    }

    /**
     * Handles default enemy movement based on current direction and tile alignment.
     * @param {Player} goal 
     */
    move(goal) {
        //  Enemy is moving to the next tile
        if (this.targetPosition) {
            const speed = this.isSlowed ? 1 : this.baseSpeed;

            const dx = this.targetPosition.x - this.x;
            const dy = this.targetPosition.y - this.y;

            const stepX = Phaser.Math.Clamp(dx, -speed, speed);
            const stepY = Phaser.Math.Clamp(dy, -speed, speed);

            this.setPosition(this.x + stepX, this.y + stepY);
            if (this.anims.animationManager.exists(this.animationKey)) {
                this.play(this.animationKey, true);
            }

            //  Snaps Enemy to new tile if it is close enough to it
            if (Phaser.Math.Fuzzy.Equal(this.x, this.targetPosition.x, 1) &&
                Phaser.Math.Fuzzy.Equal(this.y, this.targetPosition.y, 1)) {
                this.setPosition(this.targetPosition.x, this.targetPosition.y);
                this.targetPosition = null;
            }
        }
        //  Enemy needs a new tile to move to
        else {
            this.ghostAlignMode = false;
            this.direction = this.getNextDirectionInPath(goal);

            //  Quick exit for redirect mode
            if (this.redirectMode) {
                return;
            }

            if (this.isDestroyed) {
                return;
            }

            //  Flip sprite horizontally to face the correct direction
            if (this.direction == 'left') {
                this.flipX = false;
            }
            else if (this.direction == 'right') {
                this.flipX = true;
            }

            const offset = {
                left: { x: -50, y: 0 },
                right: { x: 50, y: 0 },
                up: { x: 0, y: -50 },
                down: { x: 0, y: 50 }
            }[this.direction];

            const thresholds = [8, 16, 24, 32, 40];

            if (this.x % 50 == 0 && this.y % 50 == 0) {
                if (this.escapeMode) {
                    return;
                }

                let trueOffsetX = 0;
                let trueOffsetY = 0;
                switch (this.direction) {
                    case 'left':
                        var newTile = this.scene.map.getTileAtWorldXY(this.x - 50, this.y);
                        let valLeft = newTile.properties['left'];
                        if (valLeft > 0 && valLeft < 6) {
                            trueOffsetX = 50 - thresholds[valLeft - 1];
                        }
                        break;
                    case 'right':
                        var newTile = this.scene.map.getTileAtWorldXY(this.x + 50, this.y);
                        let valRight = newTile.properties['right'];
                        if (valRight > 0 && valRight < 6) {
                            trueOffsetX = (50 - thresholds[valRight - 1]) * -1;
                        }
                        break;
                    case 'down':
                        var newTile = this.scene.map.getTileAtWorldXY(this.x, this.y + 50);
                        let valDown = newTile.properties['down'];
                        if (valDown > 0 && valDown < 6) {
                            trueOffsetY = (50 - thresholds[valDown - 1]) * -1;
                        }
                        break;
                    case 'up':
                        var newTile = this.scene.map.getTileAtWorldXY(this.x, this.y - 50);
                        let valUp = newTile.properties['up'];
                        if (valUp > 0 && valUp < 6) {
                            trueOffsetY = 50 - thresholds[valUp - 1];
                        }
                        break;
                    default:
                        break;
                }

                this.targetPosition = {
                    x: this.x + offset.x + trueOffsetX,
                    y: this.y + offset.y + trueOffsetY
                };
            }
            else {
                this.alignMode = true;
            }

            //  If no path exists, start ghost movement after a delay.
            if (!this.currentPath) {
                if (!this.ghostTimer || this.ghostTimer.getElapsed() == this.elapsedTime) {
                    this.elapsedTime = Math.random() * (10000 - 5000) + 5000;
                    this.ghostTimer = this.scene.time.delayedCall(this.elapsedTime, this.startGhostMovement, [], this);
                }
            }
        }
    }

    /**
     * Gets new direction for enemy to move in.
     * 
     * Used when no direct path is found between enemy and goal.
     * 
     * @param {*} goal 
     * @returns {string} Direction for enemy to move in.
     */
    getNextDirection(goal, currentTile) {
        //  Keeps track of the directions the enemy COULD move towards
        let availableDirections = [];

        //  Get the distance between this enemy and the goal (X and Y)
        let length_dist = goal.x - this.x;
        let width_dist = goal.y - this.y;
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
        //  If more tunnels are available, or a tunnel ends, change the enemy's movement relative to the goal's
        else {
            //  Reduce X-axis distance between enemy and goal (if X distance is greater than Y)
            if (Math.abs(length_dist) > Math.abs(width_dist)) {
                temp_dir = length_dist < 0 ? 'left' : 'right';
                if (availableDirections.includes(temp_dir)) {
                    return temp_dir;
                }
            }
            //  Reduce Y-axis distance between enemy and goal (if Y distance is greater than X)
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
     * Used to find a path between enemy and goal.
     * 
     * If a path is found, gets a new direction for enemy to move in.
     * @param {Player} goal 
     * @returns {String} Direction for enemy to move in.
     */
    getNextDirectionInPath(goal) {
        this.currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y);
        if (this.direction) {
            switch (this.direction) {
                case 'left':
                    break;
                case 'right':
                    this.currentTile = this.scene.map.getTileAtWorldXY(this.x + 49, this.y);
                    break;
                case 'up':
                    break;
                case 'down':
                    this.currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y + 49);
                    break;
                default:
                    break;
            }
        }


        if (goal == this.scene.player) {
            let tileCoords = null;
            switch (goal.direction) {
                case 'left':
                    tileCoords = this.scene.map.worldToTileXY(goal.getCenter().x - 25, goal.getCenter().y);
                    break;
                case 'right':
                    tileCoords = this.scene.map.worldToTileXY(goal.getCenter().x + 24, goal.getCenter().y);
                    break;
                case 'up':
                    tileCoords = this.scene.map.worldToTileXY(goal.getCenter().x, goal.getCenter().y - 25);
                    break;
                case 'down':
                    tileCoords = this.scene.map.worldToTileXY(goal.getCenter().x, goal.getCenter().y + 24);
                    break;
                default:
                    tileCoords = this.scene.map.worldToTileXY(goal.getCenter().x, goal.getCenter().y);
                    break;
            }
            var goalTile = this.scene.map.getTileAtWorldXY(tileCoords.x * 50, tileCoords.y * 50);
        }
        else {
            var goalTile = this.scene.map.getTileAtWorldXY(goal.x, goal.y);
        }

        if (!this.currentTile || !goalTile) {
            console.log(this.currentTile, this.x, this.y);
            console.log(goalTile);
            this.redirectTile = this.getNeighboringTiles();
            if (this.redirectTile) {
                this.redirectMode = true;
                console.log("Starting Enemy Redirect Move");
                return 'left';
            }
            else {
                //  If all fails, just kill the enemy
                this.isDestroyed = true;
                return 'left'
            }
        }

        // 1. Check available directions from current tile
        const directions = [];
        const dirMap = {
            up: { dx: 0, dy: -1, prop: 'up' },
            down: { dx: 0, dy: 1, prop: 'down' },
            left: { dx: -1, dy: 0, prop: 'left' },
            right: { dx: 1, dy: 0, prop: 'right' }
        };

        for (const [key, { dx, dy, prop }] of Object.entries(dirMap)) {
            const neighbor = this.scene.map.getTileAt(this.currentTile.x + dx, this.currentTile.y + dy);
            if (neighbor && neighbor.properties[prop] > 0) {
                directions.push(key);
            }
        }

        // 2. If there are 1 or 2 tunnel directions, keep going the same way (if possible)
        if (directions.length <= 2 && this.direction && directions.includes(this.direction)) {
            return this.direction;
        }

        // Only update path if player moved to a new tile
        if (goal == this.scene.player) {
            if (!this.lastPlayerTile || this.lastPlayerTile.x !== goalTile.x || this.lastPlayerTile.y !== goalTile.y) {
                this.currentPath = this.searchPath(this.currentTile, goalTile);
                this.currentPathIndex = 1;
                this.lastPlayerTile = { x: goalTile.x, y: goalTile.y };
                this.hasFoundPlayer = this.currentPath ? true : false;
            }
        }
        else {
            this.currentPath = this.searchPath(this.currentTile, goalTile);
            this.currentPathIndex = 1;
            this.hasFoundPlayer = this.currentPath ? true : false;
        }

        if (!this.currentPath) {
            this.hasFoundPlayer = false;
            return this.getNextDirection(goal, this.currentTile);
        }
        // Only increment when we *reach* the target tile
        else if (this.currentTile == goalTile) {
            if (this.isEscaping) {
                this.escapeMode = true;
                return "left";
            }
            this.currentPathIndex = 0;
            return this.getNextDirection(goal, this.currentTile);
        }
        else if (this.currentPath.length < 2) {
            return this.getNextDirection(goal, this.currentTile);
        }

        const nextTile = this.currentPath[this.currentPathIndex++];

        if (nextTile) {
            if (nextTile.x < this.currentTile.x) return 'left';
            if (nextTile.x > this.currentTile.x) return 'right';
            if (nextTile.y < this.currentTile.y) return 'up';
            if (nextTile.y > this.currentTile.y) return 'down';
        }

        return this.getNextDirection(goal, this.currentTile);
    }

    /**
     * Damages the hit enemy
     * 
     * @returns {boolean} True if the enemy's health reaches 0 (died), otherwise false.
     */
    takeDamage() {
        if (this.health > 1) {
            this.health -= 1;
            return false;
        }
        return true;
    }

    /**
     * Searches for a path from this to goal using A* algorithm.
     * @param {*} startTile The enemy's starting position
     * @param {*} endTile The enemy's goal
     * @returns {Array} Path from enemy to goal.
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

    /**
     * Sets this enemy to be in ghost mode.
     */
    startGhostMovement() {
        try {
            if (!this.hasFoundPlayer) {
                this.targetPosition = null;
                this.ghostMode = true;
                this.lastTile = this.scene.map.getTileAtWorldXY(this.x, this.y);
                //  End ghost movement (USED FOR TESTING)
                //this.ghostTimer = this.scene.time.delayedCall(5000, this.endGhostMovement, [], this);
            }
        } catch (error) {
            console.warn("Enemy.js generic error (ignore)")
        }
    }

    /**
     * Sets this enemy to be in normal mode.
     * @note ⚠️ FOR TESTING PURPOSES ONLY
     */
    endGhostMovement() {
        if (!this.hasFoundPlayer) {
            this.ghostMode = false;
            this.setVelocity(0);
            this.ghostTimer = this.scene.time.delayedCall(1000, this.startGhostMovement, [], this);
        }
    }

    /**
     * Enemy moves through walls until having reached a dug out tile.
     * 
     * Enemy moves towards the goal.
     * @param {*} goal 
     */
    ghostMove(goal) {
        this.scene.physics.moveToObject(this, goal, 60);
        if (this.anims.animationManager.exists(this.animationKey)) {
            this.play(this.animationKey, true);
        }

        let newTile = this.scene.map.getTileAtWorldXY(this.x + 25, this.y + 25)
        let availableTiles = [];

        //  Ensures the enemy's current tile is NOT next to the tile it first entered ghost mode from
        if (Math.abs(this.lastTile.x - this.x) >= 50 || Math.abs(this.lastTile.y - this.y) >= 50) {
            //  Get the tunnels surrounding the enemy
            let upTile = this.scene.map.getTileAt(this.lastTile.x, this.lastTile.y - 1);    // Tile above
            let downTile = this.scene.map.getTileAt(this.lastTile.x, this.lastTile.y + 1);  // Tile below
            let leftTile = this.scene.map.getTileAt(this.lastTile.x - 1, this.lastTile.y);  // Tile to the left
            let rightTile = this.scene.map.getTileAt(this.lastTile.x + 1, this.lastTile.y); // Tile to the right

            //  Push the tiles into the array if possible
            if (upTile && upTile.properties['up'] > 0) {
                availableTiles.push(upTile);
            }
            if (downTile && downTile.properties['down'] > 0) {
                availableTiles.push(downTile);
            }
            if (leftTile && leftTile.properties['left'] > 0) {
                availableTiles.push(leftTile);
            }
            if (rightTile && rightTile.properties['right'] > 0) {
                availableTiles.push(rightTile);
            }
        }

        /*
        Get out of ghost mode if:
            - New tile is not the enemy's current tile
            - New tile is traversable in any 1 of the 4 directions
            - New tile is not one of the surrounding tiles from where the enemy first began ghost mode
        */
        if (newTile !== this.lastTile && Object.values(newTile.properties).some(value => value == 6) && !availableTiles.find(tile => tile == newTile)) {
            this.setVelocity(0);
            this.ghostMode = false;
            this.ghostAlignMode = true;
            this.direction = null;
        }
    }

    /**
     * Adjusts enemy's position to get closer to the new tile's center
     * 
     * Used when the enemy is getting out of ghost mode
     */
    ghostAlignMove() {
        let tile = this.scene.map.getTileAtWorldXY(this.x + 25, this.y + 25);
        if (tile) {
            const targetX = tile.x * 50 + 25;
            const targetY = tile.y * 50 + 25;

            const tolerance = 1; // acceptable drift in pixels

            const diffX = targetX - (this.x + 25);
            const diffY = targetY - (this.y + 25);

            // If not centered, move to center
            if (Math.abs(diffX) > tolerance || Math.abs(diffY) > tolerance) {
                const newX = Math.abs(diffX) > tolerance ? this.x + Math.sign(diffX) : this.x;
                const newY = Math.abs(diffY) > tolerance ? this.y + Math.sign(diffY) : this.y;
                this.setPosition(newX, newY);
            }
            // If centered, stop align mode and go to normal movement
            else {
                this.setPosition(targetX - 25, targetY - 25); // Snap exactly to center
                this.direction = null;
                this.ghostAlignMode = false;
            }

            if (this.anims.animationManager.exists(this.animationKey)) {
                this.play(this.animationKey, true);
            }
        }
    }

    /**
     * Adjusts enemy's position to get closer to the new tile's center
     * 
     * Used when the enemy is not properly centered in a tile in normal mode
     * @param {String} direction 
     */
    alignMove(direction) {
        let currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y);
        switch (direction) {
            case 'left':
                break;
            case 'right':
                currentTile = this.scene.map.getTileAtWorldXY(this.x + 49, this.y);
                break;
            case 'up':
                break;
            case 'down':
                currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y + 49);
                break;
            default:
                break;
        }

        if (currentTile) {
            const targetX = currentTile.x * 50 + 25;
            const targetY = currentTile.y * 50 + 25;

            const tolerance = 2; // acceptable drift in pixels

            const diffX = targetX - (this.x + 25);
            const diffY = targetY - (this.y + 25);

            const speed = this.baseSpeed; // or this.isSlowed ? slowedSpeed : this.baseSpeed

            // If not centered, move to center using baseSpeed
            if (Math.abs(diffX) > tolerance || Math.abs(diffY) > tolerance) {
                const stepX = Math.abs(diffX) > tolerance ? Phaser.Math.Clamp(diffX, -speed, speed) : 0;
                const stepY = Math.abs(diffY) > tolerance ? Phaser.Math.Clamp(diffY, -speed, speed) : 0;

                const newX = this.x + stepX;
                const newY = this.y + stepY;

                this.setPosition(newX, newY);
            }
            // If centered, stop align mode and go to normal movement
            else {
                this.setPosition(targetX - 25, targetY - 25); // Snap exactly to center
                this.targetPosition = null;
                this.alignMode = false;
            }

            if (this.anims.animationManager.exists(this.animationKey)) {
                this.play(this.animationKey, true);
            }
        }
    }

    /**
     * Enemy moves off screen to the left.
     */
    escapeMove() {
        const speed = this.isSlowed ? 1 : this.baseSpeed;

        const dx = -49 - this.x;
        const dy = 100 - this.y;

        const stepX = Phaser.Math.Clamp(dx, -speed, speed);
        const stepY = Phaser.Math.Clamp(dy, -speed, speed);

        this.setPosition(this.x + stepX, this.y + stepY);
        if (this.anims.animationManager.exists(this.animationKey)) {
            this.play(this.animationKey, true);
        }

        if (this.x == -49) {
            this.scene.enemyWin();
        }
    }

    getNeighboringTiles() {
        let currentTile = this.scene.map.getTileAtWorldXY(this.x, this.y);
        let tileX = currentTile.x;
        let tileY = currentTile.y;

        // Define directions and their offsets
        const directions = [
            { name: 'up', dx: 0, dy: -1 },
            { name: 'down', dx: 0, dy: 1 },
            { name: 'left', dx: -1, dy: 0 },
            { name: 'right', dx: 1, dy: 0 }
        ];

        let targetTile = null;
        for (let dir of directions) {
            let neighbor = this.scene.map.getTileAt(tileX + dir.dx, tileY + dir.dy, false, 'Ground');
            if (neighbor && neighbor.properties) {
                // Check if any directional property is > 0
                if (
                    (neighbor.properties.up > 0) ||
                    (neighbor.properties.down > 0) ||
                    (neighbor.properties.left > 0) ||
                    (neighbor.properties.right > 0)
                ) {
                    targetTile = neighbor;
                    break; // Stop at the first match
                }
            }
        }

        return targetTile;
    }

    redirectMove() {
        const targetX = this.redirectTile.x * 50 + 25;
        const targetY = this.redirectTile.y * 50 + 25;

        const tolerance = 1; // acceptable drift in pixels

        const diffX = targetX - (this.x + 25);
        const diffY = targetY - (this.y + 25);

        // If not centered, move to center
        if (Math.abs(diffX) > tolerance || Math.abs(diffY) > tolerance) {
            const newX = Math.abs(diffX) > tolerance ? this.x + Math.sign(diffX) : this.x;
            const newY = Math.abs(diffY) > tolerance ? this.y + Math.sign(diffY) : this.y;
            this.setPosition(newX, newY);
        }
        // If centered, stop redirect mode and go to normal movement
        else {
            this.setPosition(targetX - 25, targetY - 25); // Snap exactly to center
            this.direction = null;
            this.redirectMode = false;
        }

        if (this.anims.animationManager.exists(this.animationKey)) {
            this.play(this.animationKey, true);
        }
    }
}