import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";
import Rock from "../entities/Rock.js";
import Bullets from "../entities/Bullets.js";
import Bullet from "../entities/Bullet.js";
import TechnoWorm from "../entities/TechnoWorm.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }
    init(data) {
        this.level = data.level || 1; //Default 1
    }

    create() {

        /*
        * Launching the scene so the ingameUI can be scene while the game is being played
        * this.score & visitedTiles is needed in order to record the score
        * this.highScore needed to save the score to localstorage if currentscore surpasses highscore
        */
        this.scene.launch('GameUI', { level: this.level });
        this.isShuttingDown = false;
        this.score = 0;
        this.visitedTiles = new Set();
        this.highScore = parseInt(localStorage.getItem("highScore")) || 0;

        // Create tilemap
        this.map = this.make.tilemap({ key: `map${this.level}` });
        const groundTileset = this.map.addTilesetImage("ground_tileset", "tiles");
        const groundLayer = this.map.createLayer("Ground", groundTileset, 0, 0);

        // Create player object & added amount of lives to player
        this.lives = 3;
        this.player = this.level == 1 ? new Player(this, 575, 125).setOrigin(0.5, 0.5) : new Player(this, 325, 425).setOrigin(0.5, 0.5);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.body.setAllowGravity(false);

        //  Create escape goal entity
        this.goal = this.add.sprite(0, 100, "goal").setOrigin(0, 0);
        this.goal.visible = false;

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
        this.digTunnels(this.map);
        this.enemyGroup = this.physics.add.group({
            allowGravity: false
        });
        this.enemyGroup.isActive = false;
        this.remainingEnemies = 0

        //  Create rocks group
        this.rockGroup = this.physics.add.group({
            allowGravity: false
        })

        // Corrupted CD Enemy movement animation
        this.anims.create({
            key: 'cd_enemy',
            frames: this.anims.generateFrameNumbers('cd_enemy', { start: 0, end: 1 }),
            frameRate: 10
        });

        //  Initialize Player Bullets Group
        this.playerBullets = new Bullets(this, 1);
        this.playerBulletsCollider = this.physics.add.overlap(this.playerBullets, this.enemyGroup, this.handleBulletHitEntity, null, this);
        this.input.keyboard.on('keydown-SPACE', (event) => {
            if (!this.isShuttingDown) {
                this.playerBullets.fireBullet(this.player.x, this.player.y, this.player.direction, this.player);
            }
        });

        //  Initialize Enemy Bullets Group
        this.enemyBullets = new Bullets(this, 50);
        this.physics.add.overlap(this.enemyBullets, this.player, this.handleBulletHitEntity, null, this);

        //  Spawn enemies and rocks
        this.rockKills = 0;
        this.spawnEntities(this.map, this.enemyGroup, this.rockGroup, this.enemyBullets);

        /*
        * Overlap check when a player comes into contact with an enemy
        * This overlap check must be put after the player and enemy has been created
        */
        this.physics.add.overlap(this.player, this.enemyGroup, this.handlePlayerHit, null, this);

        //  Player hit collision with rock
        this.physics.add.overlap(this.player, this.rockGroup, this.handleRockHitEntity, null, this);

        //  Enemy hit collision with rock
        this.physics.add.overlap(this.enemyGroup, this.rockGroup, this.handleRockHitEntity, null, this);

        this.powerups = this.physics.add.group({
            allowGravity: false
        });
        this.physics.add.overlap(this.player, this.powerups, (player, powerup) => {
            if (powerup.type === 'powerup_slowdown') this.activateSlowdown(player, powerup);
            if (powerup.type === 'powerup_teleport') this.activateTeleport(player, powerup);
            if (powerup.type === 'powerup_rapidfire') this.activateRapidFire(player, powerup);

            this.powerupSound.play();
        });

        this.lastTwoPowerups = []; // keep track of last two

        this.time.addEvent({
            delay: Phaser.Math.Between(4000, 6000),
            callback: () => {
                const types = ['powerup_slowdown', 'powerup_teleport', 'powerup_rapidfire'];

                let filtered = types.filter(type => {
                    // Allow it only if not repeated twice
                    return !(this.lastTwoPowerups[0] === type && this.lastTwoPowerups[1] === type);
                });

                // Fallback in case all are filtered out (shouldn't happen with only 2 powerups)
                if (filtered.length === 0) {
                    filtered = types;
                }

                const chosen = Phaser.Utils.Array.GetRandom(filtered);

                // Update history
                this.lastTwoPowerups.push(chosen);
                if (this.lastTwoPowerups.length > 2) {
                    this.lastTwoPowerups.shift();
                }

                if (this.powerups.getChildren().length < 3 && !this.player.controlsDisabled && !this.isShuttingDown) {
                    this.spawnPowerup(chosen);
                }
            },
            loop: true
        });

        //  Start Shermie's auto move path (only for the first level)
        this.player.controlsDisabled = true;
        if (this.level == 1) {
            this.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 2200,
                ease: 'Linear',
                onStart: () => {
                    this.sound.play("level_1_start", { volume: 0.5 });
                },
                onUpdate: () => {
                    if (this.player.getBounds().x !== 300) {
                        this.player.move('left', false);
                    }
                },
                onComplete: () => {
                    this.tweens.addCounter({
                        from: 0,
                        to: 1,
                        duration: 3500,
                        ease: 'Linear',
                        onUpdate: () => {
                            if (this.player.getBounds().y !== 400) {
                                this.player.move('down', false);
                            }
                            else {
                                //  Update Shermie rotation
                                this.player.flipX = false;
                                this.player.angle = 0;
                                this.player.direction = 'left';
                            }
                        },
                        onComplete: () => {
                            //  Activate user controls
                            this.player.controlsDisabled = false;

                            //  Activate enemy movement
                            this.enemyGroup.isActive = true;
                        }
                    });
                }
            });
        }
        else {
            this.time.delayedCall(2500, () => {
                this.player.direction = 'left';

                //  Activate user controls
                this.player.controlsDisabled = false;

                //  Activate enemy movement
                this.enemyGroup.isActive = true;
            });
        }

        //  Initialize Shermie movement music
        this.shermieMusic = this.sound.add("retro_music_1", { volume: 0.2 });
        this.shermieMusic.setLoop(true);

        //  Initialize Shermie take damage sound
        this.shermieHitSound = this.sound.add("shermie_take_dmg", { volume: 0.2 });

        //  Initialize Powerup pick up sound
        this.powerupSound = this.sound.add("pickup", { volume: 0.5 });
    }

    update() {
        if (!this.isShuttingDown) {
            this.player.handleInput(this.cursors, this.wasdKeys);

            this.enemyGroup.getChildren().forEach(enemy => {
                if (enemy.isActive) {
                    if (this.enemyGroup.getLength() == 1) {
                        enemy.isEscaping = true;
                        enemy.update(this.goal);
                    }
                    else {
                        try {
                            enemy.update(this.player);
                        } catch (error) {
                            console.log("ERROR UPDATING ENEMY, ", this.player);
                        }
                    }
                }
            });

            this.rockGroup.getChildren().forEach(rock => {
                rock.update(this.player);
            })
        }
    }

    /**
     * Begin game scene shutdown
     * 
     * Stops all entity movement
     */
    shutdown() {
        this.isShuttingDown = true;

        try {
            this.enemyGroup.getChildren().forEach(enemy => {
                enemy.setVelocity(0, 0);
            });

            this.rockGroup.getChildren().forEach(rock => {
                rock.setVelocity(0, 0);
            })
            this.tweens.killAll();
        } catch (error) {
            console.warn("Error occurred trying to shutdown GameScene")
        }

        //  Stop all current sounds
        this.sound.stopAll();
    }

    enemyWin() {
        this.shutdown();

        //  Play game over sound before launching GameOver scene
        const gameOverSound = this.sound.add('game_over', { volume: 0.5 });
        gameOverSound.once('complete', () => {
            this.scene.launch('GameOverScene', { level: this.level, message: "Enemy Escaped" });
            this.scene.bringToTop('GameOverScene');
        });
        gameOverSound.play();
    }

    onAllEnemiesKilled() {
        console.log(`Level ${this.level} cleared!`);
        const next = this.level + 1;
        const max = parseInt(localStorage.getItem('maxUnlockedLevel'), 10) || 1;
        if (next > max && next <= 5) {
            localStorage.setItem('maxUnlockedLevel', next);
        }
        else if (next >= 6) {
            this.shutdown();
            this.scene.launch('BeatGame');
        }
        this.shutdown();

        //  Play level complete sound before launching LevelComplete scene
        const levelCompleteSound = this.sound.add("level_complete", { volume: 0.5 });
        levelCompleteSound.once('complete', () => {
            this.scene.launch('LevelCompleteScene', { level: this.level });
            this.scene.bringToTop('LevelCompleteScene');
        });
        levelCompleteSound.play({ delay: 0.5 });
    }

    /**
     * Emits score update event.
     * 
     * Also emits high score event if applicable.
     */
    updateScoreText() {
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

    /**
     * Display the points earned by the player for 1 second
     * 
     * @param {number} points - Number to be displayed
     * @param {number} coordX - Position in X-axis
     * @param {number} coordY - Position in Y-axis
     */
    showPointsPopup(points, coordX, coordY) {
        const pointsText = this.add.text(coordX, coordY, points.toString(), {
            fontSize: "20px",
            fill: "#ffffff",
            fontFamily: 'PressStart2P'
        });
        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                pointsText.destroy();
            }
        });
    }

    /**
     * handleBulletEntityCollision - handle enemy/player damage if hit by a bullet
     * @param {*} obj1 - bullet entity
     * @param {*} obj2 - enemy/player entity
     */
    handleBulletHitEntity(obj1, obj2) {
        //  Fixes an issue that mixes up the bullets with the entities.
        //  Not sure why it happens, but this works.
        const bullet = obj1 instanceof Bullet ? obj1 : obj2;
        const entity = obj2 instanceof Bullet ? obj1 : obj2;

        if (!bullet.active) return; // Safety check
        bullet.setActive(false);
        bullet.setVisible(false);

        if (entity == this.player) {
            this.handlePlayerHit(this.player);
        }
        else if (entity.takeDamage()) {
            let points = 0;
            let coordX = entity.x;
            let coordY = entity.y + 15;

            //  Update score depending on where the entity has died (Y-coord)
            if (entity.y >= 600) {
                points = 400;
            }
            else if (entity.y >= 450) {
                points = 300;
            }
            else if (entity.y >= 300) {
                points = 200;
            }
            else if (entity.y >= 100) {
                points = 100;
            }
            this.score += points;
            this.updateScoreText();

            //  Kill the entity
            entity.destroy();

            //  Play entity death sound
            this.sound.play("monster_hit", { volume: 0.3 });

            //  Show the points gained
            this.showPointsPopup(points, coordX, coordY);
        }
        else {
            this.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 500,
                ease: 'Linear',
                onStart: () => {
                    entity.isActive = false;
                },
                onComplete: () => {
                    entity.isActive = true;
                }
            });
        }

        try {
            if (bullet.firedBy && bullet.firedBy.rapidFire) {
                bullet.firedBy.canFire = true;
            }
            else {
                this.time.delayedCall(300, () => {
                    if (bullet.firedBy) {
                        bullet.firedBy.canFire = true;
                    }
                }, [], this);
            }
        } catch (error) {
            console.log("Error handled: resetting canFire of entity who fired bullet");
        }
    }

    /**
     * digTunnels - digs out the preset tunnels based on the current map's Tunnels layer
     * @param {Phaser.Tilemaps.Tilemap} map - The current map
     */
    digTunnels(map) {
        let coordX;
        let coordY;

        //  Iterate through each tile in the Tunnels layer
        map.forEachTile(tile => {
            if (!tile) return;

            coordX = tile.x * map.tileWidth;
            coordY = tile.y * map.tileHeight;

            // Check and copy each directional property if it exists
            ['left', 'right', 'up', 'down'].forEach(direction => {
                if (tile.properties[direction]) {
                    //  Set the correct directional property in the ground layer tile
                    const groundTile = this.map.getTileAtWorldXY(coordX, coordY, false, this.cameras.main, "Ground");
                    groundTile.properties[direction] = tile.properties[direction];

                    //  Visually dig out the tunnels
                    switch (direction) {
                        case 'left':
                            this.rt.drawFrame("mask_tileset", 11, coordX, coordY);
                            break;
                        case 'right':
                            this.rt.drawFrame("mask_tileset", 5, coordX, coordY);
                            break;
                        case 'up':
                            this.rt.drawFrame("mask_tileset", 17, coordX, coordY);
                            break;
                        case 'down':
                            this.rt.drawFrame("mask_tileset", 23, coordX, coordY);
                            break;
                        default:
                            break;
                    }
                }
            });
        }, this, 0, 0, 12, 16, null, "Tunnels");
    }

    /**
     * spawnEntities - creates and places new enemies and rocks in their preset locations on the tilemap
     * @param {Phaser.Tilemaps.Tilemap} map
     * @param {Phaser.Physics.group} enemyGroup - The enemies container
     * @param {Phaser.Physics.group} rockGroup - The rocks container
     * @param {Phaser.Physics.group} bulletsGroup - The enemy bullets container
     */
    spawnEntities(map, enemyGroup, rockGroup, bulletsGroup) {
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

            //  Create a basic enemy entity
            if (tile.properties['entity_name'] === "cd_enemy") {
                let enemy = new Enemy(this, coordX, coordY, 'cd_enemy', enemyGroup)
                    .setOrigin(0, 0);
                enemyGroup.add(enemy);

                // 3) Increment counter and listen for its destroy
                this.remainingEnemies++;
                enemy.on('destroy', () => {
                    if (!this.isShuttingDown) {
                        this.remainingEnemies--;
                        console.log(`Enemies remaining: ${this.remainingEnemies}`);
                        if (this.remainingEnemies == 0) {
                            this.onAllEnemiesKilled();
                        }
                    }
                });
            }

            //  Create a Techno Worm enemy entity
            if (tile.properties['entity_name'] == "worm_enemy") {
                let enemy = new TechnoWorm(this, coordX, coordY, enemyGroup, bulletsGroup).setOrigin(0, 0);
                enemyGroup.add(enemy);
                this.remainingEnemies++;
                enemy.on('destroy', () => {
                    if (!this.isShuttingDown) {
                        this.remainingEnemies--;
                        console.log(`Enemies remaining: ${this.remainingEnemies}`);
                        if (this.remainingEnemies == 0) {
                            this.onAllEnemiesKilled();
                        }
                    }
                });
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

            this.shermieHitSound.play();

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
                this.player.visible = false;
                this.shutdown();

                // Save high score to localStorage
                const prevHighScore = parseInt(localStorage.getItem("highScore")) || 0;
                if (this.score > prevHighScore) {
                    localStorage.setItem("highScore", this.score);
                }

                //  Play game over sound before launching GameOver scene
                const gameOverSound = this.sound.add('game_over', { volume: 0.5 });
                gameOverSound.once('complete', () => {
                    this.scene.launch('GameOverScene', { level: this.level, message: "You Died" });
                    this.scene.bringToTop('GameOverScene');
                });
                gameOverSound.play();
            }
        }
    }

    activateSlowdown(player, powerup) {
        this.game.events.emit("powerupActivated", "Slowdown");
        if (this.powerups.contains(powerup)) {
            powerup.destroy();
        }
        // Slow all enemies
        this.enemyGroup.getChildren().forEach(enemy => {
            enemy.isSlowed = true;
            enemy.setTint(0x9999ff);
        });

        // If there's already a slowdown tween running, kill it
        if (this.slowdownTween) {
            this.slowdownTween.remove(); // Cancels the tween immediately
        }

        // Start a new tween as a timer
        this.slowdownTween = this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 3000,
            onComplete: () => {
                this.enemyGroup.getChildren().forEach(enemy => {
                    enemy.isSlowed = false;
                    enemy.clearTint();
                });

                this.game.events.emit("clearPowerupLabel", "Slowdown");
                this.slowdownTween = null; // Clean up reference
            }
        });
    }


    activateTeleport(player, powerup) {
        this.game.events.emit("powerupActivated", "Teleport");

        // Fade out power-up label after effect ends
        this.game.events.emit("clearPowerupLabel", "Teleport");

        // Remove the powerup from the map
        if (this.powerups.contains(powerup)) {
            powerup.destroy();
        }

        if (this.visitedTiles.size === 0) {
            console.warn("No visited tiles to teleport to!");
            return;
        }

        // Pick a random tile from the visitedTiles set
        const tilesArray = Array.from(this.visitedTiles);
        const randomKey = Phaser.Utils.Array.GetRandom(tilesArray);
        const [x, y] = randomKey.split(',').map(Number);

        // ✅ Now x and y are integers
        const tile = this.map.getTileAt(x, y, true, "Ground");

        if (!tile || tile.index === -1) {
            console.warn("Could not find a valid tile at", x, y);
            return;
        }

        const worldX = tile.pixelX;
        const worldY = tile.pixelY;


        player.setPosition(Math.round(worldX) + 25, Math.round(worldY) + 25);

        player.targetPosition = null;
        player.moveQueue = null;
        player.direction = null;
    }

    activateRapidFire(player, powerup) {
        this.playerBullets = new Bullets(this, 3);

        this.game.events.emit("powerupActivated", "Rapidfire");
        if (this.powerups.contains(powerup)) {
            powerup.destroy();
        }

        // If there's already a rapid fire tween running, kill it
        if (this.rapidfireTween) {
            this.rapidfireTween.remove(); // Cancels the tween immediately
        }

        // Start a new tween as a timer
        this.rapidfireTween = this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 5000,
            onStart: () => {
                this.player.rapidFire = true;
                this.playerBullets = new Bullets(this, 4);
                this.playerBulletsCollider.destroy();
                this.playerBulletsCollider = this.physics.add.overlap(this.playerBullets, this.enemyGroup, this.handleBulletHitEntity, null, this);
            },
            onComplete: () => {
                this.game.events.emit("clearPowerupLabel", "Rapidfire");
                this.player.rapidFire = false;
                this.playerBullets = new Bullets(this, 1);
                this.playerBulletsCollider.destroy();
                this.playerBulletsCollider = this.physics.add.overlap(this.playerBullets, this.enemyGroup, this.handleBulletHitEntity, null, this);
                this.rapidfireTween = null; // Clean up reference
            }
        });
    }

    handleRockHitEntity(entity, rock) {
        if (rock.isMoving && rock.entityCollision) {
            if (entity == this.player) {
                this.handlePlayerHit(entity);
            }
            else {
                this.score += 1000;
                this.updateScoreText();
                this.showPointsPopup(1000, entity.x - 15, entity.y + 15)
                this.sound.play("monster_hit", { volume: 0.3 });
                entity.destroy();
            }
            rock.rockFallSound.stop();
            rock.destroy();
        }
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

            if (currentTile.y > 2 && !this.visitedTiles.has(tileKey)) {
                this.visitedTiles.add(tileKey);
                this.score += 10;
                this.updateScoreText();
            }
            this.changeTileTexture(map, currentTile, this.player.direction);
            this.player.lastTile = currentTile;
        }
    }

    spawnPowerup(type) {
        const validTiles = [];

        this.map.forEachTile(tile => {
            const isGroundLayer = tile.layer.name === "Ground";
            const isOnGrid = tile.pixelX % 50 === 0 && tile.pixelY % 50 === 0;
            const isNotSurface = tile.pixelY >= 150;
            const notOnPlayer = Math.floor(this.player.getBounds().x / 50) !== tile.x || Math.floor(this.player.getBounds().y / 50) !== tile.y;

            // Replace `tile.index > 0` with any specific dirt tile condition if needed
            const isDirt = tile.index > 0; // or tile.properties.isDirt === true

            if (isGroundLayer && isOnGrid && notOnPlayer && isDirt && isNotSurface) {
                validTiles.push(tile);
            }
        }, this, 0, 0, this.map.width, this.map.height);

        if (validTiles.length === 0) return;

        const tile = Phaser.Utils.Array.GetRandom(validTiles);
        const x = tile.pixelX + tile.width / 2;
        const y = tile.pixelY + tile.height / 2;

        const powerup = this.add.sprite(x, y, type).setOrigin(0.5);
        this.physics.world.enable(powerup);
        powerup.body.setAllowGravity(false);
        powerup.body.setSize(36, 36, true);
        this.powerups.add(powerup);
        powerup.type = type;
        this.powerups.add(powerup);
    }



    //  Returns the tile the player is currently moving INTO.
    getPlayerTile(map, direction) {
        let tileCoords = null;

        //  Base Case: player isn't moving into a tile, therefore return null.
        if (this.player.getBounds().x % 50 == 0 && this.player.getBounds().y % 50 == 0) {
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
            this.rt.drawFrame("shermie_mask", shermieMaskFrame, this.player.getBounds().x, this.player.getBounds().y)
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
