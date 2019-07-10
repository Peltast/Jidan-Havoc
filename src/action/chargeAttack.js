define("ChargeAttack", ['Attack', 'CollisionBox', 'ActorController'], function(Attack, CollisionBox, ActorController) {
    
    class ChargeAttack extends Attack {

        constructor(phases) {
            super(phases);

        }
        initAttack() {
            this.mainPhase = this.phases[1];
            this.chargeSpeed = this.mainPhase.controller.staticVelocityX;
        }
        
        beginAttack(hostActor) {
            this.setOrientation(hostActor.orientation);
            super.beginAttack(hostActor);
        }

        setOrientation(orientation) {
            if (orientation === "left")
                this.mainPhase.controller.staticVelocityX = -this.chargeSpeed;
            else
                this.mainPhase.controller.staticVelocityX = this.chargeSpeed;
        }

        updateAttack(hostActor) {
            
            if (this.currentPhase ? this.currentPhase.isFinished() : true) {
                this.progressAttack(hostActor);
                if (!this.active)
                    return false;
            }

            if (this.currentIndex == 2 && !hostActor.onGround) {
                this.currentPhase.phaseTimer = this.currentPhase.duration;
                return true;
            }

            this.currentPhase.updatePhase();

            return true;
        }

    }

    return ChargeAttack;

});
