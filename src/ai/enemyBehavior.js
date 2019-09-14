define("EnemyBehavior", ['Point'], function(Point) {
    
    const Behavior = { "Stationary" : "Stationary", "Pacing": "Pacing", "Chase": "Chase"};

    class EnemyBehavior {

        constructor(hostEnemy, behaviorType) {
            
            this.hostEnemy = hostEnemy;
            this.type = Behavior[behaviorType];
        }

        updateBehavior() {

            switch (this.type) {
                case Behavior.Chase: 
                    this.updateChaseAI();
                    break;
                default:
                    break;
            }
        }
        
        updatePositionOnCollision(collisions, xAxis) {
            
        }
        handleCollisions() {
            
        }
        handleCollidedBy(actor) {
            
        }

        updatePacingAI() {

        }

        updateChaseAI() {
            var distToPlayer = new Point(this.hostEnemy.location.X - player.location.X, this.hostEnemy.location.Y - player.location.Y);

            if (distToPlayer.Y > 0)
                var verticalLoS = tileSize;
            else
                var verticalLoS = tileSize / 4;

            if ( Math.abs(distToPlayer.X) < tileSize * 5 && Math.abs(distToPlayer.Y) < verticalLoS ) {
                if (distToPlayer.X < 0) {
                    this.hostEnemy.setActorDirection("right", true);
                }
                else {
                    this.hostEnemy.setActorDirection("left", true);
                }
            }
            else {
                this.hostEnemy.setActorDirection("left", false);
                this.hostEnemy.setActorDirection("right", false);
            }
        }

    }

    return EnemyBehavior;

});
