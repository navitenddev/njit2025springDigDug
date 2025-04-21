import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";
import Rock from "../entities/Rock.js";
import Bullets from "../entities/Bullets.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }
    init(data){
        this.level = data.level || 1 ; //Default 1
    }

    create() {

        /*
        * Launching the scene so the ingameUI can be scene while the game is being played
        * this.score & visitedTiles is needed in order to record the score
        * this.highScore needed to save the score to localstorage if currentscore surpasses highscore
        */
        this.scene.launch('GameUI')
        this.score = 0;
        this.visitedTiles = new Set();
        this.highScore = parseInt(localStorage.getItem("highScore")) || 0;

        // Create tilemap
        this.map = this.make.tilemap({ key: `map${this.level}` });
        const tileset = this.map.addTilesetImage("ground_tiles", "tiles");
        const groundLayer = this.map.createLayer("Ground", tileset, 0, 0);

        // Create player object & added amount of lives to player
        this.lives = 3;
        this.player = new Player(this, 100, 450).setOrigin(0, 0);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.body.setAllowGravity(false);

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Collision with ground layer
        this.physics.add.overlap(this.player, groundLayer, () => {
            this.updateTile(this.map, groundLayer);
        });


        //  Player movement animations
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 10
        });

        this.rt = this.make.renderTexture({
            x: 300, y: 400,
            width: this.map.widthInPixels,
            height: this.map.heightInPixels,
            add: false
        });
        this.mask = new Phaser.Display.Masks.BitmapMask(this, this.rt);
        this.mask.invertAlpha = true;
        groundLayer.setMask(this.mask);

        //  Create enemy tunnels and enemies group
        this.digEnemyTunnels(this.map, groundLayer);
        this.enemyGroup = this.physics.add.group({
            allowGravity: false
        });
        this.enemyGroup.isActive = false;

        //  Create rocks group
        this.rockGroup = this.physics.add.group({
            allowGravity: false
        })

        //  Spawn enemies and rocks
        this.spawnEntities(this.map, this.enemyGroup, this.rockGroup);

        //  Activate enemy movement
        this.enemyGroup.isActive = true;

        //  Initialize Bullets Group
        this.bullets = new Bullets(this);
        this.physics.add.overlap(this.bullets, this.enemyGroup, this.handleBulletEnemyCollision, null, this);
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.bullets.fireBullet(this.player.x, this.player.y, this.player.direction);
        });
      
        /*
        * Overlap check when a player comes into contact with an enemy
        * This overlap check must be put after the player and enemy has been created
        */
        this.physics.add.overlap(this.player, this.enemyGroup, this.handlePlayerHit, null, this);

        //  Player hit collision with rock
        this.physics.add.overlap(this.player, this.rockGroup, this.handleRockHitEntity, null, this);

        //  Enemy hit collision with rock
        this.physics.add.overlap(this.enemyGroup, this.rockGroup, this.handleRockHitEntity, null, this);

        this.powerups = this.physics.add.group();

        // Create a test powerup somewhere in the map
        this.slowdownPowerups = this.physics.add.group({allowGravity: false});

        const powerup = this.slowdownPowerups.create(200, 500, "powerup_slowdown");
        powerup.setOrigin(0, 0);
        powerup.body.setSize(40, 40, true);

        this.physics.add.overlap(this.player, this.slowdownPowerups, this.activateSlowdown, null, this);
    }

    update() {
        this.player.handleInput(this.cursors, this.wasdKeys);

        this.enemyGroup.getChildren().forEach(enemy => {
            if (enemy.isActive) {
                enemy.update(this.player);
            }
        });

        this.rockGroup.getChildren().forEach(rock => {
            rock.update(this.player);
        })
    }

    /**
     * handleBulletEnemyCollision - handle enemy damage if hit by a bullet
     * @param {*} bullet 
     * @param {*} enemy 
     */
    handleBulletEnemyCollision(bullet, enemy) {
        if (!bullet.active) return; // Safety check
        bullet.setActive(false);
        bullet.setVisible(false);

        enemy.takeDamage();
        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 500,
            ease: 'Linear',
            onStart: () => {
                enemy.isActive = false;
            },
            onComplete: () => {
                enemy.isActive = true;
            }
        });
    }

    /**
     * digEnemyTunnels - digs out the preset tunnels which the enemies first spawn in
     * @param {Phaser.Tilemaps.Tilemap} map - The current map
     */
    digEnemyTunnels(map, layer) {
        let coordX;
        let coordY;
        map.forEachTile(tile => {
            coordX = tile.x * map.tileWidth;
            coordY = tile.y * map.tileHeight;
            if (tile.properties['left'] > 0) {
                this.rt.drawFrame("mask_tileset", 11, coordX, coordY);
            }
            if (tile.properties['right'] > 0) {
                this.rt.drawFrame("mask_tileset", 5, coordX, coordY);
            }
            if (tile.properties['up'] > 0) {
                this.rt.drawFrame("mask_tileset", 17, coordX, coordY);
            }
            if (tile.properties['down'] > 0) {
                this.rt.drawFrame("mask_tileset", 23, coordX, coordY);
            }
        }, this, 0, 0, 12, 16, null, layer);
    }

    /**
     * spawnEntities - creates and places new enemies and rocks in their preset locations on the tilemap
     * @param {Phaser.Tilemaps.Tilemap} map
     * @param {Phaser.Physics.group} enemyGroup - The enemies container
     * @param {Phaser.Physics.group} rockGroup - The rocks container
     */
    spawnEntities(map, enemyGroup, rockGroup) {
        let coordX;
        let coordY;
        map.forEachTile(tile => {
            if (tile.index === -1) return;

            coordX = tile.x * map.tileWidth;
            coordY = tile.y * map.tileHeight;

            //  Create a rock entity
            if (tile.properties['entity_name'] == "rock") {
                let rock = new Rock(this, coordX, coordY, tile.properties['entity_name'], rockGroup).setOrigin(0.5, 0.5);
                rockGroup.add(rock);
            }

            //  Create an enemy entity
            if (tile.properties['entity_name'].length !== 0 && tile.properties['entity_name'] !== "rock") {
                let enemy = new Enemy(this, coordX, coordY, tile.properties['entity_name'], enemyGroup).setOrigin(0, 0);
                enemyGroup.add(enemy);
            }
        }, this, 0, 0, 12, 16, null, "Entities");
    }

    /*
    * If a player is hit by the enemy, it gives them invulnerability for a short time
    * Duration of the invulnerability can be changed
    * SUBJECT TO CHANGE: upon player having no lives the scene restarts.
    */
    handlePlayerHit(player) {
        if (!player.invulnerable) {
            this.lives--;
            this.game.events.emit("updateLives", this.lives);

            // Temporary invulnerability

            player.invulnerable = true;
            this.tweens.add({
                targets: player,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    player.setAlpha(1);
                    player.invulnerable = false;
                }
            });

            if (this.lives <= 0) {

                // Save high score to localStorage
                const prevHighScore = parseInt(localStorage.getItem("highScore")) || 0;
                if (this.score > prevHighScore) {
                    localStorage.setItem("highScore", this.score);
                }
                this.scene.stop('GameUI');
                this.scene.restart();
            }
        }
    }

    activateSlowdown(player, powerup) {
        powerup.destroy(); // remove from game
    
        // Slow all enemies
        this.enemyGroup.getChildren().forEach(enemy => {
            enemy.isSlowed = true;
        });
    
        // Optional: add tint or UI effect
        this.enemyGroup.children.iterate(enemy => {
            enemy.setTint(0x9999ff); // light blue tint while slowed
        });
    
        // Reset slowdown after 5 seconds
        this.time.delayedCall(5000, () => {
            this.enemyGroup.getChildren().forEach(enemy => {
                enemy.isSlowed = false;
                enemy.clearTint();
            });
        });
    }
    
    handleRockHitEntity(entity, rock) {
        if (entity == this.player) { this.handlePlayerHit(entity); }
        else {
            entity.isActive = false;
            entity.destroy();
        }
        rock.destroy();
    }

    /*
    * Changes tile texture (applies bitmask) when player walks over an undiscovered tile
    * If this tile hasn't been discovered yet, add to set and give 10 points
    * Emit score update to UI
    */
    updateTile(map) {
        let currentTile = this.getPlayerTile(map, this.player.direction);

        if (currentTile) {

            const tileKey = `${currentTile.x},${currentTile.y}`;

            if (!this.visitedTiles.has(tileKey)) {
                this.visitedTiles.add(tileKey);
                this.score += 10;

                this.game.events.emit("updateScore", this.score);

                // Check if new high score
                if (this.score > this.highScore) {
                    this.highScore = this.score;

                    // Save new high score to localStorage
                    localStorage.setItem("highScore", this.highScore);

                    // Emit update to GameUI
                    this.game.events.emit("updateHighScore", this.highScore);
                }
            }
            this.changeTileTexture(map, currentTile, this.player.direction);
            this.player.lastTile = currentTile;
        }
    }

    //  Returns the tile the player is currently moving INTO.
    getPlayerTile(map, direction) {
        let tileCoords = null;

        //  Base Case: player isn't moving into a tile, therefore return null.
        if (this.player.x % 50 == 0 && this.player.y % 50 == 0) {
            return null;
        }

        switch (direction) {
            case 'left':
                tileCoords = map.worldToTileXY(this.player.getCenter().x - 25, this.player.getCenter().y);
                break;
            case 'right':
                tileCoords = map.worldToTileXY(this.player.getCenter().x + 25, this.player.getCenter().y);
                break;
            case 'up':
                tileCoords = map.worldToTileXY(this.player.getCenter().x, this.player.getCenter().y - 25);
                break;
            case 'down':
                tileCoords = map.worldToTileXY(this.player.getCenter().x, this.player.getCenter().y + 25);
                break;
            default:
                return null;
        }
        const tile = map.getTileAt(tileCoords.x, tileCoords.y, false, map.groundLayer);
        return tile;
    }

    //  Draws the appropriate mask over the tile the player is moving in.
    changeTileTexture(map, tile, direction) {
        let newTexture = null;
        let thresholds = [8, 16, 24, 32, 40, 46]

        let offsetX = null;
        let offsetY = null;

        let offsetTexture = null;
        let shermieMaskFrame = null;

        //  Depending on which direction the player is moving, we need to extract a different 
        //  frame from their respective tile and shermie mask tilesets.
        switch (direction) {
            case 'right':
                offsetX = 25;
                offsetTexture = 0;
                shermieMaskFrame = 0;
                break;
            case 'left':
                offsetX = -25;
                offsetTexture = 6;
                shermieMaskFrame = 1;
                break;
            case 'up':
                offsetY = -25;
                offsetTexture = 12;
                shermieMaskFrame = 2;
                break;
            case 'down':
                offsetY = 25;
                offsetTexture = 18;
                shermieMaskFrame = 3;
                break;
            default: return;
        }

        let tileWorldXY = map.tileToWorldXY(tile.x, tile.y);
        let playerCoord = offsetX ? this.player.getCenter().x + offsetX : this.player.getCenter().y + offsetY;
        let tileCoord = offsetX ? tileWorldXY.x : tileWorldXY.y;

        //  If TRUE:  player is moving RIGHT or DOWN
        //  If FALSE: player is moving LEFT or UP
        let isPositive = (offsetX || offsetY) > 0;

        //  Checks if the player is within a specific threshold in the tile.
        for (let i = 0; i < thresholds.length; i++) {
            if ((isPositive && playerCoord <= tileCoord + thresholds[i]) || (!isPositive && playerCoord >= tileCoord + thresholds[thresholds.length - i - 1])) {
                newTexture = i + 1;
                break;
            }
        }

        //  If-Statement prevents multiple drawFrame calls
        if (newTexture && newTexture > tile.properties[direction]) {
            this.rt.drawFrame("shermie_mask", shermieMaskFrame, this.player.x, this.player.y)
            this.rt.drawFrame("mask_tileset", newTexture + offsetTexture - 1, tileWorldXY.x, tileWorldXY.y);
            tile.properties[direction] += 1;
        }

        //  Update the tile the player has just exited
        if (this.player.lastTile && tile !== this.player.lastTile) {
            if (this.player.direction == 'left') {
                this.player.lastTile.properties['right'] = this.player.lastTile.properties['left'] == 6 || this.player.lastTile.properties['up'] == 6 || this.player.lastTile.properties['down'] == 6 ? 6 : this.player.lastTile.properties['right'];
            }
            else if (this.player.direction == 'right') {
                this.player.lastTile.properties['left'] = this.player.lastTile.properties['right'] == 6 || this.player.lastTile.properties['up'] == 6 || this.player.lastTile.properties['down'] == 6 ? 6 : this.player.lastTile.properties['left'];
            }
            else if (this.player.direction == 'up') {
                this.player.lastTile.properties['down'] = this.player.lastTile.properties['up'] == 6 || this.player.lastTile.properties['left'] == 6 || this.player.lastTile.properties['right'] == 6 ? 6 : this.player.lastTile.properties['down'];
            }
            else if (this.player.direction == 'down') {
                this.player.lastTile.properties['up'] = this.player.lastTile.properties['down'] == 6 || this.player.lastTile.properties['left'] == 6 || this.player.lastTile.properties['right'] == 6 ? 6 : this.player.lastTile.properties['up'];
            }
        }
    }
}
