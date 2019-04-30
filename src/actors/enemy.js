define("Enemy", ['Actor'], function(Actor) {

    class Enemy extends Actor {

        constructor(maxSpeed, acceleration, deceleration, actorSize, spriteData, enemyData) {
            super(maxSpeed, acceleration, deceleration, actorSize, spriteData, enemyData);
            
            this.pathXAxis = enemyData.xAxis;
            this.pathDirection = enemyData.startDirection;
            this.pathStart = (enemyData.xAxis === "true") ? enemyData.startX : enemyData.startY;
            this.pathLength = enemyData.length;

            if (this.pathXAxis === "true") {
                this.goingLeft = (this.pathDirection === "left");
                this.goingRight = !this.goingLeft;
            }
            else {
                this.goingUp = (this.pathDirection === "up");
                this.goingDown = !this.goingUp;
            }
        }
        
        updateActor() {
            this.updatePathProgress();

            this.updateDirection();
            this.updateSpeed();
            this.updatePosition(true);
            this.updatePosition(false);
        }

        updatePathProgress() {
            var currentProgress = (this.pathXAxis === "true") ? this.location.X : this.location.Y;
            
            if (Math.abs(currentProgress - this.pathStart) > this.pathLength)
                this.switchDirections();
                this.updateSpeed();
        }

        updatePositionOnCollision(collisions, xAxis) {
            var collisionDistances = [];
            for (let i = 0; i < collisions.length; i++) {
                if (collisions[i] instanceof Actor)
                    collisions[i].handleCollidedBy(this);
                collisionDistances.push(collisions[i].getCollisionDistance(this, xAxis));
            }

            var collisionDistance = this.getFarthestCollisions(collisionDistances);

            if (xAxis)
                this.location.X += collisionDistance;
            else
                this.location.Y += collisionDistance;

            this.switchDirections();
            this.updateSpeed();
        }

        switchDirections() {

            if (this.pathXAxis === "true") {
                this.pathDirection = (this.pathDirection === "left") ? "right" : "left";
            }
            else {
                this.pathDirection = (this.pathDirection === "up") ? "down" : "up";
            }
            this.sprite.gotoAndPlay(this.pathDirection);
            
            this.setPathVelocity();
        }
        setPathVelocity() {
            if (this.pathXAxis === "true") {
                this.goingLeft = (this.pathDirection === "left");
                this.goingRight = !this.goingLeft;
            }
            else {
                this.goingUp = (this.pathDirection === "up");
                this.goingDown = !this.goingUp;
            }
            this.updateDirection();
        }

    }
    
    return Enemy;

});