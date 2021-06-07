define("ActorController", ['Point'], function(Point) {
    
    class ActorController {
        
        constructor(motionData) {
            this.name = motionData["name"];

            this.acceleration = motionData["acceleration"];
            this.deceleration = motionData["deceleration"];
            this.aerialAcc = motionData["aerialAcc"];
            this.aerialDec = motionData["aerialDec"];
            this.maxSpeed = motionData["maxSpeed"];
            
            this.isFlying = motionData["isFlying"] ? motionData["isFlying"] : false;
            this.jumpHeight = motionData["jumpHeight"];
            this.shortJumpHeight = motionData["shortJumpHeight"];
            this.timeToJumpApex = motionData["timeToJumpApex"];
            this.gCoefficient = motionData["gCoefficient"] != undefined ? motionData["gCoefficient"] : 60;
            
            this.maxJumps = motionData["maxJumps"];
            this.currentJumps = this.maxJumps;
            
            this.gravity = (2 * this.jumpHeight) / Math.pow(this.timeToJumpApex, 2);
            this.shortJumpVelocity = Math.sqrt(2 * this.gravity * this.shortJumpHeight);
            this.jumpVelocity = this.gravity * this.timeToJumpApex;
            this.maxGravity = this.gravity * this.gCoefficient;
            
            this.originStaticVelX = motionData["staticVelocityX"];
            this.originStaticVelY = motionData["staticVelocityY"];
            this.staticVelocityX = this.originStaticVelX;
            this.staticVelocityY = this.originStaticVelY;
            
            var forceX = motionData["forceX"] ? motionData["forceX"] : 0;
            var forceY = motionData["forceY"] ? motionData["forceY"] : 0;
            this.originalForce = new Point(forceX, forceY);
            this.force = this.originalForce.get();

            this.resetVelocity = motionData["resetVelocity"] != null ? motionData["resetVelocity"] : false;
            this.resetVerticalVel = motionData["resetVerticalVel"] != null ? motionData["resetVerticalVel"] : false;
            this.acceptInput = motionData["acceptInput"] != null ? motionData["acceptInput"] : true;
            this.locksOrientation = motionData["locksOrientation"] != null ? motionData["locksOrientation"] : false;
            this.inheritJumps = motionData["inheritJumps"] != null ? motionData["inheritJumps"] : true;
            this.setAnimation = motionData["setAnimation"];
        }

        reset() {
            this.currentJumps = this.maxJumps;
        }

        init(actor) {
            
            if (this.resetVelocity)
                actor.velocity = new Point(0, 0);
            else if (this.resetVerticalVel)
                actor.velocity.Y = 0;
            
            actor.velocity.add(this.force);

            if (this.inheritJumps && actor.currentController) {
                if (actor.onGround)
                    this.currentJumps = this.maxJumps;
                else
                    this.currentJumps = Math.min(this.maxJumps, actor.currentController.currentJumps);
            }
        }

        updateSpeed(actor) {
            
            if (this.staticVelocityX)
                actor.velocity.X = this.staticVelocityX;
            else
                this.updateHorizontalSpeed(actor);
            
            if (this.staticVelocityY)
                actor.velocity.Y = this.staticVelocityY;
            else
                this.updateVerticalSpeed(actor);

            actor.velocity.X = Math.round(actor.velocity.X * 1000) / 1000;
            actor.velocity.Y = Math.round(actor.velocity.Y * 1000) / 1000;

            if (Math.abs(actor.velocity.X) <= .01) {
                actor.velocity.X = 0;
            }
            else if (actor.targetVelocity.X == 0 && !actor.goingLeft && !actor.goingRight && Math.abs(actor.velocity.X) <= 0.03) {
                actor.velocity.X = 0;
            }
        }
        updateHorizontalSpeed(actor) {
            var xAcceleration;

            if (actor.onGround || this.isFlying)
                xAcceleration = this.isActorMoving(actor) ? this.acceleration : this.deceleration;
            else
                xAcceleration = this.isActorMoving(actor) ? this.aerialAcc : this.aerialDec;

            actor.velocity.X = this.applyAcceleration(xAcceleration, actor.velocity.X, actor.targetVelocity.X);
        }
        updateVerticalSpeed(actor) {

            if (this.isFlying) {
                
                var yAcceleration = this.isActorMoving(actor) ? this.acceleration : this.deceleration;
                actor.velocity.Y = this.applyAcceleration(yAcceleration, actor.velocity.Y, actor.targetVelocity.Y);
            }
            else if (!actor.onGround) {
                
                actor.velocity.Y += this.gravity;
                actor.velocity.Y = Math.min(actor.velocity.Y, this.maxGravity);
                    
                if (!actor.goingUp && actor.currentAttack === null && actor.velocity.Y < -this.shortJumpVelocity)
                    actor.velocity.Y = -this.shortJumpVelocity;
            }
        }

        applyAcceleration(acc, speed, targetSpeed) {
            var newSpeed = targetSpeed * acc + (1 - acc) * speed;
            newSpeed = Math.min(newSpeed, this.maxSpeed);
            newSpeed = Math.max(newSpeed, -this.maxSpeed);

            return newSpeed;
        }

        flipDirectionalProperties(direction) {
            if (this.originStaticVelX)
                this.staticVelocityX = (direction === "left") ? -this.originStaticVelX : this.originStaticVelX;
            if (this.originalForce)
                this.force.X = (direction === "left") ? -this.originalForce.X : this.originalForce.X;
        }

        isActorMoving(actor) {
            return (actor.goingLeft || actor.goingRight || actor.goingUp || actor.goingDown);
        }

    }

    return ActorController;

});