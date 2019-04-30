define("Actor", ['GameObject', 'Point'], function(GameObject, Point) {
    
    class Actor extends GameObject {

        constructor(maxSpeed, acceleration, deceleration, actorSize, spriteData, actorData) {
            super(new Point(0, 0), actorSize, false, spriteData, actorData);

            this.maxSpeed = maxSpeed;
            this.acceleration = acceleration;
            this.deceleration = deceleration;
            this.velocity = new Point(0, 0);
            this.targetVelocity = new Point(0, 0);

            this.goingLeft = false;
            this.goingRight = false;
            this.goingUp = false;
            this.goingDown = false;
            this.priorOrientation = "";
            this.orientation = "down";

            this.controlsLocked = false;

            this.particleEffects = [];
        }

        updateActor() {
            this.updateDirection();
            this.updateSpeed();
            this.updatePosition(true);
            this.updatePosition(false);
            this.updateParticleEffects();
        }
        
        updateDirection() {
            if (this.controlsLocked)
                return;

            if (this.goingLeft) {
                this.targetVelocity.X = -this.maxSpeed;
                this.orientation = "left";
            }
            else if (this.goingRight) {
                this.targetVelocity.X = this.maxSpeed;
                this.orientation = "right";
            }
            else
                this.targetVelocity.X = -this.velocity.X;
                
            if (this.goingUp) {
                this.targetVelocity.Y = -this.maxSpeed;
                this.orientation = "up";
            }
            else if (this.goingDown) {
                this.targetVelocity.Y = this.maxSpeed;
                this.orientation = "down";
            }
            else
                this.targetVelocity.Y = -this.velocity.Y;
        }
        updateSpeed() {
            
            this.velocity.add(this.targetVelocity);
            if (this.velocity.magnitude() > this.maxSpeed)
                this.velocity.setMagnitude(this.maxSpeed);
        }
        updatePosition(xAxis) {
            if (xAxis)
                this.location.X += this.velocity.X;
            else
                this.location.Y += this.velocity.Y;
            this.location = new Point(Math.floor(this.location.X * 100) / 100, Math.floor(this.location.Y * 100) / 100);

            this.handleCollisions();
            var collisions = currentLevel.checkObjectCollisions(this);
            if (collisions.length > 0)
                this.updatePositionOnCollision(collisions, xAxis);
            
            if (xAxis)
                this.spriteContainer.x = Math.round(this.location.X);
            else
                this.spriteContainer.y = Math.round(this.location.Y);
        }
        handleCollisions() {
            // Hook into collisions before position is updated, for child classes to overload with custom behavior.
        }
        handleCollidedBy(actor) {
            // Hook into situations when collided by another actor during their own update.
            // Useful when one actor is stationary, and therefore won't detect the collision in their own update.
        }
        updatePositionOnCollision(collisions, xAxis) {
            var collisionDistance = this.getCollisionDistanceByAxis(collisions, xAxis);

            if (xAxis)
                this.location.X += collisionDistance;
            else
                this.location.Y += collisionDistance;
        }
        getCollisionDistanceByAxis(collisions, xAxis, triggerCollisions = true) {
            var collisionDistances = [];

            for (let i = 0; i < collisions.length; i++) {
                if (collisions[i] instanceof Actor && triggerCollisions)
                    collisions[i].handleCollidedBy(this);
                collisionDistances.push(collisions[i].getCollisionDistance(this, xAxis));
            }

            return this.getFarthestCollisions(collisionDistances);
        }
        getCollisionDistanceByManhattan(collisions, triggerCollisions = true) {
            var collisionDistances = [];

            for (let i = 0; i < collisions.length; i++) {
                if (collisions[i] instanceof Actor && triggerCollisions)
                    collisions[i].handleCollidedBy(this);
                collisionDistances.push(collisions[i].getCollisionVector(this));
            }

            return this.getFarthestCollisionVectors(collisionDistances);
        }

        getFarthestCollisions(distances) {
            var maxDistance = 0;
            for (let i = 0; i < distances.length; i++) {
                if (Math.abs(distances[i]) > maxDistance)
                    maxDistance = distances[i];
            }
            return maxDistance;
        }
        getFarthestCollisionVectors(distanceVectors) {
            var maxDistance = 0;

            for (let i = 0; i < distanceVectors.length; i++) {
                var dist = Math.abs(distanceVectors[i].X) + Math.abs(distanceVectors[i].Y);
                if (dist > maxDistance)
                    maxDistance = dist;
            }
            return maxDistance;
        }

        collideWithObject(object) {
            var collisionX = object.getCollisionDistance(this, true);
            var collisionY = object.getCollisionDistance(this, false);
            
            this.location.add(new Point(collisionX, collisionY));
        }

        setActorDirection(direction, isMoving) {
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
        
        addParticleEffect(newEffect) {
            this.spriteContainer.addChild(newEffect.particleContainer);
            this.particleEffects.push(newEffect);
        }
        removeParticleEffect(oldEffect, index) {
            this.spriteContainer.removeChild(oldEffect);
            this.particleEffects.splice(index, 1);
        }
        updateParticleEffects() {
            for (let i = this.particleEffects.length - 1; i >= 0; i--) {
                this.particleEffects[i].updateSystem();
                if (this.particleEffects[i].isFinished)
                    this.removeParticleEffect(this.particleEffects[i], i);
            }
        }


        setActorCoordinates(xCoord, yCoord) {
            this.location = new Point(xCoord * tileSize, yCoord * tileSize);
        }

    }

    return Actor;

});