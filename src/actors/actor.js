define("Actor", ['GameObject', 'Point', 'CollisionBox', 'ActorController'], 
function(       GameObject, Point, CollisionBox, ActorController) {

    class Actor extends GameObject {

        constructor(actorSize, spriteData, actorData) {
            super(new Point(0, 0), actorSize, false, spriteData);

            this.velocity = new Point(0, 0);
            this.targetVelocity = new Point(0, 0);

            this.goingLeft = false;
            this.goingRight = false;
            this.goingUp = false;
            this.goingDown = false;
            this.onGround = false;
            
            this.priorOrientation = "";
            this.orientation = actorData["orientation"] ? actorData["orientation"] : "right";
            
            this.state = "";
            this.priorState = "";
            this.controlsLocked = false;

            this.displayCollision = false;
            this.particleEffects = [];
            this.hitBoxes = [];
            this.hurtBoxes = [];
            this.isImmune = false;
            this.currentAttack = null;

            this.initActorData(actorData);
        }
        initActorData(actorData) {
            if (actorData["controller"])
                this.defaultController = new ActorController(controllerData[actorData["controller"]]);
            else
                this.defaultController = new ActorController(controllerData["default"]);
            this.setController(this.defaultController);
        }

        updateActor() {
            this.updateDirection();
            this.updateSpeed();
            this.updatePosition(true);
            this.updatePosition(false);

            this.updateAttack();
            this.updateState();

            this.updateParticleEffects();
        }
        
        updateDirection() {
            if (this.controlsLocked)
                return;

            if (this.goingLeft && this.currentController.acceptInput) {
                this.targetVelocity.X = -this.currentController.maxSpeed;

                if (!this.currentController.locksOrientation)
                    this.orientation = "left";
            }
            else if (this.goingRight && this.currentController.acceptInput) {
                this.targetVelocity.X = this.currentController.maxSpeed;
                
                if (!this.currentController.locksOrientation)
                    this.orientation = "right";
            }
            else
                this.targetVelocity.X = -this.velocity.X;

            if (this.currentController.isFlying && this.currentController.acceptInput) {
                if (this.goingUp)
                    this.targetVelocity.Y = -this.currentController.maxSpeed;
                else if (this.goingDown)
                    this.targetVelocity.Y = this.currentController.maxSpeed;
            }
        }

        updateAttack() {
            if (!this.currentAttack)
                return;

            if (!this.currentAttack.updateAttack(this)) {
                this.currentAttack = null;
                this.currentController.reset();
            }
        }
        updateState() {
            
            if (!this.frozen)
                this.setMotionState();
            if (this.currentController.setAnimation)
                this.setControllerState();

            this.enactNewState();
        }
        enactNewState() {
            if (this.priorOrientation !== this.orientation || this.priorState !== this.state) {
                this.priorOrientation = this.orientation;

                if (this.state === this.priorState && this.priorState.includes("Flip"))
                    return;
                this.priorState = this.state;

                var animation = this.orientation + this.state;
                if (this.currentController.setAnimation) {
                    if (this.sprite.currentAnimation === this.currentController.setAnimation ||
                        this.sprite.currentAnimation === this.currentController.setAnimation + "End"
                    )
                        return;
                    else
                        animation = this.state;
                }

                this.sprite.gotoAndPlay(animation);
            }
        }
        setMotionState() {
            if (this.state === "" || this.state === "Walk") {
                if (this.targetVelocity.X == 0 && this.targetVelocity.Y == 0)
                    this.state = "";
                else 
                    this.state = "Walk";
            }
        }
        setControllerState() {
            this.state = this.currentController.setAnimation;
        }

        updateSpeed() {
            if (this.currentController) {
                this.currentController.updateSpeed(this);
            }
            else {
                this.velocity.add(this.targetVelocity);
                if (this.velocity.magnitude() > this.currentController.maxSpeed)
                    this.velocity.setMagnitude(this.currentController.maxSpeed);
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
            // Useful when one actor is stationary, and therefore won't detect the collision in their own update cycle.
        }
        updatePositionOnCollision(collisions, xAxis) {
            var collisionDistance = this.getCollisionDistanceByAxis(collisions, xAxis);

            if (xAxis) {
                this.location.X += collisionDistance;
                this.velocity.X = 0;
                this.handleHorizontalCollision();
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
        handleHorizontalCollision() {
            // Hook for extended classes to have unique behavior when colliding on the x-axis
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
            newController.init(this);
            this.currentController = newController;
        }

        setGrounded() {
            if (this.currentController.isFlying)
                return;

            this.velocity.Y = this.currentController.gravity;
            
            this.onGround = true;
            this.currentController.currentJumps = this.currentController.maxJumps;
            this.state = "";
        }
        setUnGrounded() {
            this.onGround = false;
            if (this.currentController.currentJumps > 0)
                this.currentController.currentJumps -= 1;
        }
        
        setFrozen(b) {
            this.frozen = b;

            if (b) {
                this.goingLeft = false;
                this.goingRight = false;
            }
        }

        collideWithObject(object) {
            var collisionX = object.getCollisionDistance(this, true);
            var collisionY = object.getCollisionDistance(this, false);
            
            this.location.add(new Point(collisionX, collisionY));
        }

        setActorDirection(direction, isMoving) {
            if (this.frozen)
                return;

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
        
        addParticleEffectObj(effectObj) {
            currentLevel.foregroundLayer.addChild(effectObj.systemContainer);
            this.particleEffects.push(effectObj);
        }
        addParticleEffectObjToSelf(effectObj) {
            this.spriteContainer.addChild(effectObj.systemContainer);
            this.particleEffects.push(effectObj);
        }
        updateParticleEffects() {
            for (let i = this.particleEffects.length - 1; i >= 0; i--) {
                this.particleEffects[i].updateSystem();

                if (this.particleEffects[i].isFinished) {
                    if (this.spriteContainer.children.includes(this.particleEffects[i]))
                        this.spriteContainer.removeChild(this.particleEffects[i]);
                    else
                        currentLevel.foregroundLayer.removeChild(this.particleEffects[i].systemContainer);
                    
                    this.particleEffects.splice(i, 1);
                }
            }
        }

        checkHurtbox() {
            if (this.isImmune)
                return;

            var collisions = [];
            for (let i = 0; i < this.hurtBoxes.length; i++) {
                collisions = collisions.concat(currentLevel.checkHitboxCollisions(this.hurtBoxes[i]));
            }

            if (collisions.length > 0) {
                this.takeDamage(collisions);
            }
        }
        giveDamage(damageObj) {

        }
        takeDamage(collisions) {
            // Hook for player/enemies to implement behavior when damaged
        }

        addHitbox(hitboxObj, x, y, width, height) {
            var hitbox;
            if (hitboxObj) {
                hitbox = hitboxObj;
            }
            else {
                var hitbox = new CollisionBox(true, x, y, width, height);
            }
            hitbox.setVisible(this.displayCollision);
            hitbox.parentObject = this;

            this.hitBoxes.push(hitbox);
            this.spriteContainer.addChild(hitbox.collisionDisplay);
        }
        addHurtbox(hurtboxObj, x, y, width, height) {
            var hurtbox;
            if (hurtboxObj) { 
                hurtbox = hurtboxObj;
            }
            else {
                var hurtbox = new CollisionBox(false, x, y, width, height);
            }
            hurtbox.setVisible(this.displayCollision);
            hurtbox.parentObject = this;

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
        clearCollisionBoxes() {
            for (let i = 0; i < this.hitBoxes.length; i++) {
                this.spriteContainer.removeChild(this.hitBoxes[i].collisionDisplay);
                this.hitBoxes.splice(i, 1);
                i -= 1;
            }
            for (let j = 0; j < this.hurtBoxes.length; j++) {
                this.spriteContainer.removeChild(this.hurtBoxes[j].collisionDisplay);
                this.hurtBoxes.splice(j, 1);
                j -= 1;
            }
        }


        setActorCoordinates(xCoord, yCoord) {
            this.location = new Point(xCoord * tileSize, yCoord * tileSize);
        }

    }

    return Actor;

});