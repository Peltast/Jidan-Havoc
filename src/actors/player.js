define("Player", ['Actor', 'Tile', 'Prop', 'Collectible', 'Enemy', 'Point', 'ParticleSystem', 'ActorController', 'Attack', 'ChargeAttack', 'ParticleSystem'],
    function (Actor, Tile, Prop, Collectible, Enemy, Point, ParticleSystem, ActorController, Attack, ChargeAttack, ParticleSystem) {

    const RespawnState = { "Alive": 0, "Dying": 1, "Respawning": 2 }

    class Player extends Actor {

        constructor() {
            var playerSpriteData = {
                "spriteImage": gameAssets["Player"],
                "spriteCollision": new Point(24, 30),
                "spriteSize": new Point(40, 44),
                "spritePosition": new Point(8, 10)
            };
            super(playerSpriteData["spriteCollision"], playerSpriteData, {});
            this.mass = 100;

            this.deathDuration = 30;
            this.respawnDuration = 50;
            this.respawnTimer = 0;
            this.respawnStatus = RespawnState.Alive;
            this.frozen = false;

            this.addHurtbox(null, 2, 2, 22, 28);

            this.footstepDistance = 32;
            this.lastFootstep = 0;

            this.collectiblesGathered = 0;
            this.highestCombo = 0;
            this.comboCount = 0;

            this.interactionRange = tileSize / 2;
            this.interactionOrigin = new Point();
            this.initInteractionElements();

            this.aerialAttack = new Attack(["aerialMain", "aerialRecovery"]);
            this.chargeAttack = new ChargeAttack(["chargeWindup", "chargeMain", "chargeSlide"]);
            this.chargeAttackWeak = new ChargeAttack(["chargeWindupWeak", "chargeMainWeak", "chargeSlideWeak"]);
            this.cancelFlip = new Attack(["releaseFlip"]);
            this.comboFlip = new Attack(["comboFlip"]);

            this.deathController = new ActorController(controllerData["frozenMidair"]);
            this.currentAttack = null;
        }
        initiateSprite() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [this.spriteSheetImg],
                "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0, "count": 208},
                animations: {
                    right: [0, 2, "right", .1],
                    left: [3, 5, "left", .1],

                    rightWalk: [6, 9, "rightWalk", .1],
                    leftWalk: [12, 15, "leftWalk", .1],
                    
                    leftJump: 18, rightJump: 19,
                    leftFall: 20, rightFall: 21,

                    leftDeath: { frames: [24, 25, 26, 27, 11], next: "leftEmpty", speed: 0.25 }, rightDeath: { frames: [24, 25, 26, 27, 11], next: "rightEmpty", speed: 0.25 },

                    Slam: [30, 34, "leftSlam", .25],
                    leftSlamStun: [36, 37, "leftSlamStun", .08], rightSlamStun: [38, 39, "rightSlamStun", .08],

                    rightChargeWindup: [22, 23, "rightChargeWindup", .01], rightCharge: [42, 46, "rightCharge", .25],
                    leftChargeWindup: [28, 29, "finished", .01], leftCharge: [48, 52, "leftCharge", .25],

                    rightChargeSlide: [54, 58, "rightChargeSlideFinished", .2], rightChargeSlideFinished: 58,
                    leftChargeSlide: [60, 64, "leftChargeSlideFinished", .2], leftChargeSlideFinished: 64,
                    rightKnockback: [66, 67, "rightKnockback", .16], leftKnockback: [68, 69, "leftKnockback", .16],

                    rightFlip: { frames: [72, 73, 74, 75, 76, 76, 77, 77], next: "rightFlipFinished", speed: 0.2 }, rightFlipFinished: 77,
                    leftFlip: { frames: [78, 79, 80, 81, 82, 82, 83, 83], next: "leftFlipFinished", speed: 0.2 }, leftFlipFinished: 83,
                    rightFrontFlip: [84, 89, "rightFrontFlipFinished", 0.2], rightFrontFlipFinished: 89,
                    leftFrontFlip: [90, 95, "leftFrontFlipFinished", 0.2], leftFrontFlipFinished: 95,
                    
                    leftEmpty: 11, rightEmpty: 11,
                    finished: 27
                }
            });

            this.sprite = new createjs.Sprite(spriteSheet);
            this.sprite.gotoAndPlay("right");
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
            if (currentStatement != null)
                return;
            
            super.setActorDirection(direction, isMoving);
        }

        addParticleEffect(effectName) {
            
            var particleSystem = new ParticleSystem(effectName);
            particleSystem.effectAreaOrigin.add(this.location);
            currentLevel.foregroundLayer.addChild(particleSystem.particleContainer);

            this.particleEffects.push(particleSystem);
        }

        updateActor() {
            this.updatePlayer();

            super.updateActor();
            this.updateInteractionCursor();
        }
        updateState() {
            if (this.respawnStatus !== RespawnState.Alive)
                return;
            else
                super.updateState();
        }
        setMotionState() {

            if (!this.onGround && this.velocity.Y > 0 && (this.sprite.currentAnimation !== "leftFlip" && this.sprite.currentAnimation !== "rightFlip" ))
                this.state = "Fall";
            else if (this.state === "" || this.state === "Walk") {
                if (this.targetVelocity.X == 0 && this.targetVelocity.Y == 0)
                    this.state = "";
                else 
                    this.state = "Walk";
            }
        }
        enactNewState() {
            if (!this.currentController.setAnimation && this.respawnStatus == RespawnState.Alive && (this.sprite.currentAnimation == "leftFlip" || this.sprite.currentAnimation == "rightFlip"))
                return;

            super.enactNewState();
        }

        updatePlayer() {
            this.updateSpecialAbilities();
            this.updateFootstep();

            if (this.respawnStatus !== RespawnState.Alive)
                this.updateRespawn();
        }
        updateSpecialAbilities() { }

        updateFootstep() {
            if (this.onGround) {
                var delta = Math.abs(this.location.X - this.lastFootstep);
                if (delta >= this.footstepDistance) {
                    this.createFootstepEffect();
                }
                else if (delta > 10 && (this.velocity.X < -1 && this.orientation === "right" || this.velocity.X > 1 && this.orientation === "left")) {
                    this.createFootstepEffect();
                }
            }
        }
        createFootstepEffect() {
            this.playSound("Walk", 0.3);
            this.lastFootstep = Math.round(this.location.X);

            var stepDust = new ParticleSystem("WalkDustEffect");
            var xOrigin = this.orientation === "right" ? this.location.X : this.location.X + this.size.X;
            stepDust.effectAreaOrigin = new Point(xOrigin, this.location.Y + this.size.Y - 8);
            stepDust.particleData[0].startVelocity = (this.orientation === "right" ? "-1.5~-0.5" : "0.5~1.5") + ", -1~-0.2";

            this.addParticleEffectObj(stepDust);
        }


        jumpHold() {
            if (this.jumpHeld || this.frozen)
                return;
            else if (this.canCancelAttack()) {
                this.setAttack(this.cancelFlip);
                this.playSound("ComboCancel", 0.4);
                return;
            }
            else if (!this.currentController.acceptInput || this.currentController.currentJumps <= 0)
                return;
            
            if (this.currentAttack == this.cancelFlip)
                this.currentAttack.endAttack(this);
            
            this.playSound( this.onGround ? "Jump" : "DoubleJump", 0.5);

            if (this.onGround) {
                this.playSound("Jump", 0.5);
                this.state = "Jump";
                this.onGround = false;

                var jumpDust = new ParticleSystem("JumpDustEffect");
                jumpDust.effectAreaOrigin = new Point(this.location.X, this.location.Y + (this.size.Y / 2));
                this.addParticleEffectObj(jumpDust);
            }
            else {
                this.playSound("DoubleJump", 0.4);
                this.state = "Flip";
            }

            this.velocity.Y = -this.currentController.jumpVelocity;
            this.currentController.currentJumps -= 1;
            
            this.goingUp = true;
            this.jumpHeld = true;
        }
        jumpRelease() {
            this.goingUp = false;
            this.jumpHeld = false;
        }
        canCancelAttack() {
            if (!this.currentAttack)
                return false;
            else if (this.currentAttack !== this.cancelFlip && (this.currentAttack.isInCombo() || this.currentAttack == this.comboFlip))
                return true;
            else
                return false;
        }
        
        setGrounded() {
            super.setGrounded();

            if (this.onGround) {
                this.highestCombo = Math.max(this.highestCombo, this.comboCount);
                this.comboCount = 0;
                
                if (this.respawnStatus === RespawnState.Alive) {
                    var fallDust = new ParticleSystem("FallDustEffect");
                    fallDust.effectAreaOrigin = new Point(this.location.X, this.location.Y + (this.size.Y));
                    this.addParticleEffectObj(fallDust);
                }
            }

            this.lastFootstep = Math.round(this.location.X);
            this.playSound("Land", 0.5);
        }
        setUnGrounded() {
            super.setUnGrounded();

            if (this.velocity.Y < 0)
                this.state = "Jump";
            else
                this.state = "Fall";
        }
        

        attack() {
            if (!this.isAbleToAttack())
                return;

            if (this.goingLeft || this.goingRight) {
                this.setAttack(this.chargeAttack);
                this.playSound("Windup", 0.4);
            }
            else if (!this.onGround)
                this.setAttack(this.aerialAttack);
            else {
                this.setAttack(this.chargeAttackWeak);
                this.playSound("Windup", 0.4);
            }
        }
        setAttack(attack) {
            if (this.currentAttack)
                this.currentAttack.endAttack(this);
            this.currentAttack = attack;
            this.currentAttack.beginAttack(this);
        }

        handleHorizontalCollision() {
            if (this.currentAttack == this.chargeAttack || this.currentAttack == this.chargeAttackWeak) {
                this.currentAttack.beginKnockback(this);
            }
        }

        isAbleToAttack(nextAttack) {
            if (this.frozen)
                return false;
            else if (this.currentAttack) {
                if (nextAttack ? this.currentAttack === nextAttack : false)
                    return false;
                if (this.currentAttack.active && this.currentAttack !== this.comboFlip)
                    return false;
            }
            
            return true;
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

        pressSpecial() {
            
        }
        releaseSpecial() {
            
        }

        handleCollisions() {
            if (this.passable)
                return;
            
            var fullCollisions = currentLevel.checkObjectCollisions(this, false);

            for (let i = 0; i < fullCollisions.length; i++) {
                fullCollisions[i].handleInteraction(this);
                
                if (fullCollisions[i] instanceof Prop) {
                    if (fullCollisions[i] instanceof Collectible) {
                        this.collectiblesGathered += 1;
                        this.playSound("Collectible", .5);
                        gameStatsDisplay.updateStats();

                        var collectibleEffect = new ParticleSystem("CollectibleEffect");
                        collectibleEffect.effectAreaOrigin = fullCollisions[i].location;
                        currentLevel.addParticleEffect(collectibleEffect);

                        currentLevel.removeProp(fullCollisions[i]);
                    }

                    if (fullCollisions[i].fatalProp)
                        this.takeDamage(fullCollisions[i]);
                }
                else if (fullCollisions[i] instanceof Tile) {
                    if (fullCollisions[i].fatalTile)
                        this.takeDamage(fullCollisions[i]);
                }
            }
        }
        handleCollidedBy(actor) { }

        giveDamage(damageObj) {
            if (damageObj instanceof Enemy) {
                if (this.currentAttack ? this.currentAttack.isInCombo() : false) {
                    this.playSound("Hit", 0.6);

                    this.setAttack(this.comboFlip);
                    this.comboCount += 1;
                    gameScore += 100 * this.comboCount;

                    this.playComboSound();

                    gameStatsDisplay.updateStats();
                }
            }
        }
        playComboSound() {
            if (this.comboCount >= 8)
                this.playSound("Combo4", 0.6);
            else if (this.comboCount >= 6)
                this.playSound("Combo3", 0.5);
            else if (this.comboCount >= 4)
                this.playSound("Combo2", 0.4);
            else if (this.comboCount >= 2)
                this.playSound("Combo1", 0.3);
        }

        takeDamage(collisions) {
            if (this.respawnStatus === RespawnState.Alive && transition == null) {
                this.respawnPlayer();
                this.playSound("Death", 0.6);
            }
        }

        respawnPlayer() {
            
            if (this.currentAttack) {
                this.currentAttack.endAttack(this);
                this.currentController.reset();
                this.currentAttack = null;
            }

            var deathEffect = new ParticleSystem("DeathEffect");
            deathEffect.effectAreaOrigin = this.location;
            currentLevel.addParticleEffect(deathEffect);
            
            this.respawnStatus = RespawnState.Dying;
            this.state = "Death";
            this.enactNewState();
            this.setController(this.deathController);
        }
        
        updateRespawn() {

            if (this.respawnTimer < this.deathDuration && this.respawnStatus === RespawnState.Dying) {
                this.respawnTimer += 1;
                if (this.respawnTimer >= this.deathDuration)
                    this.deathToRespawn();
            }
            else if (this.respawnTimer < this.respawnDuration && this.respawnStatus === RespawnState.Respawning) {
                this.respawnTimer += 1;
                if (this.respawnTimer >= this.respawnDuration)
                    this.respawnToAlive();
            }
        }
        deathToRespawn() {

            this.respawnTimer = 0;
            this.respawnStatus = RespawnState.Respawning;
            transition = {map: currentLevel.name, location: currentLevel.levelSpawn.location};
            
            var respawnEffect = new ParticleSystem("RespawnEffect");
            var respawnFXLocation = transition.location.get()
            respawnFXLocation.subtract(new Point(50, 50))
            respawnEffect.effectAreaOrigin = respawnFXLocation;

            currentLevel.addParticleEffect(respawnEffect);
        }
        respawnToAlive() {
            this.respawnTimer = 0;
            this.respawnStatus = RespawnState.Alive;

            this.orientation = "right";
            this.state = "";
            this.setController(this.defaultController);
        }

        playSound(soundName, vol) {
            var soundInstance = new Howl({
                src: [soundRoot + soundAssets[soundName]], loop: false, volume: vol
            });
            soundInstance.play();
        }


        /* Damage/health/knockback logic from YGttA  */
        
        // updateImmunity() {
        //     if (this.iFrames > 0) {
        //         this.iFrames -= 1;

        //         if (this.iFrames === 0)
        //             this.spriteContainer.alpha = 1;
        //     }
        // }

        // takeDamage(damageSource) {
        //     if (this.iFrames > 0) {
        //         return;
        //     }

        //     player.currentHealth -= 1;
        //     healthBar.takeDamage();
                
        //     if (player.currentHealth <= 0) {
        //         this.respawnPlayer();
        //         this.iFrames = this.maxIFrames;
        //         player.currentHealth = player.maxHealth;
        //         healthBar.updateHealthBar();
        //     }
        //     else {
        //         this.knockbackPlayer(damageSource);
        //     }
        // }
        // knockbackPlayer(damageSource) {
        //     this.spriteContainer.alpha = .5;
        //     this.iFrames = this.maxIFrames;

        //     var collision = this.getCollisionVector(damageSource);
        //     var knockbackAngle = Math.atan2(collision.Y, collision.X);
        //     var knockbackForce = new Point( Math.cos(knockbackAngle), Math.sin(knockbackAngle) );
        //     knockbackForce.normalize();
        //     knockbackForce.multiply(new Point(15, 15));
            
        //     this.velocity.add(knockbackForce);
        //     this.updatePosition(true);
        //     this.updatePosition(false);
        // }

    }
    
    return Player;

});