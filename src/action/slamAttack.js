define("SlamAttack", ['Attack', 'CollisionBox', 'ActorController'], function(Attack, CollisionBox, ActorController) {
    
    class SlamAttack extends Attack {

        constructor(startUpKey, mainKey, recoveryKey) {
            super(startUpKey, mainKey, recoveryKey);
        }
        
        updateAttack(hostActor) {
            
            if (this.currentPhase ? this.currentPhase.isFinished() : true) {
                this.progressAttack(hostActor);
                if (!this.active)
                    return false;
            }

            if (this.currentPhase === this.mainPhase && hostActor.onGround) {
                this.progressAttack(hostActor);
            }

            this.currentPhase.updatePhase();

            return true;
        }

    }

    return SlamAttack;

});
