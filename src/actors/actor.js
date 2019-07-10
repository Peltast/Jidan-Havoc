define("Actor", ['GameObject', 'Point', 'CollisionBox', 'ActorController'], 
function(       GameObject, Point, CollisionBox, ActorController) {

    class Actor extends GameObject {

        constructor(actorSize, spriteData, actorData) {
            super(new Point(0, 0), actorSize, false, spriteData, actorData);

            this.velocity = new Point(0, 0);
            this.targetVelocity = new Point(0, 0);

            this.goingLeft = false;
            this.goingRight = false;
            this.goingUp = false;
            this.onGround = false;
            
            this.priorOrientation = "";
            this.orientation = "right";
            this.state = "";
            this.priorState = "";

            this.controlsLocked = false;
            this.defaultController = new ActorController(controllerData["default"]);
            this.setController(this.defaultController);

            this.displayCollision = false;
            this.particleEffects = [];
            this.hitBoxes = [];
            this.hurtBoxes = [];
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

            if (this.goingLeft && this.currentController.acceptInput) {
                this.targetVelocity.X = -this.currentController.maxRunSpeed;
                this.orientation = "left";
            }
            else if (this.goingRight && this.currentController.acceptInput) {
                this.targetVelocity.X = this.currentController.maxRunSpeed;
                this.orientation = "right";
            }
            else
                this.targetVelocity.X = -this.velocity.X;
        }
        updateSpeed() {
            if (this.currentController) {
                this.currentController.updateSpeed(this);
            }
            else {
                this.velocity.add(this.targetVelocity);
                if (this.velocity.magnitude() > this.currentController.maxRunSpeed)
                    this.velocity.setMagnitude(this.currentController.maxRunSpeed);
            }
        }
        updatePosition(xAxis) {
            if (xAxis)
                this.location.X += this.velocity.X;
            else
                this.location.Y += this.velocity.Y;

            this.location = new Point(Math.floor(this.location.X * 100) / 100, Math.floor(this.location.Y * 100) / 100);
            this.checkHurtbox();
            this.handleCollisions();

            var collisions = currentLevel.checkObjectCollisions(this);
            if (collisions.length > 0)
                this.updatePositionOnCollision(collisions, xAxis);
            else if (!xAxis && this.onGround)
                this.setUnGrounded();
            
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

            if (xAxis) {
                this.location.X += collisionDistance;
                this.velocity.X = 0;
            }
            else
                this.location.Y += collisionDistance;

            if (!xAxis && collisionDistance < 0 && !this.onGround)
                this.setGrounded();
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
        
        setController(newController) {
            this.currentController = newController;
            this.currentController.init(this);
        }

        setGrounded() {
            this.velocity.Y = this.currentController.gravity;
            
            this.onGround = true;
            this.currentController.currentJumps = this.currentController.maxJumps;
            this.state = "";
        }
        setUnGrounded() {
            this.onGround = false;
            if (this.currentController.currentJumps > 0)
                this.currentController.currentJumps -= 1;
            if (this.velocity.Y < 0)
                this.state = "Jump";
            else
                this.state = "Fall";
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

        checkHurtbox() {
            var collisions = [];
            for (let i = 0; i < this.hurtBoxes.length; i++) {
                collisions = collisions.concat(currentLevel.checkHitboxCollisions(this.hurtBoxes[i]));
            }

            if (collisions.length > 0) {
                this.takeDamage();
            }
        }
        takeDamage() {
            // Hook for player/enemies to implement behavior when damaged
        }

        addHitbox(hitboxObj, x, y, width, height, origin) {
            var hitbox;
            if (hitboxObj) {
                hitbox = hitboxObj;
            }
            else {
                var hitbox = new CollisionBox(true, x, y, width, height);
                hitbox.origin = origin;
            }
            hitbox.setVisible(this.displayCollision);

            this.hitBoxes.push(hitbox);
            this.spriteContainer.addChild(hitbox.collisionDisplay);
        }
        addHurtbox(hurtboxObj, x, y, width, height, origin) {
            var hurtbox;
            if (hurtboxObj) { 
                hurtbox = hurtboxObj;
            }
            else {
                var hurtbox = new CollisionBox(false, x, y, width, height);
                hurtbox.origin = origin;
            }
            hurtbox.setVisible(this.displayCollision);

            this.hurtBoxes.push(hurtbox);
            this.spriteContainer.addChild(hurtbox.collisionDisplay);
        }
        removeHitbox(hitbox) {
            var i = this.hitBoxes.indexOf(hitbox);
            if (i >= 0)
                this.hitBoxes.splice(i, 1);

            this.spriteContainer.removeChild(hitbox.collisionDisplay);
        }
        removeHurtbox(hurtbox) {
            var i = this.hurtBoxes.indexOf(hurtbox);
            if (i >= 0)
                this.hurtBoxes.splice(i, 1);

            this.spriteContainer.removeChild(hurtbox.collisionDisplay);
        }
        toggleHitboxDisplays() {
            this.displayCollision = !this.displayCollision;

            this.hitBoxes.forEach((hitbox) => {
                hitbox.toggleDisplay();
            });
            this.hurtBoxes.forEach((hurtbox) => {
                hurtbox.toggleDisplay();
            });
        }


        setActorCoordinates(xCoord, yCoord) {
            this.location = new Point(xCoord * tileSize, yCoord * tileSize);
        }

    }

    return Actor;

});