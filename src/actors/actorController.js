define("ActorController", ['Point'], function(Point) {
    
    class ActorController {
        
        constructor(motionData) {

            this.acceleration = motionData["acceleration"];
            this.deceleration = motionData["deceleration"];
            this.aerialAcc = motionData["aerialAcc"];
            this.aerialDec = motionData["aerialDec"];
            
            this.maxRunSpeed = motionData["maxRunSpeed"];
            this.jumpHeight = motionData["jumpHeight"];
            this.shortJumpHeight = motionData["shortJumpHeight"];
            this.timeToJumpApex = motionData["timeToJumpApex"];
            this.gCoefficient = motionData["gCoefficient"] ? motionData["gCoefficient"] : 60;
            
            this.maxJumps = motionData["maxJumps"];
            this.currentJumps = this.maxJumps;
            
            this.gravity = (2 * this.jumpHeight) / Math.pow(this.timeToJumpApex, 2);
            this.shortJumpVelocity = Math.sqrt(2 * this.gravity * this.shortJumpHeight);
            this.jumpVelocity = this.gravity * this.timeToJumpApex;
            this.glideVelocity = Math.sqrt(2 * this.gravity * this.glideHeight);
            this.maxGravity = this.gravity * this.gCoefficient;
            
            this.staticVelocityX = motionData["staticVelocityX"];
            this.staticVelocityY = motionData["staticVelocityY"];
            
            var forceX = motionData["forceX"] ? motionData["forceX"] : 0;
            var forceY = motionData["forceY"] ? motionData["forceY"] : 0;
            this.force = new Point(forceX, forceY);

            this.acceptInput = motionData["acceptInput"] != null ? motionData["acceptInput"] : true;
            this.setAnimation = motionData["setAnimation"];
        }

        reset() {
            this.currentJumps = this.maxJumps;
        }

        init(actor) {

            actor.velocity.add(this.force);
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

            if (actor.onGround)
                xAcceleration = (actor.goingLeft || actor.goingRight) ? this.acceleration : this.deceleration;
            else
                xAcceleration = (actor.goingLeft || actor.goingRight) ? this.aerialAcc : this.aerialDec;

            actor.velocity.X = actor.targetVelocity.X * xAcceleration + (1 - xAcceleration) * actor.velocity.X;
            actor.velocity.X = Math.min(actor.velocity.X, this.maxRunSpeed);
            actor.velocity.X = Math.max(actor.velocity.X, -this.maxRunSpeed);
        }
        updateVerticalSpeed(actor) {

            if (!actor.onGround) {
                
                actor.velocity.Y += this.gravity;
                if (actor.velocity.Y > this.maxGravity)
                    actor.velocity.Y = this.maxGravity;
                    
                if (!actor.goingUp && actor.velocity.Y < -this.shortJumpVelocity)
                    actor.velocity.Y = -this.shortJumpVelocity;
            }
        }


    }

    return ActorController;

});