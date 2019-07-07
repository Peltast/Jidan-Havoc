define("ChargeAttack", ['Attack', 'CollisionBox', 'ActorController'], function(Attack, CollisionBox, ActorController) {
    
    class ChargeAttack extends Attack {

        constructor(startUpKey, mainKey, recoveryKey) {
            super(startUpKey, mainKey, recoveryKey);

        }
        initAttack() {

            this.chargeSpeed = this.mainPhase.controller.staticVelocityX;
        }
        
        beginAttack(hostActor) {
            this.active = true;
            this.currentPhase.startPhase(hostActor);
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

            this.currentPhase.updatePhase();

            return true;
        }

    }

    return ChargeAttack;

});
