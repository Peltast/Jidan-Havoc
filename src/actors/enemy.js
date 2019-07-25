define("Enemy", 
    ['Point', 'Actor', 'EnemyBehavior', 'PacingBehavior', 'ActorController'], 
    function(Point, Actor, EnemyBehavior, PacingBehavior, ActorController) {

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

                if (collisions.length > 0)
                    this.knockbackEnemy(collisions[0].parentObject);
            }
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

        knockbackEnemy(damageSource) {
            var collision = this.getCollisionVector(damageSource);
            var knockbackAngle = Math.atan2(collision.Y, collision.X);
            var knockbackForce = new Point( Math.cos(knockbackAngle), Math.sin(knockbackAngle) );

            knockbackForce.normalize();
            knockbackForce.multiply(new Point(5, 5));
            
            this.velocity.add(knockbackForce);
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