define("Enemy", ['Actor', 'EnemyBehavior', 'ActorController'], function(Actor, EnemyBehavior, ActorController) {

    const DeathState = { "Alive" : 0, "Dying": 1, "Dead": 2};

    class Enemy extends Actor {
        
        constructor(actorSize, spriteData, enemyData) {
            super(actorSize, spriteData, enemyData);

            if (enemyData["behavior"])
                this.enemyBehavior = new EnemyBehavior(this, enemyData["behavior"]);
            
            this.damageOnTouch = enemyData["damageOnTouch"] ? enemyData["damageOnTouch"] : true;
            this.deathAnimation = enemyData["deathAnimation"] ? enemyData["deathAnimation"] : "";
            this.deathTimer = enemyData["deathTimer"] ? enemyData["deathTimer"] : 0;
            this.deathStatus = DeathState.Alive;
            this.deathController = new ActorController(controllerData["gravityFree"]);

            this.initEnemy();
        }
        initEnemy() {
            
            if (this.damageOnTouch)
                this.addHitbox(null, -3, -3, this.size.X + 6, this.size.Y + 6);
            this.addHurtbox(null, -3, -3, this.size.X + 6, this.size.Y + 6);
        }
        
        updateActor() {

            if (this.enemyBehavior)
                this.enemyBehavior.updateBehavior();
            if (this.deathStatus !== DeathState.Alive)
                this.updateDeath();

            super.updateActor();
        }

        takeDamage() {
            if (this.deathStatus === DeathState.Alive) { 
                this.state = this.deathAnimation;
                this.deathStatus = DeathState.Dying;

                this.hitBoxes = [];
                this.passable = true;
                this.setFrozen(true);
                this.setController(this.deathController);
            }
        }
        updateDeath() {
            if (this.deathStatus === DeathState.Dying) {
                if (this.deathTimer > 0)
                    this.deathTimer -= 1;
                else
                    this.deathStatus = DeathState.Dead;
            }
            else if (this.deathStatus === DeathState.Dead) {
                currentLevel.removeActor(this);
            }
        }

    }
    
    return Enemy;

});