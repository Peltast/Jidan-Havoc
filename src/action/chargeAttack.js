define("ChargeAttack", ['Attack', 'Point', 'ParticleSystem'], function(Attack, Point, ParticleSystem) {
    
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

            this.hitFloor = false;
        }
        
        beginAttack(hostActor) {
            this.phases[2] = this.slidePhase;
            this.hitFloor = false;
            
            super.beginAttack(hostActor);
        }
        endAttack(hostActor) {
            super.endAttack(hostActor);
        }

        beginKnockback(player) {
            if (this.currentPhase !== this.mainPhase)
                return;
            
            this.phases[2] = this.knockbackPhase;
            this.progressAttack(player);
            
            player.playSound("StunWall", 0.6);
            this.addKnockbackEffect();
        }
        addKnockbackEffect() {

            var knockbackEffect = new ParticleSystem("DirtEffect");
            knockbackEffect.effectAreaOrigin = player.location.get();
            knockbackEffect.effectAreaOrigin.X += player.orientation == "left" ? 0 : player.size.X;
            
            var altVel = (player.orientation == "left") ? "1.5~4.0,-4.0~-0.5" : "-4.0~-1.5,-4.0~-0.5";            
            knockbackEffect.setParticleAltVelocity(altVel);

            currentLevel.addParticleEffect(knockbackEffect);
        }

        updateAttack(hostActor) {

            if (this.currentPhase ? this.currentPhase.isFinished() : true) {
                this.progressAttack(hostActor);

                if (this.currentPhase == this.slidePhase)
                    player.playSound("Miss", 0.5);

                if (!this.active)
                    return false;
            }

            if (this.currentPhase == this.slidePhase && !hostActor.onGround) {
                this.currentPhase.phaseTimer = this.currentPhase.duration;
                return true;
            }
            else if (this.currentPhase == this.slidePhase && hostActor.onGround && !this.hitFloor) {
                this.hitFloor = true;
                player.playSound("StunFloor", 0.5);
            }

            this.currentPhase.updatePhase(hostActor);

            return true;
        }

    }

    return ChargeAttack;

});
