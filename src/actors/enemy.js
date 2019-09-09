define("Enemy", 
    ['Point', 'Actor', 'EnemyBehavior', 'PacingBehavior', 'ActorController', 'ParticleSystem'], 
    function(Point, Actor, EnemyBehavior, PacingBehavior, ActorController, ParticleSystem) {

    const DeathState = { "Alive" : 0, "Dying": 1, "Dead": 2};

    class Enemy extends Actor {
        
        constructor(actorSize, spriteData, enemyData, aiBehavior) {
            super(actorSize, spriteData, enemyData);
            this.isNPC = true;

            if (enemyData["behavior"]) {
                if (enemyData["behavior"] === "Pacing")
                    this.aiBehavior = new PacingBehavior(this, enemyData);
                else
                    this.aiBehavior = new EnemyBehavior(this, enemyData["behavior"]);
            }
            
            this.damageOnTouch = enemyData["damageOnTouch"] ? enemyData["damageOnTouch"] : true;
            this.deathAnimation = enemyData["deathAnimation"] ? enemyData["deathAnimation"] : "";
            this.deathTimer = enemyData["deathTimer"] ? enemyData["deathTimer"] : 0;
            this.deathStatus = DeathState.Alive;
            this.deathController = new ActorController(controllerData["gravityFree"]);

            this.deathCombo;
            this.deathScore;
            
            this.initEnemy();
        }
        initEnemy() {
            
            if (this.damageOnTouch)
                this.addHitbox(null, -3, -3, this.size.X + 6, this.size.Y + 6);
            this.addHurtbox(null, -3, -3, this.size.X + 6, this.size.Y + 6);
        }
        
        updateActor() {

            if (this.aiBehavior)
                this.aiBehavior.updateBehavior();
            if (this.deathStatus !== DeathState.Alive)
                this.updateDeath();

            super.updateActor();
        }
        
        addParticleEffect(effectName) {
            var particleSystem = new ParticleSystem(effectName);
            particleSystem.effectAreaOrigin.add(this.location);
            currentLevel.foregroundLayer.addChild(particleSystem.systemContainer);

            this.particleEffects.push(particleSystem);
        }

        updatePositionOnCollision(collisions, xAxis) {
            super.updatePositionOnCollision(collisions, xAxis);
            if (this.aiBehavior)
                this.aiBehavior.updatePositionOnCollision(collisions, xAxis);
        }
        
        handleCollisions() {
            if (this.aiBehavior)
                this.aiBehavior.handleCollisions();
        }
        handleCollidedBy(actor) {
            if (this.aiBehavior)
                this.aiBehavior.handleCollisions(actor);
        }

        takeDamage(collisions) {
            if (collisions.length > 0) {
                var nonEnemyDamage = false;
                for (let i = 0; i < collisions.length; i++) {
                    if (!(collisions[i].parentObject instanceof Enemy)) {
                        nonEnemyDamage = true;
                        break;
                    }
                }
                if (!nonEnemyDamage)
                    return;
            }

            if (this.deathStatus === DeathState.Alive) { 
                this.state = this.deathAnimation;
                this.deathStatus = DeathState.Dying;

                this.clearCollisionBoxes();
                this.passable = true;
                this.setController(this.deathController);
                
                currentLevel.enemiesRemaining -= 1;
                gameStatsDisplay.updateStats();
                this.createScoreText();

                if (collisions.length > 0) {

                    var knockbackForce = this.getKnockbackForce(collisions[0].parentObject);
                    this.velocity.add(knockbackForce);
                    this.addDamageEffect(knockbackForce);
                }
            }
        }
        addDamageEffect(knockbackForce) {
            var dmgEffect = new ParticleSystem("DamageEffect");
            dmgEffect.effectAreaOrigin = this.location;
            var force = new Point(Math.round(knockbackForce.X * 100) / 100, Math.round(knockbackForce.Y * 100 / 100));
            force.divide(new Point(4, 4));
            var altVel = (-force.X - 1) + "~" + (-force.X + 1) + ", " + (-force.Y - 1) + "~" + (-force.Y + 1);
            
            dmgEffect.setParticleAltVelocity(altVel);
            currentLevel.addParticleEffect(dmgEffect);
        }

        createScoreText() {
            if (player.comboCount < 2)
                return;

            this.deathCombo = new createjs.Text(player.comboCount + "x", "32px Equipment", "#f5f4eb");
            this.deathScore = new createjs.Text(player.comboCount * 100, "32px Equipment", "#f5f4eb");
            this.deathCombo.x = this.location.X;
            this.deathCombo.y = this.location.Y - tileSize / 2;
            this.deathScore.x = this.location.X;
            this.deathScore.y = this.location.Y - tileSize / 2 + this.deathCombo.getMeasuredHeight() + 6;

            this.deathCombo.textAlign = "center";
            this.deathScore.textAlign = "center";
            currentLevel.effectLayer.addChild(this.deathCombo, this.deathScore);
        }
        removeScoreText() {
            if (this.deathCombo && this.deathScore) {
                if (currentLevel.effectLayer.contains(this.deathCombo)) {
                    currentLevel.effectLayer.removeChild(this.deathCombo, this.deathScore);
                }
            }
        }

        getKnockbackForce(damageSource) {
            var collision = this.getCollisionVector(damageSource);
            var knockbackAngle = Math.atan2(collision.Y, collision.X);
            var knockbackForce = new Point( Math.cos(knockbackAngle), Math.sin(knockbackAngle) );

            knockbackForce.normalize();
            knockbackForce.multiply(new Point(5, 5));
            
            return knockbackForce;
        }

        updateDeath() {
            if (this.deathStatus === DeathState.Dying) {
                if (this.deathTimer > 0) {
                    this.deathTimer -= 1;
                    this.updateDeathScore();
                }
                else
                    this.deathStatus = DeathState.Dead;
            }
            else if (this.deathStatus === DeathState.Dead) {
                currentLevel.removeActor(this);
                currentLevel.effectLayer.removeChild(this.deathCombo, this.deathScore);

                var deathEffect = new ParticleSystem("EnemyDeathEffect");
                deathEffect.effectAreaOrigin = this.location;
                currentLevel.addParticleEffect(deathEffect);
            }
        }
        updateDeathScore() {
            if (!this.deathCombo)
                return;
            
            if (this.deathTimer % 4 == 0) {
                if (this.deathCombo.color === "#f5f4eb") {
                    this.deathCombo.color = "#e18d79";
                    this.deathScore.color = "#e18d79";
                }
                else {
                    this.deathCombo.color = "#f5f4eb";
                    this.deathScore.color = "#f5f4eb";
                }
            }
        }

    }
    
    return Enemy;

});