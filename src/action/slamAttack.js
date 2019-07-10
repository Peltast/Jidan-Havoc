define("SlamAttack", ['Attack', 'CollisionBox', 'ActorController'], function(Attack, CollisionBox, ActorController) {
    
    class SlamAttack extends Attack {

        constructor(phases) {
            super(phases);
        }
        
        updateAttack(hostActor) {
            
            if (this.currentPhase ? this.currentPhase.isFinished() : true) {
                this.progressAttack(hostActor);
                if (!this.active)
                    return false;
            }

            if (this.currentIndex == 0 && hostActor.onGround) {
                this.progressAttack(hostActor);
            }

            this.currentPhase.updatePhase();

            return true;
        }

    }

    return SlamAttack;

});
