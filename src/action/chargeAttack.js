define("ChargeAttack", ['Attack', 'CollisionBox', 'ActorController'], function(Attack, CollisionBox, ActorController) {
    
    class ChargeAttack extends Attack {

        constructor(phases) {
            super(phases);
        }
        initAttack() {
            this.mainPhase = this.phases[1];
            this.slidePhase = this.phases[2];
            this.knockbackPhase = this.constructAttackPhase("chargeKnockback");

            this.chargeSpeed = this.mainPhase.controller.staticVelocityX;
            this.knockbackSpeed = this.knockbackPhase.controller.staticVelocityX;
        }
        
        beginAttack(hostActor) {
            this.phases[2] = this.slidePhase;
            super.beginAttack(hostActor);
        }

        beginKnockback(player) {
            if (this.currentPhase !== this.mainPhase)
                return;

            this.phases[2] = this.knockbackPhase;
            this.progressAttack(player);
        }

        updateAttack(hostActor) {
            
            if (this.currentPhase ? this.currentPhase.isFinished() : true) {
                this.progressAttack(hostActor);
                if (!this.active)
                    return false;
            }

            if (this.currentPhase == this.slidePhase && !hostActor.onGround) {
                this.currentPhase.phaseTimer = this.currentPhase.duration;
                return true;
            }

            this.currentPhase.updatePhase();

            return true;
        }

    }

    return ChargeAttack;

});
