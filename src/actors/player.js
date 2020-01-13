define("Player", ['Actor', 'Tile', 'Prop', 'Collectible', 'Enemy', 'Point', 'ParticleSystem', 'ActorController', 'Attack', 'ChargeAttack', 'ParticleSystem'],
    function (Actor, Tile, Prop, Collectible, Enemy, Point, ParticleSystem, ActorController, Attack, ChargeAttack, ParticleSystem) {

    const RespawnState = { "Alive": 0, "Dying": 1, "Respawning": 2 }

    class Player extends Actor {

        constructor() {
            var playerSpriteData = {
                "spriteImage": gameAssets["Player"],
                "spriteCollision": new Point(24, 30),
                "spriteSize": new Point(48, 48),
                "spritePosition": new Point(12, 12)
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
            var y = 8;

            var spriteSheet = new createjs.SpriteSheet({
                "images": [this.spriteSheetImg],
                "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0, "count": 160},
                animations: {
                    right: [0, 6, "right", .2],
                    left: [y, y + 6, "left", .2],

                    rightWalk: [2 * y, 2 * y + 6, "rightWalk", .2],
                    leftWalk: [3 * y, 3 * y + 6, "leftWalk", .2],
                    
                    rightJump: [4 * y, 4 * y + 3, "rightJumpEnd", .2], rightJumpEnd: 4 * y + 3, rightFall: 2 * y,
                    rightImpact: [4 * y + 3, 4 * y + 7, "rightImpactEnd", .4], rightImpactEnd: 0,
                    
                    leftJump: [5 * y, 5 * y + 3, "leftJumpEnd", .2], leftJumpEnd: 5 * y + 3, leftFall: 3 * y,
                    leftImpact: [5 * y + 3, 5 * y + 7, "leftImpactEnd", .4], leftImpactEnd: y,

                    rightChargeWindup: [6 * y, 6 * y + 4, "rightChargeWindupEnd", .4], rightChargeWindupEnd: 6 * y + 4,
                    leftChargeWindup: [7 * y, 7 * y + 4, "leftChargeWindupEnd", .4], leftChargeWindupEnd: 7 * y + 4,
                    rightCharge: [8 * y, 8 * y + 5, "rightCharge", .25],
                    leftCharge: [9 * y, 9 * y + 5, "leftCharge", .25],

                    rightChargeSlide: [10 * y, 10 * y + 4, "rightChargeSlideEnd", .2], rightChargeSlideEnd: 10 * y + 4,
                    leftChargeSlide: [11 * y, 11 * y + 4, "leftChargeSlideEnd", .2], leftChargeSlideEnd: 11 * y + 4,
                    rightKnockback: [10 * y + 6, 10 * y + 7, "rightKnockback", .16], leftKnockback: [11 * y + 6, 11 * y + 7, "leftKnockback", .16],

                    Slam: [12 * y, 12 * y + 5, "leftSlam", .25],
                    rightSlamStun: [13 * y, 13 * y + 4, "rightSlamStunEnd", .25], leftSlamStun: [14 * y, 14 * y + 4, "leftSlamStunEnd", .25],
                    rightSlamStunEnd: [13 * y + 3, 13 * y + 4, "rightSlamStunEnd", .12], leftSlamStunEnd: [14 * y + 3, 14 * y + 4, "leftSlamStunEnd", .12],

                    rightFlip: [15 * y, 15 * y + 4, "rightFlipEnd", 0.20], rightFlipEnd: [15 * y + 5, 15 * y + 6, "rightFall", 0.1],
                    leftFlip: [16 * y, 16 * y + 4, "leftFlipEnd", 0.15], leftFlipEnd: [16 * y + 5, 16 * y + 6, "leftFall", 0.1],
                    rightCancelFlip: { frames: [120, 127, 121, 122, 123, 124], next: "rightFlipEnd", speed: 0.2 },
                    leftCancelFlip: { frames: [128, 135, 129, 130, 131, 132], next: "leftFlipEnd", speed: 0.2 },
                    
                    rightFrontFlip: [17 * y, 17 * y + 6, "rightFrontFlipEnd", 0.2], rightFrontFlipEnd: 17 * y + 6,
                    leftFrontFlip: [18 * y, 18 * y + 6, "leftFrontFlipEnd", 0.2], leftFrontFlipEnd: 18 * y + 6,

                    leftDeath: [19 * y, 19 * y + 5, "empty", 0.3], rightDeath: [19 * y, 19 * y + 5, "empty", 0.3],
                    empty: 7, finished: 7
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

            if (!this.onGround && this.velocity.Y > 0 && !this.sprite.currentAnimation.includes("Flip"))
                this.state = "Fall";
            else if (this.state === "" || this.state === "Walk") {
                if (this.targetVelocity.X == 0 && this.targetVelocity.Y == 0)
                    this.state = "";
                else 
                    this.state = "Walk";
            }
            else if (this.state === "Impact" && this.sprite.currentAnimation.includes("ImpactEnd"))
                this.state = "";
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

                var cancelEffect = new ParticleSystem("CancelEffect");
                cancelEffect.effectAreaOrigin = new Point(this.location.X - this.size.X, this.location.Y - this.size.Y);
                this.addParticleEffectObj(cancelEffect);

                return;
            }
            else if (!this.currentController.acceptInput || this.currentController.currentJumps <= 0)
                return;
            
            if (this.currentAttack == this.cancelFlip)
                this.currentAttack.endAttack(this);
            
            if (this.onGround) {
                this.playSound("Jump", 0.4);
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
        isInAttack() {
            return (this.currentAttack == this.aerialAttack || this.currentAttack == this.chargeAttack || this.currentAttack == this.chargeAttackWeak);
        }
        
        setGrounded() {
            var initiallyGrounded = this.onGround;

            super.setGrounded();
            
            if (!initiallyGrounded)
                this.state = "Impact";

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
        handleSlamStun() {
            if (this.currentAttack == this.cancelFlip || this.currentAttack == this.comboFlip)
                return;
            this.playSound("StunFloor", 0.5);

            var slamStunEffect = new ParticleSystem("SlamStunEffect");
            slamStunEffect.effectAreaOrigin = new Point(this.location.X + this.size.X / 2, this.location.Y + this.size.Y);
            currentLevel.addParticleEffect(slamStunEffect);
        }

        isAbleToAttack(nextAttack) {
            if (this.frozen)
                return false;
            else if (this.respawnStatus !== RespawnState.Alive)
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
                    if (fullCollisions[i] instanceof Collectible && this.respawnStatus === RespawnState.Alive) {
                        this.getCollectible(fullCollisions[i]);
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

        getCollectible(collectible) {
            this.collectiblesGathered += 1;
            this.playSound("Collectible", .5);
            gameStatsDisplay.updateStats();

            var collectibleEffect = new ParticleSystem("CollectibleEffect");
            collectibleEffect.effectAreaOrigin = collectible.location;
            currentLevel.addParticleEffect(collectibleEffect);

            currentLevel.removeProp(collectible);
        }

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
        resetPlayer() {
            if (this.currentAttack) {
                this.currentAttack.endAttack(this);
                this.currentController.reset();
                this.currentAttack = null;
            }
            
            this.orientation = "right";
            this.state = "";
            this.setController(this.defaultController);
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
            currentLevel.resetLevel();
            
            var respawnEffect = new ParticleSystem("RespawnEffect");
            var respawnFXLocation = currentLevel.levelSpawn.location.get();
            respawnFXLocation.subtract(new Point(50, 50));
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
            if (!soundEffectsOn)
                return;
            
            var soundInstance = new Howl({
                src: [soundRoot + soundAssets[soundName]], loop: false, volume: vol
            });
            soundInstance.play();
        }

    }
    
    return Player;

});