define("EnemyBehavior", ['Point'], function(Point) {
    
    class EnemyBehavior {

        constructor(hostEnemy, behaviorType) {
            
            this.hostEnemy = hostEnemy;
            this.type = behaviorType;
        }

        updateBehavior() {

            switch (this.type) {
                case "sleeping":
                    break;
                case "chase": 
                    this.updateChaseAI();
                    break;
                default:
                    break;
            }
        }

        updateChaseAI() {
            var distToPlayer = new Point(this.hostEnemy.location.X - player.location.X, this.hostEnemy.location.Y - player.location.Y);

            if ( Math.abs(distToPlayer.X) < tileSize * 5 && Math.abs(distToPlayer.Y) < tileSize ) {
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
