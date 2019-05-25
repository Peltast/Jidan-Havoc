define("ActorController", ['Point'], function(Point) {
    
    class ActorController {
        
        constructor () {
            
            this.acceleration = .03;
            this.deceleration = .12;
            this.aerialAcc = .02;
            this.aerialDec = .02;
            
            this.maxRunSpeed = 4;
            this.jumpHeight = 80;
            this.shortJumpHeight = 16;
            this.timeToJumpApex = 28;
            
            this.maxJumps = 2;
            this.currentJumps = this.maxJumps;
            
            this.gravity = (2 * this.jumpHeight) / Math.pow(this.timeToJumpApex, 2);
            this.shortJumpVelocity = Math.sqrt(2 * this.gravity * this.shortJumpHeight);
            this.jumpVelocity = this.gravity * this.timeToJumpApex;
            this.glideVelocity = Math.sqrt(2 * this.gravity * this.glideHeight);
            this.maxGravity = this.gravity * 60;
        }

        updateSpeed(actor) {
            
            this.updateHorizontalSpeed(actor);
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