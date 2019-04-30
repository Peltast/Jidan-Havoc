define("Player", ['Actor', 'Tile', 'Prop', 'Enemy', 'Point', 'ParticleSystem'], function(Actor, Tile, Prop, Enemy, Point, ParticleSystem) {

    class Player extends Actor {

        constructor() {
            var playerSpriteData = {
                "spriteImage": gameAssets["Player"],
                "spriteCollision": new Point(24, 20),
                "spriteSize": new Point(32, 36),
                "spritePosition": new Point(4, 16)
            };
            super(2.5, 1, 1, playerSpriteData["spriteSize"], playerSpriteData);

            this.mass = 100;
            
            this.UIcolorNeutral = "#f2d3ab";
            this.UIcolorFail = "#b44440";
            this.UIcolorSuccess = "#6dffe4";
            this.UIstatus = -1;

            this.respawnStatus = -1;
            this.warpStatus = -1;
            this.frozen = false;
            this.warpPoint = null;

            this.state = "";
            this.priorState = "";

            this.maxHealth = 2;
            this.currentHealth = 2;
            this.maxIFrames = 60;
            this.iFrames = 0;
            this.regenWaitTime = 60;
            this.regenCountdown;

            this.resetWaitTime = 30;
            this.resetCountdown = 0;

            this.learnedAbilities = [];
            this.abilityState = "";

            this.runSpeed = 3.5;
            this.sprintSpeed = 5;
            this.sprintWindup = 20;
            this.dashSpeed = 20;
            this.dashDistance = 4;
            this.dashTimer = 0;
            this.dashCost = 40;

            this.interactionRange = tileSize / 2;
            this.interactionOrigin = new Point();

            this.initInteractionElements();

            this.particleEffects = [];
        }
        initiateSprite() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [this.spriteSheetImg],
                "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0, "count": 208},
                animations: {
                    right: [0, 2, "right", .2],
                    left: [7, 9, "left", .2],

                    rightWalk: [14, 17, "rightWalk", .2],
                    leftWalk: [21, 24, "leftWalk", .2],
                    
                    rightJump: 28, rightFall: 29,
                    leftJump: 30, leftFall: 31,

                    downDeath: [32, 46, "finished", .6], upDeath: [48, 62, "finished", .6],
                    rightDeath: [64, 78, "finished", .6], leftDeath: [80, 94, "finished", .6],
                    finished: 111
                }
            });

            this.sprite = new createjs.Sprite(spriteSheet);
            this.sprite.gotoAndPlay("down");
            this.sprite.x = this.location.X - this.spritePosition.X;
            this.sprite.y = this.location.Y - this.spritePosition.Y;
            this.spriteContainer.addChild(this.sprite);

            this.spriteContainer.setBounds(this.spritePosition.X, this.spritePosition.Y, this.spriteSize.X, this.spriteSize.Y);
        }
        
        initInteractionElements() {
            var cursorSheet = new createjs.SpriteSheet({
                "images": [gameAssets["Cursor"]],
                "frames": {"width": 14, "height": 20, "regX": 0, "regY": 0, "count": 4},
                animations: {
                    spin: [0, 3, "spin", .15]
                }
            });
            this.cursor = new createjs.Sprite(cursorSheet);
            this.cursor.gotoAndPlay("spin");
            this.highlight = null;
        }


        setActorDirection(direction, isMoving) {
            if (this.frozen)
                return;
            else if (currentStatement != null)
                return;
            
            switch (direction) {
                case "left":
                    this.goingLeft = isMoving;
                    break;
                case "right":
                    this.goingRight = isMoving;
                    break;
                case "up":
                    this.goingUp = isMoving;
                    break;
                case "down":
                    this.goingDown = isMoving;
                    break;
            }
        }

        addParticleEffect(effectName) {
            
            var particleSystem = new ParticleSystem(effectName);
            particleSystem.effectAreaOrigin.add(this.location);
            currentLevel.foregroundLayer.addChild(particleSystem.particleContainer);

            this.particleEffects.push(particleSystem);
        }
        updateParticleEffects() {
            for (let i = this.particleEffects.length - 1; i >= 0; i--) {
                this.particleEffects[i].updateSystem();

                if (this.particleEffects[i].isFinished) {
                    currentLevel.foregroundLayer.removeChild(this.particleEffects[i].particleContainer);
                    this.particleEffects.splice(i, 1);
                }
            }
        }

        updateActor() {
            this.updatePlayer();

            this.updateDirection();
            this.updateSpeed();
            this.updatePosition(true);
            this.updatePosition(false);

            this.updateState();
            this.updateInteractionCursor();

            this.updateParticleEffects();
        }

        updatePlayer() {

            this.updateImmunity();
            this.updateSpecialAbilities();

            if (this.respawnStatus >= 0)
                this.updateRespawn();
            else if (this.warpStatus >= 0)
                this.updateWarp();
        }
        updateImmunity() {
            if (this.iFrames > 0) {
                this.iFrames -= 1;

                if (this.iFrames === 0)
                    this.spriteContainer.alpha = 1;
            }
        }
        updateSpecialAbilities() {
            
        }

        updateState() {

            if (this.priorOrientation !== this.orientation || this.priorState !== this.state) {
                this.priorOrientation = this.orientation;
                this.priorState = this.state;

                this.sprite.gotoAndPlay(this.orientation + this.state);
            }

            if (this.state === "" || this.state === "Walk") {
                if (this.targetVelocity.X == 0 && this.targetVelocity.Y == 0)
                    this.state = "";
                else 
                    this.state = "Walk";
            }

        }

        interact() {

            var interaction = this.getInteraction();
            if (interaction != null) {
                interaction.objectAction();
            }
        }
        
        updateInteractionCursor() {

            var highlightedInteraction = this.getInteraction();
            if (highlightedInteraction instanceof Actor || (highlightedInteraction instanceof Prop && highlightedInteraction.dialogue)) {

                if (this.highlight != null && this.highlight != highlightedInteraction)
                    this.highlight.spriteContainer.removeChild(this.cursor);

                highlightedInteraction.spriteContainer.addChild(this.cursor);
                this.highlight = highlightedInteraction;

                var highlightSize = this.highlight.getObjectDisplaySize();
                var highlightPos = this.highlight.getObjectDisplayPos();
                this.cursor.x = (highlightSize.X / 2) - 7 - highlightPos.X;
                this.cursor.y = -20 - highlightPos.Y;
            }
            else if (this.highlight != null) {
                this.highlight.spriteContainer.removeChild(this.cursor);
                this.highlight = null;
            }
        }
        getInteraction() {
            var interactions = currentLevel.checkInteractionCollisions
                (this.interactionOrigin.X, this.interactionOrigin.Y, this.interactionRange, this.interactionRange);

            for (let i = 0; i < interactions.length; i++) {
                if (interactions[i] == this)
                    continue;
                else if (interactions[i] instanceof Enemy)
                    continue;
                else
                    return interactions[i];
            }
        }


        holdReset() {
            if (this.resetCountdown === 0) {
                this.state = "Reset";
                this.setFrozen(true);
            }

            if (this.resetCountdown >= 0) {
                this.resetCountdown += 1;

                if (this.resetCountdown >= this.resetWaitTime) {
                    this.respawnPlayer();
                    this.resetCountdown = -1;
                }
            }
        }
        releaseReset() {
            
            if (this.state === "Reset")
                this.state = "";

            this.resetCountdown = 0;
            this.setFrozen(false);
        }

        pressSpecial() {
            
        }
        releaseSpecial() {
            
        }

        beginSprint() {
            this.setFrozen(true);
            this.maxSpeed = this.sprintSpeed;
            this.abilityState = "sprint";
            this.state = "Dash";
            switch (this.orientation) {
                case "left":
                    this.goingLeft = true;
                    break;
                case "right":
                    this.goingRight = true;
                    break;
                case "down":
                    this.goingDown = true;
                    break;
                case "up":
                    this.goingUp = true;
                    break;
            }
        }
        endSprint() {
            this.setFrozen(false);
            this.maxSpeed = this.baseSpeed;
            this.goingLeft = false;
            this.goingRight = false;
            this.goingUp = false;
            this.goingDown = false;

            this.sprintWindup = 20;
            this.abilityState = "";
            this.state = "";
        }

        beginDash() {
            this.state = "WraithDash";
            this.abilityState = "dash";
            this.controlsLocked = true;
            this.passable = true;
            
            this.maxSpeed = this.dashSpeed;
            this.targetVelocity.setMagnitude(this.dashSpeed);
        }
        endDash() {
            this.state = "";
            this.abilityState = "";
            this.controlsLocked = false;
            this.passable = false;
            this.maxSpeed = this.baseSpeed;
        }

        handleCollisions() {
            if (this.passable)
                return;
            
            var fullCollisions = currentLevel.checkObjectCollisions(this, false);

            for (let i = 0; i < fullCollisions.length; i++) {

                fullCollisions[i].handleInteraction(this);
                
                if (fullCollisions[i] instanceof Enemy)
                    this.takeDamage(fullCollisions[i]);
                else if (fullCollisions[i] instanceof Prop) {
                    if (fullCollisions[i].fatalProp)
                        this.takeDamage(fullCollisions[i]);
                }
                else if (fullCollisions[i] instanceof Tile) {
                    if (fullCollisions[i].fatalTile)
                        this.takeDamage(fullCollisions[i]);
                }
            }
        }
        handleCollidedBy(actor) {
            if (actor instanceof Enemy) {
                this.takeDamage(actor);
            }
        }

        setFrozen(b) {
            this.frozen = b;

            if (b) {
                this.goingLeft = false;
                this.goingRight = false;
                this.goingUp = false;
                this.goingDown = false;
            }
        }

        setWarp(transition) {
            if (this.warpStatus >= 0)
                return;

            this.warpPoint = transition;
            this.warpStatus = 0;
            this.state = "Warp";
            this.setFrozen(true);
        }
        updateWarp() {
            
            if (this.state === "Warp" && this.sprite.currentAnimation != "finished" && this.sprite.currentAnimation != "warpFinished")
                return;
            else if (this.warpStatus == 0) {
                this.passable = false;
                this.orientation = "";
                this.state = "warpIn";
                transition = this.warpPoint;
                this.warpPoint = null;
                this.warpStatus = 1;
            }
            else if (this.warpStatus == 1) {
                this.orientation = "down";
                this.state = "";
                this.warpStatus = -1;
                this.setFrozen(false);
            }
        }

        takeDamage(damageSource) {
            if (this.iFrames > 0) {
                return;
            }

            player.currentHealth -= 1;
            healthBar.takeDamage();
                
            if (player.currentHealth <= 0) {
                this.respawnPlayer();
                this.iFrames = this.maxIFrames;
                player.currentHealth = player.maxHealth;
                healthBar.updateHealthBar();
            }
            else {
                this.knockbackPlayer(damageSource);
            }
        }
        knockbackPlayer(damageSource) {
            this.spriteContainer.alpha = .5;
            this.iFrames = this.maxIFrames;

            var collision = this.getCollisionVector(damageSource);
            var knockbackAngle = Math.atan2(collision.Y, collision.X);
            var knockbackForce = new Point( Math.cos(knockbackAngle), Math.sin(knockbackAngle) );
            knockbackForce.normalize();
            knockbackForce.multiply(new Point(15, 15));
            
            this.velocity.add(knockbackForce);
            this.updatePosition(true);
            this.updatePosition(false);
        }

        respawnPlayer() {
            if (this.respawnStatus >= 0)
                return;
            
            this.respawnStatus = 0;
            this.state = "Death";
            this.setFrozen(true);
        }
        
        updateRespawn() {

            if (this.sprite.currentAnimation != "finished" && this.sprite.currentAnimation != "warpFinished")
                return;
            else if (this.respawnStatus == 0) {
                this.respawnStatus = 1;
                this.orientation = "";
                this.state = "rebirth";
                transition = {map: currentCheckpoint.map, location: currentCheckpoint.location};
            }
            else if (this.respawnStatus == 1) {
                this.respawnStatus = -1;
                this.orientation = "down";
                this.state = "";
                this.setFrozen(false);
            }
        }

    }
    
    return Player;

});