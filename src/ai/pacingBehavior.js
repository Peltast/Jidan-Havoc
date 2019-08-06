define("PacingBehavior", ['Point', 'EnemyBehavior'], function(Point, EnemyBehavior) {

    class PacingBehavior extends EnemyBehavior {
        constructor(hostEnemy, enemyData) {
            super(hostEnemy, "Pacing");

            this.horizontal = enemyData["horizontal"] != null ? enemyData["horizontal"] == "true" : true;
            this.startDirection = enemyData["startDirection"] ? enemyData["startDirection"] : hostEnemy.orientation;
            this.currentDirection = this.startDirection;
            
            this.hostEnemy.setActorDirection(this.currentDirection, true);
        }

        updateBehavior() {

        }
        
        updatePositionOnCollision(collisions, xAxis) {
            if ( (xAxis && this.horizontal) || (!xAxis && !this.horizontal) )
                this.turnEnemyAround();
        }
        handleCollisions() {
            
        }
        handleCollidedBy(actor) {
            // this.turnEnemyAround();
        }

        turnEnemyAround() {
            if (this.horizontal) {
                if (this.currentDirection === "left")
                    this.changeEnemyDirection("left", "right");
                else if (this.currentDirection === "right")
                    this.changeEnemyDirection("right", "left");
            }
            else {
                if (this.currentDirection === "up")
                    this.changeEnemyDirection("up", "down");
                else if (this.currentDirection === "down")
                    this.changeEnemyDirection("down", "up");
            }
        }
        changeEnemyDirection(oldDirection, newDirection) {
            this.hostEnemy.setActorDirection(oldDirection, false);
            this.hostEnemy.setActorDirection(newDirection, true);

            this.currentDirection = newDirection;
        }

    }
    
    return PacingBehavior;

});