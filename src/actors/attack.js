define("Attack", ['CollisionBox'], function(CollisionBox) {
    
    class Attack {

        constructor(startUpKey, mainKey, recoveryKey) {

            this.startUpPhase = this.constructAttackPhase(startUpKey);
            this.mainPhase = this.constructAttackPhase(mainKey);
            this.recoveryPhase = this.constructAttackPhase(recoveryKey);

            this.currentPhase = this.startUpPhase;
        }
        constructAttackPhase(phaseName) {
            var phaseData = attackData[phaseName];
            if (!phaseData)
                return null;
            
            var phaseController;
            var phaseHitboxes = [];

            if (phaseData["controller"]) {
                phaseController = controllerData[phaseData["controller"]];
            }
            if (phaseData["hitboxes"]) {
                var phaseHitboxData = phaseData["hitboxes"];
                phaseHitboxData.forEach((hitboxName) => {
                    if (hitBoxData[hitboxName]) {
                        var h = hitBoxData[hitboxName];
                        var hitbox = new CollisionBox(true, h["x"], h["y"], h["width"], h["height"]);
                        phaseHitboxes.push(hitbox);
                    }
                });   
            }

            return new AttackPhase(phaseData["duration"], phaseData["animation"], phaseController, phaseHitboxes);
        }

        updateAttack(hostActor) {
            
            if (!this.currentPhase || this.currentPhase.isFinished()) {
                this.progressAttack(hostActor);
                if (this.currentPhase == this.startPhase)
                    return false;
            }

            this.currentPhase.updatePhase();

            return true;
        }
        progressAttack() {
            if (this.currentPhase == this.startUpPhase) {
                this.currentPhase.endPhase(hostActor);

                this.currentPhase = this.mainPhase;
                this.currentPhase.startPhase(hostActor);
            }
            else if (this.currentPhase == this.mainPhase) {
                this.currentPhase.endPhase(hostActor);

                this.currentPhase = this.recoveryPhase;
                this.currentPhase.startPhase(hostActor);
            }
            else if (this.currentPhase == this.recoveryPhase) {
                this.currentPhase.endPhase(hostActor);
                this.currentPhase = this.startPhase;
            }
        }


    }

    class AttackPhase {

        constructor(duration, animation, controller, hitboxes) {
            this.duration = duration;
            this.animation = animation;
            this.controller = controller;
            this.hitboxes = hitboxes;
            // this.spawnObject = spawnObject;

            this.phaseTimer = this.duration;
        }

        updatePhase() {
            this.phaseTimer -= 1;
        }

        isFinished() {
            return (this.phaseTimer <= 0);
        }

        startPhase(hostActor) {
            this.phaseTimer = this.duration;

            if (this.animation) {
                hostActor.state = this.animation;
            }
            if (this.controller) {
                hostActor.currentController = this.controller;
            }
            if (this.hitboxes) {
                this.hitBoxes.forEach((hitbox) => {
                    hostActor.addHitbox(hitbox);
                });
            }
        }

        endPhase(hostActor) {
            if (this.animation) {
                hostActor.state = "";
            }
            if (this.controller) {
                hostActor.currentController = hostActor.defaultController;
            }
            if (this.hitboxes) {
                this.hitBoxes.forEach((hitbox) => {
                    hostActor.removeHitbox(hitbox);
                });
            }
        }

    }

    return Attack;

});
